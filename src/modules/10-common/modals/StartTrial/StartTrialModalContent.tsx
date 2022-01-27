/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Heading, Color, Container, Layout, IconName, Icon, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useUpdateLSDefaultExperience } from '@common/hooks/useUpdateLSDefaultExperience'
import { String, useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { StringsMap } from 'stringTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import ModuleInfoCards, { ModuleInfoCard, getInfoCardsProps } from '@common/components/ModuleInfoCards/ModuleInfoCards'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { Experiences } from '@common/constants/Utils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

export interface StartTrialModalContentProps {
  handleStartTrial?: () => void
  module: Module
}

const StartTrialModalContent: React.FC<StartTrialModalContentProps> = props => {
  const { handleStartTrial, module } = props

  const { getString } = useStrings()
  const { CDNG_ENABLED, FREE_PLAN_ENABLED } = useFeatureFlags()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { source } = useQueryParams<{ source?: string }>()
  const { mutate: updateDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })
  const moduleInfoCards = getInfoCardsProps(accountId, CDNG_ENABLED)[module]
  const initialSelectedInfoCard = moduleInfoCards ? moduleInfoCards[0] : undefined
  const [selectedInfoCard, setSelectedInfoCard] = useState<ModuleInfoCard | undefined>(initialSelectedInfoCard)
  const { licenseInformation } = useLicenseStore()
  const { updateLSDefaultExperience } = useUpdateLSDefaultExperience()

  const getModuleButton = (): React.ReactElement => {
    const handleOnClick = async (): Promise<void> => {
      if (!selectedInfoCard || selectedInfoCard?.isNgRoute) {
        handleStartTrial?.()
      } else if (selectedInfoCard?.route) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (Object.keys(licenseInformation).length === 0) {
          await updateDefaultExperience({
            defaultExperience: Experiences.CG
          })
          updateLSDefaultExperience(Experiences.CG)
        }
        window.location.href = selectedInfoCard.route?.()
        return
      }
    }

    const startTrialDescription = FREE_PLAN_ENABLED ? 'common.startFreePlan' : 'common.startTrial'

    const getButtonText = (): string | undefined => {
      if (source) {
        return getString('continue')
      }
      if (selectedInfoCard?.route) {
        return getString('common.launchFirstGen' as keyof StringsMap, { module: module.toUpperCase() })
      }
      return getString(startTrialDescription, {
        module: module === 'cf' ? 'FF' : module.toUpperCase()
      })
    }

    return (
      <Button
        width={270}
        border={{ radius: 4 }}
        height={2.5}
        font={{ align: 'center' }}
        padding={'medium'}
        intent="primary"
        text={getButtonText()}
        onClick={handleOnClick}
      />
    )
  }

  function getContentHeader(): React.ReactElement {
    const moduleName = module.toLowerCase()

    const title = getString(`${moduleName}.continuous` as keyof StringsMap)
    return (
      <>
        <Heading
          color={Color.BLACK}
          font={{ size: 'large', weight: 'bold' }}
          padding={{ top: 'xxlarge' }}
          margin={{ bottom: 30 }}
        >
          {getString('common.purpose.welcome')}
        </Heading>
        <Layout.Horizontal spacing="small">
          <Icon name={`${moduleName}-main` as IconName} size={25} />
          <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
            {title}
          </Text>
        </Layout.Horizontal>
      </>
    )
  }

  function getWarningBanner(): React.ReactElement | undefined {
    if (selectedInfoCard?.route) {
      const warningText = getString('common.ce.visibilityWarning')

      return (
        <Container
          padding="medium"
          intent="warning"
          flex={{
            justifyContent: 'start'
          }}
          background="yellow100"
          font={{
            align: 'center'
          }}
          border={{
            color: 'yellow500'
          }}
        >
          <Icon name={`deployment-incomplete-new`} size={25} style={{ marginRight: 10 }} />
          <Text color={Color.BLACK}>{warningText}</Text>
        </Container>
      )
    }
  }

  const infoCards = module && (
    <ModuleInfoCards module={module} selectedInfoCard={selectedInfoCard} setSelectedInfoCard={setSelectedInfoCard} />
  )

  const button = getModuleButton()

  const contentHeader = getContentHeader()

  const warningBanner = module === 'ce' ? getWarningBanner() : null

  return (
    <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
      {contentHeader}
      <String
        style={{ lineHeight: 2, fontSize: 'small' }}
        stringID={`common.purpose.${module}.description` as keyof StringsMap}
        useRichText={true}
      />
      {infoCards}
      {warningBanner}
      {button}
    </Layout.Vertical>
  )
}

export default StartTrialModalContent

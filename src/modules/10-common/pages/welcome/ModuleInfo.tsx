/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, Color, Container, Text, Layout, Heading } from '@wings-software/uicore'
import { useUpdateLSDefaultExperience } from '@common/hooks/useUpdateLSDefaultExperience'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Experiences } from '@common/constants/Utils'
import { useToaster } from '@common/components'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { Category, PurposeActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleInfoCards, { ModuleInfoCard, getInfoCardsProps } from '../../components/ModuleInfoCards/ModuleInfoCards'
import css from './WelcomePage.module.scss'

export interface ModuleProps {
  module?: Module
}

const ModuleInfo: React.FC<ModuleProps> = ({ module = 'cd' }) => {
  const [selectedInfoCard, setSelectedInfoCard] = useState<ModuleInfoCard>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const { CDNG_ENABLED } = useFeatureFlags()
  const history = useHistory()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const { mutate: updateDefaultExperience, loading: updatingDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })
  const updatedDefaultExperience = !selectedInfoCard || selectedInfoCard?.isNgRoute ? Experiences.NG : Experiences.CG
  const { updateLSDefaultExperience } = useUpdateLSDefaultExperience()

  const getModuleLink = (moduleLinkArg: Module): React.ReactElement => {
    async function handleUpdateDefaultExperience(): Promise<void> {
      try {
        await updateDefaultExperience({
          defaultExperience: updatedDefaultExperience
        })
        updateLSDefaultExperience(updatedDefaultExperience)
      } catch (error) {
        showError(error.data?.message || getString('somethingWentWrong'))
      }
    }

    if (!selectedInfoCard || selectedInfoCard?.isNgRoute) {
      return (
        <Button
          disabled={updatingDefaultExperience}
          intent="primary"
          className={css.continueButton}
          onClick={() => {
            handleUpdateDefaultExperience().then(() => {
              history.push(routes.toModuleHome({ accountId, module: moduleLinkArg, source: 'purpose' }))
            })
          }}
          data-testid="continueNg"
        >
          {getString('continue')}
        </Button>
      )
    }

    return (
      <Button
        className={css.continueButton}
        intent="primary"
        onClick={async () => {
          trackEvent(PurposeActions.CDCGModuleSelected, { category: Category.SIGNUP, module: ModuleName.CD })
          await handleUpdateDefaultExperience()
          const route = selectedInfoCard.route?.()
          if (route) {
            window.location.href = route
          }
        }}
        data-testid="continueCg"
      >
        {getString('continue')}
      </Button>
    )
  }

  const getModuleInfo = (_module: Module): React.ReactElement => {
    const link = getModuleLink(_module)

    const infoCards = (
      <ModuleInfoCards
        module={_module}
        selectedInfoCard={selectedInfoCard}
        setSelectedInfoCard={setSelectedInfoCard}
        fontColor={Color.BLACK}
      />
    )

    return (
      <Layout.Vertical
        key={_module}
        spacing="large"
        padding={{ bottom: 'xxxlarge', left: 'xxxlarge', right: 'xxxlarge', top: 'small' }}
        className={css.moduleInfoTitle}
      >
        <Layout.Horizontal spacing="small">
          <Heading color={Color.BLACK}>{getString('common.selectAVersion.title')}</Heading>
        </Layout.Horizontal>
        <Text font={{ size: 'normal' }} color={Color.BLACK} margin={{ top: '50px' }}>
          {getString('common.selectAVersion.description')}
        </Text>
        {infoCards}
        {link}
      </Layout.Vertical>
    )
  }

  useEffect(() => {
    const infoCardProps = getInfoCardsProps(accountId, CDNG_ENABLED)[module]

    // Automatically select the first info card if none are selected
    if (!selectedInfoCard && infoCardProps) {
      setSelectedInfoCard(infoCardProps[0])
    }
  }, [module, selectedInfoCard, accountId, CDNG_ENABLED])

  return (
    <Layout.Horizontal className={css.moduleInfo}>
      <Container className={css.moduleInfoRight}>{module && getModuleInfo(module)}</Container>
    </Layout.Horizontal>
  )
}

export default ModuleInfo

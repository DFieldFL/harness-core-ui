import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, Color, Container, Text, Layout } from '@wings-software/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Experiences } from '@common/constants/Utils'
import { useToaster } from '@common/components'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { Category, PurposeActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
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
  const { GTM_CD_ENABLED } = useFeatureFlags()
  const history = useHistory()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const { mutate: updateDefaultExperience, loading: updatingDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })

  const getModuleLink = (_module: Module): React.ReactElement => {
    async function handleUpdateDefaultExperience(): Promise<void> {
      try {
        await updateDefaultExperience({
          defaultExperience: !selectedInfoCard || selectedInfoCard?.isNgRoute ? Experiences.NG : Experiences.CG
        })
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
            trackEvent(PurposeActions.ModuleContinue, { category: Category.SIGNUP, module: _module })
            handleUpdateDefaultExperience().then(() =>
              history.push(routes.toModuleHome({ accountId, module: _module, source: 'purpose' }))
            )
          }}
        >
          {getString('continue')}
        </Button>
      )
    }

    return (
      <div
        className={css.continueButton}
        onClick={async () => {
          await updateDefaultExperience({
            defaultExperience: !selectedInfoCard || selectedInfoCard?.isNgRoute ? Experiences.NG : Experiences.CG
          })

          const route = selectedInfoCard.route?.()

          if (route) {
            window.location.href = route
          }
        }}
      >
        {getString('continue')}
      </div>
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
      >
        <Layout.Horizontal spacing="small">
          <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
            {getString('common.selectAVersion.title')}
          </Text>
        </Layout.Horizontal>
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
          {getString('common.selectAVersion.description')}
        </Text>
        {infoCards}
        {link}
      </Layout.Vertical>
    )
  }

  useEffect(() => {
    const infoCardProps = getInfoCardsProps(accountId, GTM_CD_ENABLED)[module]

    // Automatically select the first info card if none are selected
    if (!selectedInfoCard && infoCardProps) {
      setSelectedInfoCard(infoCardProps[0])
    }
  }, [module, selectedInfoCard, accountId, GTM_CD_ENABLED])

  return (
    <Layout.Horizontal className={css.moduleInfo}>
      <Container className={css.moduleInfoRight}>{module && getModuleInfo(module)}</Container>
    </Layout.Horizontal>
  )
}

export default ModuleInfo

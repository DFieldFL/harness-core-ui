import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useGetModuleLicenseInfo } from 'services/portal'
import bgImageURL from './images/homeIllustration.svg'

const CIHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const moduleLicenseQueryParams = {
    queryParams: {
      accountIdentifier: accountId,
      moduleType: ModuleName.CI
    }
  }
  const { data, error, refetch, loading } = useGetModuleLicenseInfo(moduleLicenseQueryParams)

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal(),
        history.push({
          pathname: routes.toPipelineStudio({
            orgIdentifier: projectData?.orgIdentifier || '',
            projectIdentifier: projectData?.identifier || '',
            pipelineIdentifier: '-1',
            accountId,
            module: 'ci'
          }),
          search: '?modal=trial'
        })
    },
    module: ModuleName.CI
  })

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }
  const { trial } = useQueryParams<{ trial?: boolean }>()

  const history = useHistory()

  if (loading) {
    return <Page.Spinner />
  }

  if (error) {
    return <Page.Error message={error.message} onClick={() => refetch()} />
  }

  if (data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module: 'ci'
      })
    )
  }

  if (data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('ci.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        module={ModuleName.CI}
      />
    )
  }

  // by default will return Home Page
  return (
    <HomePageTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('ci.dashboard.subHeading')}
      documentText={getString('ci.learnMore')}
    />
  )
}

export default CIHomePage

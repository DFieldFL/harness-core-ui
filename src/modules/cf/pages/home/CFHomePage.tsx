import React from 'react'
import { useHistory } from 'react-router-dom'
import { ModuleLandingView } from '@common/exports'
import { ModuleName } from 'framework/exports'
import type { Project } from 'services/cd-ng'
import { routeCIDashboard } from 'navigation/ci/routes'
import i18n from './CFHomePage.i18n'

const CFHomePage: React.FC = () => {
  const history = useHistory()

  return (
    <ModuleLandingView
      module={ModuleName.CF}
      icon="placeholder"
      iconSize={150}
      iconPadding="xxlarge"
      heading={i18n.welcomeToCF}
      subHeading={i18n.description}
      description={i18n.addToExistingProject}
      onProjectCreated={(project: Project) => {
        history.push(
          // TODO: should be used route from CF module?
          routeCIDashboard.url({
            projectIdentifier: project.identifier as string,
            orgIdentifier: project.orgIdentifier as string
          })
        )
      }}
    />
  )
}

export default CFHomePage

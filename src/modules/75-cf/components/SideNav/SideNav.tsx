import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import css from './SideNav.module.scss'

export default function CFSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const module = 'cf'
  const { updateAppStore } = useAppStore()
  const isDev = localStorage.ENABLED_FF_EXPERIMENTS
  const { withActiveEnvironment } = useActiveEnvironment()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CF}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          history.push(
            routes.toCFFeatureFlags({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier || '',
              accountId
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          <SidebarLink
            label={getString('featureFlagsText')}
            to={withActiveEnvironment(routes.toCFFeatureFlags(params))}
          />
          <SidebarLink
            label={getString('cf.shared.targetManagement')}
            to={withActiveEnvironment(routes.toCFTargetManagement(params))}
          />
          <SidebarLink label={getString('environments')} to={withActiveEnvironment(routes.toCFEnvironments(params))} />
          {isDev && (
            <>
              <SidebarLink
                label={getString('executionsText')}
                to={withActiveEnvironment(routes.toDeployments({ ...params, module }))}
              />
              <SidebarLink
                label={getString('pipelines')}
                to={withActiveEnvironment(routes.toPipelines({ ...params, module }))}
              />
            </>
          )}
          {isDev && (
            <SidebarLink
              className={css.onboarding}
              label={getString('cf.shared.getStarted')}
              to={withActiveEnvironment(routes.toCFOnboarding(params))}
            />
          )}
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

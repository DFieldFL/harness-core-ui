import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { isFFPipelinesEnabled } from '@cf/utils/pipelinesEnabled'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'

export default function CFSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { trial } = useQueryParams<{ trial?: boolean }>()
  const events = useFeatureFlagTelemetry()

  /* istanbul ignore next */
  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })

    if (trial) {
      // if select from trial page, forward user to get started page
      history.push({
        pathname: routes.toCFOnboarding({
          orgIdentifier: data?.orgIdentifier || '',
          projectIdentifier: data?.identifier || '',
          accountId
        })
      })
    } else {
      history.push(
        routes.toCFFeatureFlags({
          projectIdentifier: data.identifier,
          orgIdentifier: data.orgIdentifier || '',
          accountId
        })
      )
    }
  }

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector moduleFilter={ModuleName.CF} onSelect={projectSelectHandler} />
      {projectIdentifier && orgIdentifier && (
        <>
          <SidebarLink
            onClick={() => events.visitedPage()}
            label={getString('featureFlagsText')}
            to={withActiveEnvironment(routes.toCFFeatureFlags(params))}
          />
          <SidebarLink
            label={getString('cf.shared.targetManagement')}
            to={withActiveEnvironment(routes.toCFTargetManagement(params))}
          />
          <SidebarLink label={getString('environments')} to={withActiveEnvironment(routes.toCFEnvironments(params))} />

          {isFFPipelinesEnabled() && (
            <SidebarLink
              label={getString('pipelines')}
              to={withActiveEnvironment(routes.toPipelines({ ...params, module: 'cf' }))}
            />
          )}

          <SidebarLink
            label={getString('cf.shared.getStarted')}
            to={withActiveEnvironment(routes.toCFOnboarding(params))}
          />

          <NavExpandable title={getString('common.projectSetup')} route={routes.toSetup(params)}>
            <Layout.Vertical spacing="small">
              <SidebarLink
                to={routes.toAccessControl({ ...params, module: 'cf' })}
                label={getString('accessControl')}
              />
            </Layout.Vertical>
          </NavExpandable>
        </>
      )}
    </Layout.Vertical>
  )
}

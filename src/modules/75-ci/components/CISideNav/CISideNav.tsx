import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { AdminSelector, AdminSelectorLink } from '@common/navigation/AdminSelector/AdminSelector'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function CISideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const module = 'ci'
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const { GIT_SYNC_NG, CI_OVERVIEW_PAGE } = useFeatureFlags()
  const { trial } = useQueryParams<{ trial?: boolean }>()
  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CI}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          // when it's on trial page, forward to pipeline
          if (trial) {
            history.push({
              pathname: routes.toPipelineStudio({
                orgIdentifier: data.orgIdentifier || '',
                projectIdentifier: data.identifier || '',
                pipelineIdentifier: '-1',
                accountId,
                module: 'ci'
              }),
              search: '?modal=trial'
            })
          } else {
            history.push(
              routes.toCIProjectOverview({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || '',
                accountId
              })
            )
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {CI_OVERVIEW_PAGE && <SidebarLink label="Overview" to={routes.toCIProjectOverview(params)} />}
          <SidebarLink label="Builds" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />

          <AdminSelector path={routes.toCIAdmin(params)}>
            <AdminSelectorLink label="Resources" iconName="main-scope" to={routes.toResources({ ...params, module })} />
            {GIT_SYNC_NG ? (
              <AdminSelectorLink
                label={getString('gitManagement')}
                iconName="git-repo"
                to={routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module })}
              />
            ) : null}
            <AdminSelectorLink
              label="Access Control"
              iconName="user"
              to={routes.toAccessControl({ orgIdentifier, projectIdentifier, module, accountId })}
            />
            {/* <AdminSelectorLink label="Template Library" iconName="grid" to="" disabled />
            <AdminSelectorLink label="Governance" iconName="shield" to="" disabled />
            <AdminSelectorLink label="General Settings" iconName="settings" to="" disabled /> */}
          </AdminSelector>
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

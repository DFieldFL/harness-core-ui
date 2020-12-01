import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'

import GitSyncRepoTab from '@gitsync/pages/views/repos/GitSyncRepoTab'
import GitSyncActivities from '@gitsync/pages/views/activities/GitSyncActivities'
import GitSyncEntityTab from '@gitsync/pages/views/entities/GitSyncEntityTab'
import GitSyncErrors from '@gitsync/pages/views/errors/GitSyncErrors'
import SidebarProvider from '@common/navigation/SidebarProvider'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import SessionToken from 'framework/utils/SessionToken'
import GitSyncPage from './pages/GitSyncPage'

const RedirectToGitSyncHome = (): React.ReactElement => {
  const accountId = SessionToken.accountId()

  return <Redirect to={routes.toGitSyncRepos({ accountId })} />
}

export default (
  <Route path="/">
    <SidebarProvider navComponent={AccountSettingsSideNav} subtitle="ACCOUNT" title="Settings">
      <Route exact path={routes.toGitSync({ ...accountPathProps })}>
        <RedirectToGitSyncHome />
      </Route>

      <RouteWithLayout
        path={[
          routes.toGitSyncRepos({ ...accountPathProps }),
          routes.toOrgGitSyncRepos({ ...accountPathProps, ...orgPathProps })
        ]}
        exact
      >
        <GitSyncPage>
          <GitSyncRepoTab />
        </GitSyncPage>
      </RouteWithLayout>

      <RouteWithLayout
        path={[
          routes.toGitSyncActivities({ ...accountPathProps }),
          routes.toOrgGitSyncActivities({ ...accountPathProps, ...orgPathProps })
        ]}
        exact
      >
        <GitSyncPage>
          <GitSyncActivities />
        </GitSyncPage>
      </RouteWithLayout>

      <RouteWithLayout
        path={[
          routes.toGitSyncEntities({ ...accountPathProps }),
          routes.toOrgGitSyncEntities({ ...accountPathProps, ...orgPathProps })
        ]}
        exact
      >
        <GitSyncPage>
          <GitSyncEntityTab />
        </GitSyncPage>
      </RouteWithLayout>

      <RouteWithLayout
        path={[
          routes.toGitSyncErrors({ ...accountPathProps }),
          routes.toOrgGitSyncErrors({ ...accountPathProps, ...orgPathProps })
        ]}
        exact
      >
        <GitSyncPage>
          <GitSyncErrors />
        </GitSyncPage>
      </RouteWithLayout>
    </SidebarProvider>
  </Route>
)

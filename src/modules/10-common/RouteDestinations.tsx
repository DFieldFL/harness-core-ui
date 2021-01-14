import React from 'react'
import { Route, Redirect, useParams } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'

import AdminPage from '@common/pages/AccountSettings/AdminPage'
import GovernancePage from '@common/pages/governance/GovernancePage'
import SessionToken from 'framework/utils/SessionToken'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import type { SidebarContext } from './navigation/SidebarProvider'
import type { AccountPathProps } from './interfaces/RouteInterfaces'
import { EmptyLayout } from './layouts'
import GenericErrorPage from './pages/GenericError/GenericErrorPage'

const RedirectToHome = (): React.ReactElement => {
  const accountId = SessionToken.accountId()

  return <Redirect to={routes.toProjects({ accountId })} />
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toResourcesConnectors(params)} />
}

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings'
}

export default (
  <>
    <Route exact path="/">
      <RedirectToHome />
    </Route>
    <Route exact path={routes.toResources({ ...accountPathProps })}>
      <RedirectToResourcesHome />
    </Route>
    <RouteWithLayout sidebarProps={AccountSettingsSideNavProps} path={routes.toAdmin({ ...accountPathProps })} exact>
      <AdminPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toGovernance({ ...accountPathProps }),
        routes.toOrgGovernance({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <GovernancePage />
    </RouteWithLayout>
    <RouteWithLayout layout={EmptyLayout} path={routes.toGenericError({ ...accountPathProps })}>
      <GenericErrorPage />
    </RouteWithLayout>
  </>
)

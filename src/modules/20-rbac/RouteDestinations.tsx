import React from 'react'

import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  modulePathProps,
  orgPathProps,
  projectPathProps,
  rolePathProps,
  resourceGroupPathProps
} from '@common/utils/routeUtils'

import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import UserGroups from '@rbac/pages/UserGroups/UsersGroups'
import Roles from '@rbac/pages/Roles/Roles'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import RoleDetails from './pages/RoleDetails/RoleDetails'
import ResourceGroupDetails from './pages/ResourceGroupDetails/ResourceGroupDetails'

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings'
}
const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toAccessControl({ ...accountPathProps }),
        routes.toAccessControl({ ...orgPathProps }),
        routes.toAccessControl({ ...projectPathProps }),
        routes.toAccessControl({ ...projectPathProps, ...modulePathProps })
      ]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toUsers({ ...accountPathProps }),
        routes.toUsers({ ...orgPathProps }),
        routes.toUsers({ ...projectPathProps }),
        routes.toUsers({ ...projectPathProps, ...modulePathProps })
      ]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toUserGroups({ ...accountPathProps }),
        routes.toUserGroups({ ...orgPathProps }),
        routes.toUserGroups({ ...projectPathProps }),
        routes.toUserGroups({ ...projectPathProps, ...modulePathProps })
      ]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourceGroups({ ...accountPathProps }),
        routes.toResourceGroups({ ...orgPathProps }),
        routes.toResourceGroups({ ...projectPathProps }),
        routes.toResourceGroups({ ...projectPathProps, ...modulePathProps })
      ]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toRoles({ ...accountPathProps }),
        routes.toRoles({ ...orgPathProps }),
        routes.toRoles({ ...projectPathProps }),
        routes.toRoles({ ...projectPathProps, ...modulePathProps })
      ]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toRoleDetails({ ...accountPathProps, ...rolePathProps }),
        routes.toRoleDetails({ ...orgPathProps, ...rolePathProps }),
        routes.toRoleDetails({ ...projectPathProps, ...rolePathProps }),
        // TODO: MOVE MODULE ROUTES INSIDE THE MODULE
        routes.toRoleDetails({ ...projectPathProps, ...modulePathProps, ...rolePathProps })
      ]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps }),
        routes.toResourceGroupDetails({ ...orgPathProps, ...resourceGroupPathProps }),
        routes.toResourceGroupDetails({ ...projectPathProps, ...resourceGroupPathProps }),
        routes.toResourceGroupDetails({ ...projectPathProps, ...modulePathProps, ...resourceGroupPathProps })
      ]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)

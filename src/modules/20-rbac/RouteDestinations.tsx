import React from 'react'

import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  rolePathProps,
  resourceGroupPathProps,
  userGroupPathProps,
  userPathProps,
  serviceAccountProps
} from '@common/utils/routeUtils'

import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import Roles from '@rbac/pages/Roles/Roles'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import { String } from 'framework/strings'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import { ResourceCategory, ResourceType } from '@common/interfaces/ResourceInterface'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { AccountSideNavProps } from '@common/RouteDestinations'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import ResourceGroupsResourceModalBody from '@rbac/components/ResourceGroupsRenderer/ResourceGroupsResourceModalBody'
import ResourceGroupsResourceRenderer from '@rbac/components/ResourceGroupsRenderer/ResourceGroupsResourceRenderer'
import UserGroupsResourceModalBody from '@rbac/components/UserGroupsRenderer/UserGroupsResourceModalBody'
import UserGroupssResourceRenderer from '@rbac/components/UserGroupsRenderer/UserGroupsResourceRenderer'

RbacFactory.registerResourceCategory(ResourceCategory.SHARED_RESOURCES, {
  icon: 'support-tour',
  label: 'rbac.categoryLabels.sharedResources'
})

RbacFactory.registerResourceCategory(ResourceCategory.ADMINSTRATIVE_FUNCTIONS, {
  icon: 'support-account',
  label: 'adminFunctions'
})

RbacFactory.registerResourceTypeHandler(ResourceType.USER, {
  icon: 'res-users',
  label: 'users',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_USER]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.MANAGE_USER]: <String stringID="rbac.permissionLabels.manage" />,
    [PermissionIdentifier.INVITE_USER]: <String stringID="rbac.permissionLabels.invite" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.USERGROUP, {
  icon: 'res-userGroups',
  label: 'common.userGroups',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_USERGROUP]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.MANAGE_USERGROUP]: <String stringID="rbac.permissionLabels.manage" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <UserGroupsResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <UserGroupssResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.RESOURCEGROUP, {
  icon: 'res-resourceGroups',
  label: 'resourceGroups',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <ResourceGroupsResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <ResourceGroupsResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.ROLE, {
  icon: 'res-roles',
  label: 'roles',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_ROLE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_ROLE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_ROLE]: <String stringID="rbac.permissionLabels.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.AUTHSETTING, {
  icon: 'nav-settings',
  label: 'authSettings.authenticationSettings',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_AUTHSETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_AUTHSETTING]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_AUTHSETTING]: <String stringID="rbac.permissionLabels.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.SERVICEACCOUNT, {
  icon: 'nav-settings',
  label: 'rbac.serviceAccounts.label',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.MANAGE_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.manage" />
  }
})

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  return <Redirect to={routes.toUsers({ accountId })} />
}

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toAccessControl({ ...accountPathProps })} exact>
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toServiceAccounts({ ...accountPathProps })} exact>
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toServiceAccountDetails({ ...accountPathProps, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toUsers({ ...accountPathProps })} exact>
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toUserDetails({ ...accountPathProps, ...userPathProps })}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toUserGroups({ ...accountPathProps })} exact>
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toUserGroupDetails({ ...accountPathProps, ...userGroupPathProps })}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toResourceGroups({ ...accountPathProps })} exact>
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toRoles({ ...accountPathProps })} exact>
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toRoleDetails({ ...accountPathProps, ...rolePathProps })}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps })}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)

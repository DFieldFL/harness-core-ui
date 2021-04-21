import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, connectorPathProps } from '@common/utils/routeUtils'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { String } from 'framework/exports'
import ConnectorResourceModalBody from './components/ConnectorResourceModalBody/ConnectorResourceModalBody'

const RedirectToOrgResourcesHome = (): React.ReactElement => {
  const params = useParams<OrgPathProps>()

  return <Redirect to={routes.toOrgResourcesConnectors(params)} />
}

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings',
  icon: 'nav-settings'
}

RbacFactory.registerResourceTypeHandler(ResourceType.CONNECTOR, {
  icon: 'lock',
  label: 'Connectors',
  category: ResourceCategory.PROJECT_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CONNECTOR]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_CONNECTOR]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CONNECTOR]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_CONNECTOR]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <ConnectorResourceModalBody {...props} />
})

export default (
  <>
    <Route exact path={routes.toOrgResources({ ...accountPathProps, ...orgPathProps })}>
      <RedirectToOrgResourcesHome />
    </Route>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesConnectors({ ...accountPathProps }),
        routes.toOrgResourcesConnectors({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <ResourcesPage>
        <ConnectorsPage />
      </ResourcesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesConnectorDetails({ ...accountPathProps, ...connectorPathProps }),
        routes.toOrgResourcesConnectorDetails({
          ...accountPathProps,
          ...orgPathProps,
          ...connectorPathProps
        })
      ]}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
  </>
)

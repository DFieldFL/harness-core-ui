import React from 'react'
import { Route } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import SidebarProvider from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, connectorPathProps } from '@common/utils/routeUtils'
import AccountSetingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import ResourcesPage from '@common/pages/resources/ResourcesPage'

export default (
  <SidebarProvider navComponent={AccountSetingsSideNav} title="">
    <Route path="/">
      <RouteWithLayout
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
      <RouteWithLayout path={routes.toCreateConnectorFromYaml({ ...accountPathProps })} exact>
        <CreateConnectorFromYamlPage />
      </RouteWithLayout>
    </Route>
  </SidebarProvider>
)

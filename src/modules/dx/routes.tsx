import { Route, ModuleName, PageLayout, SidebarIdentifier } from 'framework/exports'
import React from 'react'
import i18n from './routes.i18n'

export const routeDashboard: Route = {
  sidebarId: SidebarIdentifier.DASHBOARD,
  path: '/dashboard',
  title: i18n.dashboard,
  pageId: 'dashboard',
  url: () => '/dashboard',
  component: React.lazy(() => import('./pages/dashboard/DashboardPage')),
  module: ModuleName.DX
}

export const routeConnectorDetails: Route = {
  module: ModuleName.DX,
  sidebarId: SidebarIdentifier.DEPLOYMENTS,
  layout: PageLayout.DefaultLayout,
  path: '/connector-details',
  title: i18n.connectors,
  pageId: 'connector-details',
  url: () => '/connectors-details',
  component: React.lazy(() => import('./pages/connectors/ConnectorDetailsPage'))
}

import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  projectPathProps,
  cvDataSourceTypePathProps,
  connectorPathProps,
  secretPathProps
} from '@common/utils/routeUtils'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import CVHomePage from '@cv/pages/cv-home/CVHomePage'
import CVDashboardPage from '@cv/pages/dashboard/CVDashboardPage'
import DeploymentDrilldownView from '@cv/pages/dashboard/deployment-drilldown/DeploymentDrilldownView'
import ActivityChangesDrilldownView from '@cv/pages/dashboard/activity-changes-drilldown/ActivityChangesDrilldownView'
import DataSources from '@cv/pages/data-sources/DataSources'
import CVServicesPage from '@cv/pages/services/CVServicesPage'
import DataSourceSetupPage from '@cv/pages/onboarding/setup/DataSourceSetupPage'
import DataSourceProductPage from '@cv/pages/onboarding/data-source-products/DataSourceProductPage'
import SplunkInputType from '@cv/pages/onboarding/splunk-input-type/SplunkInputType'
import DataSourceListEntityPage from '@cv/pages/onboarding/list-entity-select/DataSourceListEntityPage'
import ActivitySourceSetup from '@cv/pages/onboarding/activity-source-setup/ActivitySourceSetup'
import MetricPackConfigure from '@cv/pages/metric-pack/MetricPackConfigure'
import ActivityDashBoardPage from '@cv/pages/activities/dashboard/ActivityDashBoardPage'
import ActivitiesPage from '@cv/pages/activities/ActivitiesPage'
import ActivitySetupPage from '@cv/pages/activity-setup/ActivitySetupPage'
import CVGeneralSettingsPage from '@cv/pages/admin/general-settings/CVGeneralSettingsPage'
import CVGovernancePage from '@cv/pages/admin/governance/CVGovernancePage'
import CVSetupPage from '@cv/pages/admin/setup/CVSetupPage'
import MonitoringSource from '@cv/pages/monitoring-source/MonitoringSource'
import CVAccessControlPage from '@cv/pages/admin/access-control/CVAccessControlPage'
import SidebarProvider from '@common/navigation/SidebarProvider'
import SideNav from '@cv/components/SideNav/SideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import CVActivitySourcesPage from '@cv/pages/admin/activity-sources/CVActivitySourcesPage'
import ResourcesPage from '@cv/pages/Resources/ResourcesPage'
import { useAppStore, ModuleName } from 'framework/exports'
import CVNotificationPage from './pages/admin/notifications/CVNotificationPage'

const RedirectToCVHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCVHome(params)} />
}

const RedirectToCVProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { projects } = useAppStore()

  if (
    projects.find(
      project => project.identifier === params.projectIdentifier && project.modules?.includes(ModuleName.CV)
    )
  ) {
    return <Redirect to={routes.toCVProjectOverview(params)} />
  } else {
    return <Redirect to={routes.toCVHome(params)} />
  }
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCVAdminResourcesConnectors(params)} />
}

export default (
  <Route path={routes.toCV({ ...accountPathProps })}>
    <SidebarProvider navComponent={SideNav} subtitle="CONTINUOUS" title="Vertification">
      <Route path={routes.toCV({ ...accountPathProps })} exact>
        <RedirectToCVHome />
      </Route>

      <RouteWithLayout exact path={routes.toCVHome({ ...accountPathProps })}>
        <CVHomePage />
      </RouteWithLayout>

      <Route path={routes.toCVProject({ ...accountPathProps, ...projectPathProps })} exact>
        <RedirectToCVProject />
      </Route>

      <RouteWithLayout exact path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}>
        <CVDashboardPage />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCVDeploymentPage({
          ...accountPathProps,
          ...projectPathProps,
          serviceIdentifier: ':serviceIdentifier',
          deploymentTag: ':deploymentTag'
        })}
      >
        <DeploymentDrilldownView />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVActivityChangesPage({ ...accountPathProps, ...projectPathProps, activityId: ':activityId' })}
      >
        <ActivityChangesDrilldownView />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVDataSources({ ...accountPathProps, ...projectPathProps })}>
        <DataSources />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}>
        <CVServicesPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVOnBoardingSetup({ ...accountPathProps, ...projectPathProps, ...cvDataSourceTypePathProps })}
      >
        <DataSourceSetupPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVDataSourcesProductPage({
          ...accountPathProps,
          ...projectPathProps,
          ...cvDataSourceTypePathProps
        })}
      >
        <DataSourceProductPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVSplunkInputTypePage({
          ...accountPathProps,
          ...projectPathProps,
          ...cvDataSourceTypePathProps
        })}
      >
        <SplunkInputType />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVDataSourcesEntityPage({
          ...accountPathProps,
          ...projectPathProps,
          ...cvDataSourceTypePathProps
        })}
      >
        <DataSourceListEntityPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={[
          routes.toCVActivitySourceSetup({
            ...accountPathProps,
            ...projectPathProps,
            activitySource: ':activitySource'
          }),
          routes.toCVActivitySourceEditSetup({
            ...accountPathProps,
            ...projectPathProps,
            activitySource: ':activitySource',
            activitySourceId: ':activitySourceId'
          })
        ]}
      >
        <ActivitySourceSetup />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCVMetricPackConfigureThresholdPage({ ...accountPathProps, ...projectPathProps })}
      >
        <MetricPackConfigure />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVActivityDashboard({ ...accountPathProps, ...projectPathProps })}>
        <ActivityDashBoardPage />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVActivities({ ...accountPathProps, ...projectPathProps })}>
        <ActivitiesPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVActivityDetails({ ...accountPathProps, ...projectPathProps, activityType: ':activityType' })}
      >
        <ActivitySetupPage />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVAdminGeneralSettings({ ...accountPathProps, ...projectPathProps })}>
        <CVGeneralSettingsPage />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVAdminGovernance({ ...accountPathProps, ...projectPathProps })}>
        <CVGovernancePage />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVAdminSetup({ ...accountPathProps, ...projectPathProps })}>
        <CVSetupPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        })}
      >
        <MonitoringSource />
      </RouteWithLayout>
      <RouteWithLayout exact path={routes.toCVAdminActivitySources({ ...accountPathProps, ...projectPathProps })}>
        <CVActivitySourcesPage />
      </RouteWithLayout>
      <Route exact path={routes.toCVAdminResources({ ...accountPathProps, ...projectPathProps })}>
        <RedirectToResourcesHome />
      </Route>

      <RouteWithLayout exact path={routes.toCVAdminResourcesConnectors({ ...accountPathProps, ...projectPathProps })}>
        <ResourcesPage>
          <ConnectorsPage />
        </ResourcesPage>
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCVAdminResourcesSecretsListing({ ...accountPathProps, ...projectPathProps })}
      >
        <ResourcesPage>
          <SecretsPage />
        </ResourcesPage>
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCVAdminResourcesConnectorDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...connectorPathProps
        })}
      >
        <ConnectorDetailsPage />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCVAdminResourcesSecretDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...secretPathProps
        })}
      >
        <SecretDetails />
      </RouteWithLayout>

      <RouteWithLayout exact path={routes.toCVAdminAccessControl({ ...accountPathProps, ...projectPathProps })}>
        <CVAccessControlPage />
      </RouteWithLayout>
      <RouteWithLayout
        exact
        path={routes.toCVAdminNotifications({
          ...accountPathProps,
          ...projectPathProps
        })}
      >
        <CVNotificationPage />
      </RouteWithLayout>
    </SidebarProvider>
  </Route>
)

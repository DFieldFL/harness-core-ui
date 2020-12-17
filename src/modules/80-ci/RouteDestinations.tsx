import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import { EmptyLayout } from '@common/layouts'
import {
  accountPathProps,
  projectPathProps,
  pipelinePathProps,
  connectorPathProps,
  secretPathProps,
  buildPathProps
} from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import type { BuildPathProps, PipelinePathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import CIHomePage from '@ci/pages/home/CIHomePage'
import CIDashboardPage from '@ci/pages/dashboard/CIDashboardPage'
import CIBuildList from '@ci/pages/builds/CIBuildsPage'
import CIPipelineStudio from '@ci/pages/pipeline-studio/CIPipelineStudio'
import StageBuilder from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import PipelineYamlView from '@pipeline/components/PipelineStudio/PipelineYamlView/PipelineYamlView'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import SidebarProvider from '@common/navigation/SidebarProvider'
import SideNav from '@ci/components/SideNav/SideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import ResourcesPage from '@ci/pages/Resources/ResourcesPage'
import CIPipelineDeploymentList from '@ci/pages/pipeline-deployment-list/CIPipelineDeploymentList'
import CIBuildPageWithProvider from '@ci/pages/build/CIBuildPage'
import PipelineGraph from '@ci/pages/build/sections/pipeline-graph/BuildPipelineGraph'
import PipelineLog from '@ci/pages/build/sections/pipeline-log/BuildPipelineLog'
import BuildInputs from '@ci/pages/build/sections/inputs/BuildInputs'
import BuildTests from '@ci/pages/build/sections/tests/BuildTests'
import BuildCommits from '@ci/pages/build/sections/commits/BuildCommits'
import BuildArtifacts from '@ci/pages/build/sections/artifacts/BuildArtifacts'
import { useAppStore, ModuleName } from 'framework/exports'

const RedirectToCIHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCIHome(params)} />
}

const RedirectToCIProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { projects } = useAppStore()

  if (
    projects.find(
      project => project.identifier === params.projectIdentifier && project.modules?.includes(ModuleName.CI)
    )
  ) {
    return <Redirect to={routes.toCIProjectOverview(params)} />
  } else {
    return <Redirect to={routes.toCIHome(params)} />
  }
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCIAdminResourcesConnectors(params)} />
}

const RedirectToStudioUI = (): React.ReactElement => {
  const params = useParams<PipelinePathProps>()
  return <Redirect to={routes.toCIPipelineStudioUI(params)} />
}

const RedirectToBuildPipelineGraph = (): React.ReactElement => {
  const params = useParams<ProjectPathProps & BuildPathProps>()
  return <Redirect to={routes.toCIBuildPipelineGraph(params)} />
}

const BuildSubroute = ({ path, component }: { path: string; component: React.ReactElement }): React.ReactElement => {
  return (
    <RouteWithLayout path={path} exact>
      <CIBuildPageWithProvider>{component}</CIBuildPageWithProvider>
    </RouteWithLayout>
  )
}

export default (
  <Route path={routes.toCI({ ...accountPathProps })}>
    <SidebarProvider navComponent={SideNav} subtitle="CONTINUOUS" title="Integration">
      <Route path={routes.toCI({ ...accountPathProps })} exact>
        <RedirectToCIHome />
      </Route>

      <Route path={routes.toCIProject({ ...accountPathProps, ...projectPathProps })} exact>
        <RedirectToCIProject />
      </Route>

      <RouteWithLayout path={[routes.toCIHome({ ...accountPathProps })]} exact>
        <CIHomePage />
      </RouteWithLayout>

      <RouteWithLayout path={routes.toCIProjectOverview({ ...accountPathProps, ...projectPathProps })} exact>
        <CIDashboardPage />
      </RouteWithLayout>

      <RouteWithLayout path={routes.toCIBuilds({ ...accountPathProps, ...projectPathProps })} exact>
        <CIBuildList />
      </RouteWithLayout>

      <Route path={routes.toCIBuild({ ...accountPathProps, ...projectPathProps, ...buildPathProps })} exact>
        <RedirectToBuildPipelineGraph />
      </Route>

      <BuildSubroute
        path={routes.toCIBuildPipelineGraph({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<PipelineGraph />}
      />
      <BuildSubroute
        path={routes.toCIBuildPipelineLog({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<PipelineLog />}
      />
      <BuildSubroute
        path={routes.toCIBuildArtifacts({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildArtifacts />}
      />
      <BuildSubroute
        path={routes.toCIBuildTests({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildTests />}
      />
      <BuildSubroute
        path={routes.toCIBuildInputs({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildInputs />}
      />
      <BuildSubroute
        path={routes.toCIBuildCommits({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildCommits />}
      />

      <RouteWithLayout
        exact
        layout={EmptyLayout}
        path={routes.toCIPipelineStudioUI({ ...accountPathProps, ...pipelinePathProps })}
      >
        <CIPipelineStudio>
          <StageBuilder />
        </CIPipelineStudio>
      </RouteWithLayout>

      <Route exact path={routes.toCIAdminResources({ ...accountPathProps, ...projectPathProps })}>
        <RedirectToResourcesHome />
      </Route>

      <RouteWithLayout exact path={routes.toCIAdminResourcesConnectors({ ...accountPathProps, ...projectPathProps })}>
        <ResourcesPage>
          <ConnectorsPage />
        </ResourcesPage>
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCIAdminResourcesSecretsListing({ ...accountPathProps, ...projectPathProps })}
      >
        <ResourcesPage>
          <SecretsPage />
        </ResourcesPage>
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCIAdminResourcesConnectorDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...connectorPathProps
        })}
      >
        <ConnectorDetailsPage />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCIAdminResourcesSecretDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...secretPathProps
        })}
      >
        <SecretDetails />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        layout={EmptyLayout}
        path={routes.toCIPipelineStudioYaml({ ...accountPathProps, ...pipelinePathProps })}
      >
        <CIPipelineStudio>
          <PipelineYamlView />
        </CIPipelineStudio>
      </RouteWithLayout>

      <Route exact path={routes.toCIPipelineStudio({ ...accountPathProps, ...pipelinePathProps })}>
        <RedirectToStudioUI />
      </Route>

      <RouteWithLayout exact path={routes.toCIPipelines({ ...accountPathProps, ...projectPathProps })}>
        <PipelinesPage />
      </RouteWithLayout>

      <RouteWithLayout
        exact
        path={routes.toCIPipelineDeploymentList({
          ...accountPathProps,
          ...pipelinePathProps
        })}
      >
        <CIPipelineDeploymentList />
      </RouteWithLayout>
    </SidebarProvider>
  </Route>
)

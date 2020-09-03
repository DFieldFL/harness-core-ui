import React from 'react'
import { Route, ModuleName, PageLayout, SidebarIdentifier, routeURL, NestedRoute } from 'framework/exports'
import i18n from './routes.i18n'

export const routeCDHome: Route = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/home',
  title: i18n.cd,
  pageId: 'cd-home',
  url: () => routeURL(routeCDHome, '/cd/home'),
  component: React.lazy(() => import('./pages/home/CDHomePage'))
}

export const routeCDDashboard: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/dashboard/projects/:projectIdentifier',
  title: i18n.cdDashboard,
  pageId: 'cd-dashboard',
  url: ({ projectIdentifier }) => routeURL(routeCDDashboard, `/cd/dashboard/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/dashboard/CDDashboardPage'))
}

export const routeCDDeployments: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/deployments/projects/:projectIdentifier',
  title: i18n.deployments,
  pageId: 'cd-deployments',
  url: ({ projectIdentifier }) => routeURL(routeCDDeployments, `/cd/deployments/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/deployments/CDDeploymentsPage'))
}

export const routeCDPipelines: Route<{ orgIdentifier: string; projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/pipelines/orgs/:orgIdentifier/projects/:projectIdentifier',
  title: i18n.pipelines,
  pageId: 'cd-pipelines',
  url: ({ orgIdentifier, projectIdentifier }) =>
    routeURL(routeCDPipelines, `/cd/pipelines/orgs/${orgIdentifier}/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/pipelines/CDPipelinesPage'))
}

export const routeCDPipelineStudioUI: NestedRoute<{
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string | number
}> = {
  path: '/cd/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/ui/',
  title: i18n.pipelineStudio,
  url: ({ orgIdentifier, projectIdentifier, pipelineIdentifier }) =>
    routeURL(
      routeCDPipelineStudioUI,
      `/cd/pipeline-studio/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/ui/`
    ),
  component: React.lazy(() => import('./pages/pipeline-studio/StageBuilder/StageBuilder')),
  isDefault: true
}

export const routeCDPipelineStudioYaml: NestedRoute<{
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string | number
}> = {
  path: '/cd/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/yaml/',
  title: i18n.pipelineStudio,
  url: ({ orgIdentifier, projectIdentifier, pipelineIdentifier }) =>
    routeURL(
      routeCDPipelineStudioYaml,
      `/cd/pipeline-studio/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/yaml/`
    ),
  component: React.lazy(() => import('./pages/pipeline-studio/PipelineYamlView/PipelineYamlView'))
}

export const routeCDPipelineStudio: Route<{
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string | number
}> = {
  module: ModuleName.CD,
  layout: PageLayout.BlankLayout,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/',
  title: i18n.pipelineStudio,
  pageId: 'cd-pipeline-studio',
  url: ({ orgIdentifier, projectIdentifier, pipelineIdentifier }) =>
    routeURL(
      routeCDPipelineStudio,
      `/cd/pipeline-studio/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/`
    ),
  component: React.lazy(() => import('./pages/pipeline-studio/PipelineStudio')),
  nestedRoutes: [routeCDPipelineStudioYaml, routeCDPipelineStudioUI]
}

export const routeCDResources: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/admin/resources/projects/:projectIdentifier',
  title: i18n.resources,
  pageId: 'cd-admin-resources',
  url: ({ projectIdentifier }) => routeURL(routeCDResources, `/cd/admin/resources/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/admin/resources/CDResourcesPage'))
}

export const routeCDTemplateLibrary: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/admin/template-library/projects/:projectIdentifier',
  title: i18n.templateLibary,
  pageId: 'cd-template-library',
  url: ({ projectIdentifier }) =>
    routeURL(routeCDTemplateLibrary, `/cd/admin/template-library/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/admin/template-library/CDTemplateLibraryPage'))
}

export const routeCDGitSync: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/admin/git-sync/projects/:projectIdentifier',
  title: i18n.gitSync,
  pageId: 'cd-git-sync',
  url: ({ projectIdentifier }) => routeURL(routeCDGitSync, `/cd/admin/git-sync/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/admin/git-sync/CDGitSyncPage'))
}

export const routeCDGovernance: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/admin/governance/projects/:projectIdentifier',
  title: i18n.governance,
  pageId: 'cd-governance',
  url: ({ projectIdentifier }) => routeURL(routeCDGovernance, `/cd/admin/governance/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/admin/governance/CDGovernancePage'))
}

export const routeCDAccessControl: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/admin/access-control/projects/:projectIdentifier',
  title: i18n.accessControl,
  pageId: 'cd-access-control',
  url: ({ projectIdentifier }) =>
    routeURL(routeCDAccessControl, `/cd/admin/access-control/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/admin/access-control/CDAccessControlPage'))
}

export const routeCDGeneralSettings: Route<{ projectIdentifier: string }> = {
  module: ModuleName.CD,
  sidebarId: SidebarIdentifier.CONTINUOUS_DEPLOYMENTS,
  path: '/cd/admin/general-settings/projects/:projectIdentifier',
  title: i18n.generalSettings,
  pageId: 'cd-general-settings',
  url: ({ projectIdentifier }) =>
    routeURL(routeCDGeneralSettings, `/cd/admin/general-settings/projects/${projectIdentifier}`),
  component: React.lazy(() => import('./pages/admin/general-settings/CDGeneralSettingsPage'))
}

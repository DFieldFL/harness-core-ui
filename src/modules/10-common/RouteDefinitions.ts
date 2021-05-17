import { getScopeBasedRoute, withAccountId } from '@common/utils/routeUtils'
import type {
  OrgPathProps,
  ConnectorPathProps,
  SecretsPathProps,
  DelegatePathProps,
  DelegateConfigProps,
  ProjectPathProps,
  PipelinePathProps,
  TriggerPathProps,
  ExecutionPathProps,
  FeatureFlagPathProps,
  BuildPathProps,
  CVDataSourceTypePathProps,
  EnvironmentPathProps,
  AccountPathProps,
  SegmentPathProps,
  PipelineType,
  InputSetPathProps,
  TargetPathProps,
  ModulePathParams,
  RolePathProps,
  ResourceGroupPathProps,
  UserGroupPathProps,
  UserPathProps
} from '@common/interfaces/RouteInterfaces'

const CV_HOME = `/cv/home`

const routes = {
  toHome: withAccountId(() => '/'),
  toSetup: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: ''
      })
    }
  ),
  toUser: withAccountId(() => '/user'),
  toAuthenticationSettings: withAccountId(() => '/setup/authentication'),
  toAccountConfiguration: withAccountId(() => '/setup/authentication/configuration'),
  toAccountActivityLog: withAccountId(() => '/setup/authentication/activity-log'),
  toLogin: (): string => '/login',
  toSignup: (): string => '/signup',
  toPurpose: withAccountId(() => '/purpose'),
  toSettings: withAccountId(() => '/settings'),
  toResources: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  //user profile
  toUserProfile: withAccountId(() => '/user/profile'),
  toUserPreferences: withAccountId(() => '/user/preferences'),
  // account resources
  toCreateConnectorFromYaml: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `/setup/create-connector-from-yaml`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourcesConnectorDetails: withAccountId(
    ({ connectorId }: ConnectorPathProps) => `/setup/resources/connectors/${connectorId}`
  ),
  toResourcesConnectors: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/connectors`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourcesSecrets: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/secrets`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toResourcesSecretDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `resources/secrets/${secretId}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourcesDelegates: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/delegates`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourcesDelegatesDetails: withAccountId(
    ({ delegateId }: DelegatePathProps) => `/setup/resources/delegates/${delegateId}`
  ),
  toResourcesDelegateConfigsDetails: withAccountId(
    ({ delegateConfigId }: DelegateConfigProps) => `/setup/resources/delegateconfigs/${delegateConfigId}`
  ),
  toResourcesEditDelegateConfigsDetails: withAccountId(
    ({ delegateConfigId }: DelegateConfigProps) => `/setup/resources/delegateconfigs/${delegateConfigId}/edit`
  ),
  // org resources
  toOrgResourcesConnectorDetails: withAccountId(
    ({ orgIdentifier, connectorId }: OrgPathProps & ConnectorPathProps) =>
      `/setup/organizations/${orgIdentifier}/resources/connectors/${connectorId}`
  ),
  toOrgResourcesDelegates: withAccountId(
    ({ orgIdentifier }: OrgPathProps) => `/setup/organizations/${orgIdentifier}/resources/delegates`
  ),
  toOrgResourcesDelegateDetails: withAccountId(
    ({ orgIdentifier, delegateId }: OrgPathProps & DelegatePathProps) =>
      `/setup/organizations/${orgIdentifier}/resources/delegates/${delegateId}`
  ),
  toAccessControl: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUsers: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/users`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUserDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      userIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & UserPathProps>) => {
      const path = `access-control/users/${userIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUserGroups: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/user-groups`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUserGroupDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      userGroupIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & UserGroupPathProps>) => {
      const path = `access-control/user-groups/${userGroupIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourceGroups: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/resource-groups`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toRoles: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/roles`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toRoleDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      roleIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & RolePathProps>) => {
      const path = `access-control/roles/${roleIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourceGroupDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      resourceGroupIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & ResourceGroupPathProps>) => {
      const path = `access-control/resource-groups/${resourceGroupIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toOrganizations: withAccountId(() => `/setup/organizations`),
  toOrganizationDetails: withAccountId(({ orgIdentifier }: OrgPathProps) => `/setup/organizations/${orgIdentifier}`),
  toGovernance: withAccountId(() => '/setup/governance'),
  toOrgGovernance: withAccountId(
    ({ orgIdentifier }: OrgPathProps) => `/setup/organizations/governance/${orgIdentifier}`
  ),
  toGenericError: withAccountId(() => '/error'),
  toCreateSecretFromYaml: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/create-secret-from-yaml`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  /********************************************************************************************************************/
  toCD: withAccountId(() => `/cd`),
  toCDDashboard: withAccountId(() => `/cd`),
  toModuleHome: withAccountId(({ module }: ModulePathParams) => `/${module}/home`),
  toModuleTrialHome: withAccountId(({ module }: ModulePathParams) => `/${module}/home/trial`),
  toCDHome: withAccountId(() => `/cd/home`),
  toCDProject: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCDProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toDeployments: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/deployments`
  ),
  toProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toPipelineStudio: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio/`
  ),
  toProjectAdminResourcesConnectorDetails: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      connectorId,
      module
    }: ProjectPathProps & ConnectorPathProps & ModulePathParams) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/connectors/${connectorId}`
  ),
  toCDAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),
  toCDResourcesConnectorDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, connectorId }: ProjectPathProps & ConnectorPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/connectors/${connectorId}`
  ),
  toCDResourcesSecretsListing: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/secrets`
  ),
  toPipelines: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines`
  ),
  toServices: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/services`
  ),
  toPipelineDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}`
  ),
  toRunPipeline: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/runpipeline`
  ),
  toInputSetList: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets`
  ),
  toInputSetForm: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      inputSetIdentifier,
      module
    }: PipelineType<InputSetPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets/${inputSetIdentifier}`
  ),
  toTriggersPage: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers`
  ),
  toTriggersWizardPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      triggerType,
      sourceRepo,
      module
    }: PipelineType<TriggerPathProps>) => {
      const isNewTrigger = triggerIdentifier === 'new'
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}${
        (isNewTrigger && triggerType && `?triggerType=${triggerType}`) || ''
      }${(isNewTrigger && sourceRepo && `&sourceRepo=${sourceRepo}`) || ''}`
    }
  ),
  toPipelineDeploymentList: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions`
  ),
  toTriggersDetailPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      module
    }: PipelineType<TriggerPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/detail`
  ),
  toExecution: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionIdentifier}`
  ),
  toExecutionPipelineView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionIdentifier}/pipeline`
  ),
  toExecutionInputsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionIdentifier}/inputs`
  ),
  toExecutionArtifactsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionIdentifier}/artifacts`
  ),
  toExecutionTestsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionIdentifier}/tests`
  ),
  toExecutionCommitsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionIdentifier}/commits`
  ),
  toCDTemplateLibrary: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/template-library`
  ),
  toCDGovernance: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCDGeneralSettings: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/`
  ),

  /********************************************************************************************************************/
  toCI: (params: Partial<ProjectPathProps>) =>
    params.orgIdentifier && params.projectIdentifier
      ? routes.toCIProject(params as ProjectPathProps)
      : routes.toCIDashboard(params as AccountPathProps),
  toCIDashboard: withAccountId(() => `/ci`),
  toCIHome: withAccountId(() => `/ci/home`),
  toCIProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCIProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCIPipelineDeploymentList: withAccountId(
    ({ projectIdentifier, orgIdentifier, pipelineIdentifier }: PipelinePathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions`
  ),
  toCIBuilds: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds`
  ),
  toCIBuildPipelineGraph: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/pipeline/graph`
  ),
  toCIBuildPipelineLog: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/pipeline/log`
  ),
  toCIBuildInputs: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/inputs`
  ),

  toCIBuildCommits: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/commits`
  ),

  toCIBuildTests: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/tests`
  ),
  toCIBuildArtifacts: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/artifacts`
  ),
  toCIBuild: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}`
  ),
  toCIAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),
  toCIAdminBuildSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/build-settings`
  ),
  toCIAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCIAdminResourcesConnectorDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/connectors/:connectorId`
  ),
  //git-sync at project scope
  toGitSyncAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toGitSyncReposAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync/repos`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toGitSyncEntitiesAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync/entities`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  /********************************************************************************************************************/
  toCF: (params: Partial<ProjectPathProps>) =>
    params.orgIdentifier && params.projectIdentifier
      ? routes.toCFProject(params as ProjectPathProps)
      : routes.toCFDashboard(params as AccountPathProps),
  toCFDashboard: withAccountId(() => `/cf`),
  toCFHome: withAccountId(() => `/cf/home`),
  toCFProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCFProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCFFeatureFlags: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/feature-flags`
  ),
  toCFFeatureFlagsDetail: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      featureFlagIdentifier,
      environmentIdentifier
    }: ProjectPathProps & FeatureFlagPathProps & EnvironmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/feature-flags/${featureFlagIdentifier}/environments/${environmentIdentifier}`
  ),
  toCFSegments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/segments`
  ),
  toCFTargets: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/targets`
  ),
  toCFSegmentDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      segmentIdentifier
    }: ProjectPathProps & SegmentPathProps & EnvironmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/segments/${segmentIdentifier}/environments/${environmentIdentifier}`
  ),
  toCFTargetDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      targetIdentifier
    }: ProjectPathProps & TargetPathProps & EnvironmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/targets/environments/${environmentIdentifier}/target/${targetIdentifier}`
  ),
  toCFEnvironments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/environments`
  ),
  toCFEnvironmentDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, environmentIdentifier }: ProjectPathProps & EnvironmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/environments/${environmentIdentifier}`
  ),
  toCFWorkflows: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/workflows`
  ),
  toCFAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),
  toCFAdminResourcesConnectorDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/connectors/:connectorId`
  ),
  toCFAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCFOnboarding: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding`
  ),
  toCFOnboardingDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding/detail`
  ),
  /********************************************************************************************************************/
  toCV: (params: Partial<ProjectPathProps>): string =>
    params.orgIdentifier && params.projectIdentifier
      ? routes.toCVProject(params as ProjectPathProps)
      : routes.toCVDashboard(params as AccountPathProps),
  toCVDashboard: withAccountId(() => `/cv`),
  toCVHome: withAccountId(() => `/cv/home`),
  toCVProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCVProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCVDeploymentPage: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      deploymentTag,
      serviceIdentifier,
      activityId
    }: Partial<ProjectPathProps & { activityId: string }> & Record<'deploymentTag' | 'serviceIdentifier', string>) =>
      !projectIdentifier || !orgIdentifier
        ? CV_HOME
        : activityId
        ? `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard/deployment/${deploymentTag}/service/${serviceIdentifier}?activityId=${activityId}`
        : `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard/deployment/${deploymentTag}/service/${serviceIdentifier}`
  ),
  toCVActivityChangesPage: withAccountId(
    ({ activityId, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { activityId: string }>) =>
      !activityId || !projectIdentifier || !orgIdentifier
        ? CV_HOME
        : `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard/activity-changes/${activityId}`
  ),
  toCVDataSources: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/datasources`
  ),
  toCVServices: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/services`
  ),
  toCVOnBoardingSetup: withAccountId(
    ({ dataSourceType, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & CVDataSourceTypePathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding/${dataSourceType}/setup`
  ),
  toCVActivitySourceSetup: withAccountId(
    ({ activitySource, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { activitySource?: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup/activity-source-setup/${activitySource}`
  ),
  toCVActivitySourceEditSetup: withAccountId(
    ({
      activitySource,
      projectIdentifier,
      orgIdentifier,
      activitySourceId
    }: Partial<ProjectPathProps & { activitySource?: string; activitySourceId: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup/activity-source-setup/${activitySource}/activity-sourceId/${activitySourceId}`
  ),
  toCVActivityDashboard: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/activities/dashboard`
  ),
  toCVAdminActivitySources: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/activity-sources`
  ),
  toCVAdminMonitoringSources: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/monitoring-sources`
  ),
  toCVAdminVerificationJobs: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/verification-jobs`
  ),
  toCVActivityDetails: withAccountId(
    ({ activityType, orgIdentifier, projectIdentifier }: ProjectPathProps & { activityType: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/activities/setup/${activityType}`
  ),
  toCVAdminGeneralSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/general-settings`
  ),
  toCVAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCVAdminSetup: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup`
  ),
  toCVAdminSetupMonitoringSource: withAccountId(
    ({ projectIdentifier, orgIdentifier, monitoringSource }: ProjectPathProps & { monitoringSource: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup/monitoring-source/${monitoringSource}`
  ),
  toCVAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),
  toCVAdminSetupMonitoringSourceEdit: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      monitoringSource,
      identifier
    }: ProjectPathProps & { monitoringSource: string; identifier: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup/monitoring-source/${monitoringSource}/${identifier}`
  ),
  toCVAdminSetupVerificationJob: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup/verification-job`
  ),
  toCVAdminSetupVerificationJobEdit: withAccountId(
    ({ projectIdentifier, orgIdentifier, verificationId }: ProjectPathProps & { verificationId: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/setup/verification-job/verificationId/${verificationId}`
  ),
  toCVAdminResourcesConnectorDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/connectors/:connectorId`
  ),
  toCVAdminAccessControl: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/access-control`
  ),
  toCVAdminNotifications: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/notifications`
  ),
  /********************************************************************************************************************/
  toProjectDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/orgs/${orgIdentifier}/projects/${projectIdentifier}/details`
  ),
  toProjectResourcesConnectorDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/projects/${projectIdentifier}/orgs/${orgIdentifier}/setup/resources/connectors/:connectorId`
  ),
  toProjectResourcesDelegatesDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier, delegateId }: ProjectPathProps & DelegatePathProps) =>
      `/projects/${projectIdentifier}/orgs/${orgIdentifier}/setup/resources/delegates/${delegateId}`
  ),
  toProjectResourcesDelegateConfigsDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier, delegateConfigId }: ProjectPathProps & DelegateConfigProps) =>
      `/projects/${projectIdentifier}/orgs/${orgIdentifier}/setup/resources/delegateconfigs/${delegateConfigId}`
  ),
  toProjects: withAccountId(() => '/projects'),
  toProjectsGetStarted: withAccountId(() => '/get-started'),
  /********************************************************************************************************************/
  toCE: (params: Partial<ProjectPathProps>) =>
    params.orgIdentifier && params.projectIdentifier
      ? routes.toCECORules(params as ProjectPathProps)
      : routes.toCEDashboard(params as AccountPathProps),
  toCEDashboard: withAccountId(() => `/ce`),
  toCEHome: withAccountId(() => '/ce/home'),
  toCEProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCEProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCECODashboard: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCECOCreateGateway: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/autostopping-rules/create`
  ),
  toCECOEditGateway: withAccountId(
    ({ orgIdentifier, projectIdentifier, gatewayIdentifier }: ProjectPathProps & { gatewayIdentifier: string }) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/autostopping-rules/edit/${gatewayIdentifier}`
  ),
  toCECOAccessPoints: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/access-points`
  ),
  toCECORules: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/autostopping-rules`
  ),
  toCERecommendations: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/recommendations`
  ),
  toCERecommendationDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, recommendation }: ProjectPathProps & { recommendation: string }) =>
      `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}/recommendations/${recommendation}/details`
  ),
  toCEBudgets: withAccountId(() => '/ce/budgets'),
  /********************************************************************************************************************/
  toCustomDasboard: withAccountId(() => '/dashboards'),
  toCustomDasboardHome: withAccountId(() => '/dashboards/home'),
  toViewCustomDashboard: withAccountId(({ viewId }: { viewId: string }) => `/dashboards/view/${viewId}`),

  /****************** Secret Usage************************************************************************************/
  toModuleAdminResourcesSecretDetails: withAccountId(
    ({ projectIdentifier, orgIdentifier, secretId, module }: ProjectPathProps & SecretsPathProps & ModulePathParams) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/secrets/${secretId}`
  ),

  toResourcesSecretDetailsOverview: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `resources/secrets/${secretId}/overview`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourcesSecretDetailsReferences: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `resources/secrets/${secretId}/references`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  )
}

export default routes

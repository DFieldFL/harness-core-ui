import qs from 'qs'
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
  UserPathProps,
  PipelineStudioQueryParams,
  RunPipelineQueryParams,
  GitQueryParams,
  ModuleHomeParams,
  InputSetGitQueryParams,
  ModuleCardPathParams,
  ServiceAccountPathProps,
  ServicePathProps
} from '@common/interfaces/RouteInterfaces'

const CV_HOME = `/cv/home`

const routes = {
  toHome: withAccountId(() => '/home'),
  toGenericError: withAccountId(() => '/error'),
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
  toSubscriptions: withAccountId(({ moduleCard }: ModuleCardPathParams) => {
    if (moduleCard) {
      return `/home/setup/subscriptions?moduleCard=${moduleCard}`
    }
    return '/home/setup/subscriptions'
  }),
  toAuthenticationSettings: withAccountId(() => '/home/setup/authentication'),
  toAccountConfiguration: withAccountId(() => '/home/setup/authentication/configuration'),
  toAccountActivityLog: withAccountId(() => '/home/setup/authentication/activity-log'),
  toLogin: (): string => '/login',
  toRedirect: (): string => `/redirect`,
  toSignup: (): string => '/signup',
  toPurpose: withAccountId(() => '/purpose'),
  //user profile
  toUserProfile: withAccountId(() => '/user/profile'),
  toUserPreferences: withAccountId(() => '/user/preferences'),
  // account resources
  toCreateConnectorFromYaml: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `connectors/yaml/create-connector`
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
  toConnectors: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `connectors`
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
  toConnectorDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      connectorId,
      module
    }: Partial<ProjectPathProps & ModulePathParams & ConnectorPathProps>) => {
      const path = `connectors/${connectorId}`
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
  toSecrets: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `secrets`
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

  toSecretDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `secrets/${secretId}`
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
  toDelegates: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `delegates`
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
  toDelegatesDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      delegateId,
      module
    }: Partial<ProjectPathProps & ModulePathParams & DelegatePathProps>) => {
      const path = `delegates/${delegateId}`
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
  toDelegateConfigsDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      delegateConfigIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & DelegateConfigProps>) => {
      const path = `delegateconfigs/${delegateConfigIdentifier}`
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
  toEditDelegateConfigsDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      delegateConfigIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & DelegateConfigProps>) => {
      const path = `delegateconfigs/${delegateConfigIdentifier}/edit`
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
  toServiceAccounts: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/service-accounts`
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
  toServiceAccountDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      serviceAccountIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & ServiceAccountPathProps>) => {
      const path = `access-control/service-accounts/${serviceAccountIdentifier}`
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
  toOrganizations: withAccountId(() => `/home/setup/organizations`),
  toOrganizationDetails: withAccountId(
    ({ orgIdentifier }: OrgPathProps) => `/home/organizations/${orgIdentifier}/details`
  ),
  toGovernance: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `governance`
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
  toCreateSecretFromYaml: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `secrets/yaml/create-secret`
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
  toSecretDetailsOverview: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `secrets/${secretId}/overview`
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
  toSecretDetailsReferences: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `secrets/${secretId}/references`
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
  toModuleHome: withAccountId(({ module, source }: ModuleHomeParams) => {
    if (source) {
      return `/${module}/home?source=${source}`
    }
    return `/${module}/home`
  }),
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
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & PipelineStudioQueryParams & RunPipelineQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio/?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio/`
      }
    }
  ),
  toPipelines: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines`
  ),
  toServices: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/services`
  ),
  toServiceDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, serviceId, module }: PipelineType<ProjectPathProps & ServicePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/services/${serviceId}`
  ),
  toPipelineDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}`
  ),
  toInputSetList: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & GitQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets`
      }
    }
  ),
  toInputSetForm: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      inputSetIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<InputSetPathProps> & InputSetGitQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets/${inputSetIdentifier}?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets/${inputSetIdentifier}`
      }
    }
  ),
  toTriggersPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & GitQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers`
      }
    }
  ),
  toTriggersWizardPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      triggerType,
      sourceRepo,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<TriggerPathProps> & GitQueryParams) => {
      const isNewTrigger = triggerIdentifier === 'new'
      const queryParams = {
        ...rest,
        ...(isNewTrigger && triggerType && { triggerType }),
        ...(isNewTrigger && sourceRepo && { sourceRepo })
      }
      const queryString = qs.stringify(queryParams, { skipNulls: true })
      if (queryString.length > 0) {
        return `${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}?${queryString}`
      } else {
        return `${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}`
      }
    }
  ),
  toPipelineDeploymentList: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & GitQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions`
      }
    }
  ),
  toTriggersDetailPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<TriggerPathProps> & GitQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/detail?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/detail`
      }
    }
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
  toCDGeneralSettings: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cd/orgs/${orgIdentifier}/projects/${projectIdentifier}/`
  ),
  /********************************************************************************************************************/
  toTemplatesListing: withAccountId(({ orgIdentifier }: OrgPathProps) => `/orgs/${orgIdentifier}/templates`),
  /********************************************************************************************************************/
  toCI: withAccountId(() => `/ci`),
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
    ({ orgIdentifier, projectIdentifier, featureFlagIdentifier }: ProjectPathProps & FeatureFlagPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/feature-flags/${featureFlagIdentifier}`
  ),
  toCFTargetManagement: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management`
  ),
  toCFSegments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/target-groups`
  ),
  toCFTargets: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/targets`
  ),
  toCFSegmentDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, segmentIdentifier }: ProjectPathProps & SegmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/target-groups/${segmentIdentifier}`
  ),
  toCFTargetDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, targetIdentifier }: ProjectPathProps & TargetPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/targets/${targetIdentifier}`
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
  toCVMonitoringServices: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices`
  ),
  toCVAddMonitoringServicesSetup: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { identifier: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices/setup`
  ),
  toCVAddMonitoringServicesEdit: withAccountId(
    ({ projectIdentifier, orgIdentifier, identifier }: Partial<ProjectPathProps & { identifier: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices/edit/${identifier}`
  ),
  toCVOnBoardingSetup: withAccountId(
    ({ dataSourceType, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & CVDataSourceTypePathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding/${dataSourceType}/setup`
  ),
  toCVActivitySourceSetup: withAccountId(
    ({ activitySource, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { activitySource?: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/activity-source-setup/${activitySource}`
  ),
  toCVActivitySourceEditSetup: withAccountId(
    ({
      activitySource,
      projectIdentifier,
      orgIdentifier,
      activitySourceId
    }: Partial<ProjectPathProps & { activitySource?: string; activitySourceId: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/activity-source-setup/${activitySource}/activity-sourceId/${activitySourceId}`
  ),
  toCVActivityDashboard: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/activities/dashboard`
  ),
  toCVAdminActivitySources: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/activity-sources`
  ),
  toCVAdminMonitoringSources: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/monitoring-sources`
  ),
  toCVAdminVerificationJobs: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/verification-jobs`
  ),
  toCVActivityDetails: withAccountId(
    ({ activityType, orgIdentifier, projectIdentifier }: ProjectPathProps & { activityType: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/activities/admin/${activityType}`
  ),
  toCVAdminGeneralSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/general-settings`
  ),
  toCVAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCVAdminSetup: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup`
  ),
  toCVAdminSetupMonitoringSource: withAccountId(
    ({ projectIdentifier, orgIdentifier, monitoringSource }: ProjectPathProps & { monitoringSource: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/monitoring-source/${monitoringSource}`
  ),
  toCVAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin`
  ),
  toCVAdminSetupMonitoringSourceEdit: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      monitoringSource,
      identifier
    }: ProjectPathProps & { monitoringSource: string; identifier: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/monitoring-source/${monitoringSource}/${identifier}`
  ),
  toCVAdminSetupVerificationJob: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/verification-job`
  ),
  toCVAdminSetupVerificationJobEdit: withAccountId(
    ({ projectIdentifier, orgIdentifier, verificationId }: ProjectPathProps & { verificationId: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/verification-job/verificationId/${verificationId}`
  ),
  toCVAdminAccessControl: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/access-control`
  ),
  toCVAdminNotifications: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/notifications`
  ),
  /********************************************************************************************************************/
  toProjectDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/details`
  ),
  toProjects: withAccountId(() => '/home/projects'),
  toGetStarted: withAccountId(() => '/home/get-started'),
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
  toPerspectiveDetails: withAccountId(
    ({ perspectiveId, perspectiveName }: AccountPathProps & { perspectiveId: string; perspectiveName: string }) =>
      `/ce/perspective/${perspectiveId}/name/${perspectiveName}`
  ),
  toCECreatePerspective: withAccountId(
    ({ perspectiveId }: AccountPathProps & { perspectiveId: string }) => `/ce/perspective/${perspectiveId}/create`
  ),
  toCEPerspectives: withAccountId(() => `/ce/perspectives`),
  toCEBudgets: withAccountId(() => '/ce/budgets'),
  /********************************************************************************************************************/
  toCustomDasboard: withAccountId(() => '/home/dashboards'),
  toViewCustomDashboard: withAccountId(({ viewId }: { viewId: string }) => `/home/dashboards/view/${viewId}`)

  /****************** Secret Usage************************************************************************************/
}

export default routes

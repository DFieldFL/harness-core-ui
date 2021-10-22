import type { EntityGitDetails } from 'services/pipeline-ng'

export interface AccountPathProps {
  accountId: string
}

export interface OrgPathProps extends AccountPathProps {
  orgIdentifier: string
}

export interface GitQueryParams {
  branch?: EntityGitDetails['branch']
  repoIdentifier?: EntityGitDetails['repoIdentifier']
}

export interface InputSetGitQueryParams extends GitQueryParams {
  inputSetBranch?: EntityGitDetails['branch']
  inputSetRepoIdentifier?: EntityGitDetails['repoIdentifier']
}
export interface PipelineStudioQueryParams extends GitQueryParams, RunPipelineQueryParams {
  stageId?: string
  stepId?: string
}
export interface RunPipelineQueryParams extends GitQueryParams, InputSetGitQueryParams {
  runPipeline?: boolean
  executionId?: string
  inputSetType?: string
  inputSetLabel?: string
  inputSetValue?: string
  stagesExecuted?: string[]
}

export interface ProjectPathProps extends OrgPathProps {
  projectIdentifier: string
  stageId?: string
  stepId?: string
}

export interface PipelinePathProps extends ProjectPathProps {
  pipelineIdentifier: string
}

export type TemplateType =
  | 'Step'
  | 'Stage'
  | 'Pipeline'
  | 'Service'
  | 'Infrastructure'
  | 'StepGroup'
  | 'Execution'
  | ':templateType(Step)'
  | ':templateType(Stage)'
  | ':templateType(Pipeline)'
  | ':templateType(Service)'
  | ':templateType(Infrastructure)'
  | ':templateType(StepGroup)'
  | ':templateType(Execution)'
  | ':templateType'

export interface TemplateStudioPathProps extends ProjectPathProps {
  templateType: TemplateType
  templateIdentifier: string
}
export interface InputSetPathProps extends PipelinePathProps {
  inputSetIdentifier: string
}
export interface TriggerPathProps extends PipelinePathProps {
  triggerIdentifier: string
  triggerType?: string
  sourceRepo?: string
  artifactType?: string
  manifestType?: string
}

export interface ExecutionPathProps extends PipelinePathProps {
  executionIdentifier: string
}

export interface BuildPathProps extends ProjectPathProps {
  buildIdentifier: string
}

export interface ConnectorPathProps {
  connectorId: string
}

export interface VerificationPathProps {
  verificationId: string
}
export interface SecretsPathProps {
  secretId: string
}
export interface RolePathProps {
  roleIdentifier: string
}
export interface ResourceGroupPathProps {
  resourceGroupIdentifier: string
}
export interface DelegatePathProps {
  delegateIdentifier: string
}

export interface DelegateConfigProps {
  delegateConfigIdentifier: string
}

export interface FeatureFlagPathProps {
  featureFlagIdentifier: string
}

export interface SegmentPathProps {
  segmentIdentifier: string
}
export interface TargetPathProps {
  targetIdentifier: string
}

export interface EnvironmentPathProps {
  environmentIdentifier: string
}

export interface CVDataSourceTypePathProps {
  dataSourceType: string
}

export interface ServicePathProps {
  serviceId: string
}

export type Module =
  | 'ci'
  | 'cd'
  | 'cf'
  | 'cv'
  | 'ce'
  | ':module(ci)'
  | ':module(cd)'
  | ':module(cf)'
  | ':module'
  | ':module(cv)'

export interface ModulePathParams {
  module: Module
}

export type ModuleHomeParams = {
  module: Module
  source?: string
}

export type PipelineType<T> = T & ModulePathParams

export type PathFn<T> = (props: AccountPathProps & T) => string

export interface ResourceGroupDetailsPathProps extends ProjectPathProps {
  resourceGroupIdentifier: string
}

export interface UserGroupPathProps {
  userGroupIdentifier: string
}

export interface UserPathProps {
  userIdentifier: string
}

export interface ServiceAccountPathProps {
  serviceAccountIdentifier: string
}

export interface SubscriptionQueryParams {
  moduleCard?: Module
  tab?: 'OVERVIEW' | 'PLANS' | 'BILLING'
}

export interface TemplateStudioQueryParams {
  versionLabel?: string
}
export interface AgentOverViewPathProps {
  agentId: string
}

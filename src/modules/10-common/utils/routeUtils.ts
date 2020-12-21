import type {
  AccountPathProps,
  OrgPathProps,
  ProjectPathProps,
  PipelinePathProps,
  TriggerPathProps,
  ExecutionPathProps,
  ConnectorPathProps,
  SecretsPathProps,
  PipelineType,
  FeatureFlagPathProps,
  SegmentPathProps,
  CVDataSourceTypePathProps,
  BuildPathProps,
  EnvironmentPathProps,
  DelegatePathProps,
  InputSetPathProps,
  VerificationPathProps
} from '@common/interfaces/RouteInterfaces'

export const accountPathProps: AccountPathProps = {
  accountId: ':accountId'
}

export const orgPathProps: OrgPathProps = {
  ...accountPathProps,
  orgIdentifier: ':orgIdentifier'
}

export const projectPathProps: ProjectPathProps = {
  ...orgPathProps,
  projectIdentifier: ':projectIdentifier'
}

export const pipelinePathProps: PipelinePathProps = {
  ...projectPathProps,
  pipelineIdentifier: ':pipelineIdentifier'
}

export const inputSetFormPathProps: InputSetPathProps = {
  ...pipelinePathProps,
  inputSetIdentifier: ':inputSetIdentifier'
}

export const triggerPathProps: TriggerPathProps = {
  ...pipelinePathProps,
  triggerIdentifier: ':triggerIdentifier'
}

export const executionPathProps: ExecutionPathProps = {
  ...pipelinePathProps,
  executionIdentifier: ':executionIdentifier'
}

export const connectorPathProps: ConnectorPathProps = {
  connectorId: ':connectorId'
}
export const verificationPathProps: VerificationPathProps = {
  verificationId: ':verificationId'
}

export const secretPathProps: SecretsPathProps = {
  secretId: ':secretId'
}

export const delegatePathProps: DelegatePathProps = {
  delegateId: ':delegateId'
}

export const pipelineModuleParams: Record<keyof PipelineType<{}>, 'ci' | 'cd' | ':module'> = {
  module: ':module'
}

export const featureFlagPathProps: FeatureFlagPathProps = {
  featureFlagIdentifier: ':featureFlagIdentifier'
}

export const cvDataSourceTypePathProps: CVDataSourceTypePathProps = {
  dataSourceType: ':dataSourceType'
}

export const buildPathProps: BuildPathProps = {
  ...projectPathProps,
  buildIdentifier: ':buildIdentifier'
}

export const environmentPathProps: EnvironmentPathProps = {
  environmentIdentifier: ':environmentIdentifier'
}

export const segmentPathProps: SegmentPathProps = {
  segmentIdentifier: ':segmentIdentifier'
}

export function withAccountId<T>(fn: (args: T) => string) {
  return (params: T & { accountId: string }) => {
    const path = fn(params)

    return `/account/${params.accountId}/${path.replace(/^\//, '')}`
  }
}

export function withOrgIdentifier<T>(fn: (args: T) => string) {
  return (params: T & { orgIdentifier: string }) => {
    const path = fn(params)

    return `/orgs/${params.orgIdentifier}/${path.replace(/^\//, '')}`
  }
}

export function withProjectIdentifier<T>(fn: (args: T) => string) {
  return (params: T & { projectIdentifier: string }) => {
    const path = fn(params)

    return `/orgs/${params.projectIdentifier}/${path.replace(/^\//, '')}`
  }
}

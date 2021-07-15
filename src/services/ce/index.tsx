/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0'
export interface AwsAccountConnectionDetail {
  cloudFormationTemplateLink?: string
  externalId?: string
  harnessAccountId?: string
  stackLaunchTemplateLink?: string
}

export interface CEReportSchedule {
  accountId?: string
  createdAt?: number
  createdBy?: EmbeddedUser
  description?: string
  enabled?: boolean
  lastUpdatedAt?: number
  lastUpdatedBy?: EmbeddedUser
  name?: string
  nextExecution?: string
  recipients?: string[]
  userCron?: string
  uuid?: string
  viewsId: string[]
}

export interface CEView {
  accountId?: string
  createdAt?: number
  createdBy?: EmbeddedUser
  dataSources?: ('CLUSTER' | 'AWS' | 'GCP' | 'AZURE' | 'COMMON' | 'CUSTOM' | 'LABEL')[]
  lastUpdatedAt?: number
  lastUpdatedBy?: EmbeddedUser
  name?: string
  totalCost?: number
  uuid?: string
  viewRules?: ViewRule[]
  viewState?: 'DRAFT' | 'COMPLETED'
  viewTimeRange?: ViewTimeRange
  viewType?: 'SAMPLE' | 'CUSTOMER' | 'DEFAULT_AZURE'
  viewVersion?: string
  viewVisualization?: ViewVisualization
}

export interface EmbeddedUser {
  email?: string
  name?: string
  uuid?: string
}

export interface GraphQLQuery {
  operationName?: string
  query?: string
  variables?: {
    [key: string]: { [key: string]: any }
  }
}

export interface K8sClusterSetupRequest {
  connectorIdentifier?: string
  featuresEnabled?: ('BILLING' | 'OPTIMIZATION' | 'VISIBILITY')[]
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface QueryStat {
  avgExecutionTime?: number
  count?: number
  maxExecutionTime?: number
  secondMaxExecutionTime?: number
}

export interface Response {
  correlationId?: string
  data?: { [key: string]: any }
  metaData?: { [key: string]: any }
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

export interface ResponseAwsAccountConnectionDetail {
  correlationId?: string
  data?: AwsAccountConnectionDetail
  metaData?: { [key: string]: any }
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

export interface ResponseMapStringQueryStat {
  correlationId?: string
  data?: {
    [key: string]: QueryStat
  }
  metaData?: { [key: string]: any }
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

export interface ResponseMessage {
  code?:
    | 'DEFAULT_ERROR_CODE'
    | 'INVALID_ARGUMENT'
    | 'INVALID_EMAIL'
    | 'DOMAIN_NOT_ALLOWED_TO_REGISTER'
    | 'USER_ALREADY_REGISTERED'
    | 'USER_INVITATION_DOES_NOT_EXIST'
    | 'USER_DOES_NOT_EXIST'
    | 'USER_INVITE_OPERATION_FAILED'
    | 'USER_DISABLED'
    | 'ACCOUNT_DOES_NOT_EXIST'
    | 'INACTIVE_ACCOUNT'
    | 'ACCOUNT_MIGRATED'
    | 'USER_DOMAIN_NOT_ALLOWED'
    | 'MAX_FAILED_ATTEMPT_COUNT_EXCEEDED'
    | 'RESOURCE_NOT_FOUND'
    | 'ROLE_DOES_NOT_EXIST'
    | 'EMAIL_NOT_VERIFIED'
    | 'EMAIL_VERIFICATION_TOKEN_NOT_FOUND'
    | 'INVALID_TOKEN'
    | 'REVOKED_TOKEN'
    | 'INVALID_CAPTCHA_TOKEN'
    | 'NOT_ACCOUNT_MGR_NOR_HAS_ALL_APP_ACCESS'
    | 'EXPIRED_TOKEN'
    | 'TOKEN_ALREADY_REFRESHED_ONCE'
    | 'ACCESS_DENIED'
    | 'NG_ACCESS_DENIED'
    | 'INVALID_CREDENTIAL'
    | 'INVALID_CREDENTIALS_THIRD_PARTY'
    | 'INVALID_KEY'
    | 'INVALID_CONNECTOR_TYPE'
    | 'INVALID_KEYPATH'
    | 'INVALID_VARIABLE'
    | 'UNKNOWN_HOST'
    | 'UNREACHABLE_HOST'
    | 'INVALID_PORT'
    | 'SSH_SESSION_TIMEOUT'
    | 'SOCKET_CONNECTION_ERROR'
    | 'CONNECTION_ERROR'
    | 'SOCKET_CONNECTION_TIMEOUT'
    | 'CONNECTION_TIMEOUT'
    | 'SSH_CONNECTION_ERROR'
    | 'USER_GROUP_ERROR'
    | 'INVALID_EXECUTION_ID'
    | 'ERROR_IN_GETTING_CHANNEL_STREAMS'
    | 'UNEXPECTED'
    | 'UNKNOWN_ERROR'
    | 'UNKNOWN_EXECUTOR_TYPE_ERROR'
    | 'DUPLICATE_STATE_NAMES'
    | 'TRANSITION_NOT_LINKED'
    | 'TRANSITION_TO_INCORRECT_STATE'
    | 'TRANSITION_TYPE_NULL'
    | 'STATES_WITH_DUP_TRANSITIONS'
    | 'BARRIERS_NOT_RUNNING_CONCURRENTLY'
    | 'NON_FORK_STATES'
    | 'NON_REPEAT_STATES'
    | 'INITIAL_STATE_NOT_DEFINED'
    | 'FILE_INTEGRITY_CHECK_FAILED'
    | 'INVALID_URL'
    | 'FILE_DOWNLOAD_FAILED'
    | 'PLATFORM_SOFTWARE_DELETE_ERROR'
    | 'INVALID_CSV_FILE'
    | 'INVALID_REQUEST'
    | 'SCHEMA_VALIDATION_FAILED'
    | 'FILTER_CREATION_ERROR'
    | 'INVALID_YAML_ERROR'
    | 'PLAN_CREATION_ERROR'
    | 'INVALID_INFRA_STATE'
    | 'PIPELINE_ALREADY_TRIGGERED'
    | 'NON_EXISTING_PIPELINE'
    | 'DUPLICATE_COMMAND_NAMES'
    | 'INVALID_PIPELINE'
    | 'COMMAND_DOES_NOT_EXIST'
    | 'DUPLICATE_ARTIFACTSTREAM_NAMES'
    | 'DUPLICATE_HOST_NAMES'
    | 'STATE_NOT_FOR_TYPE'
    | 'STATE_MACHINE_ISSUE'
    | 'STATE_DISCONTINUE_FAILED'
    | 'STATE_PAUSE_FAILED'
    | 'PAUSE_ALL_ALREADY'
    | 'RESUME_ALL_ALREADY'
    | 'ROLLBACK_ALREADY'
    | 'ABORT_ALL_ALREADY'
    | 'RETRY_FAILED'
    | 'UNKNOWN_ARTIFACT_TYPE'
    | 'UNKNOWN_STAGE_ELEMENT_WRAPPER_TYPE'
    | 'INIT_TIMEOUT'
    | 'LICENSE_EXPIRED'
    | 'NOT_LICENSED'
    | 'REQUEST_TIMEOUT'
    | 'WORKFLOW_ALREADY_TRIGGERED'
    | 'JENKINS_ERROR'
    | 'INVALID_ARTIFACT_SOURCE'
    | 'INVALID_ARTIFACT_SERVER'
    | 'INVALID_CLOUD_PROVIDER'
    | 'UPDATE_NOT_ALLOWED'
    | 'DELETE_NOT_ALLOWED'
    | 'APPDYNAMICS_CONFIGURATION_ERROR'
    | 'APM_CONFIGURATION_ERROR'
    | 'SPLUNK_CONFIGURATION_ERROR'
    | 'ELK_CONFIGURATION_ERROR'
    | 'LOGZ_CONFIGURATION_ERROR'
    | 'SUMO_CONFIGURATION_ERROR'
    | 'INSTANA_CONFIGURATION_ERROR'
    | 'APPDYNAMICS_ERROR'
    | 'STACKDRIVER_ERROR'
    | 'STACKDRIVER_CONFIGURATION_ERROR'
    | 'NEWRELIC_CONFIGURATION_ERROR'
    | 'NEWRELIC_ERROR'
    | 'DYNA_TRACE_CONFIGURATION_ERROR'
    | 'DYNA_TRACE_ERROR'
    | 'CLOUDWATCH_ERROR'
    | 'CLOUDWATCH_CONFIGURATION_ERROR'
    | 'PROMETHEUS_CONFIGURATION_ERROR'
    | 'DATA_DOG_CONFIGURATION_ERROR'
    | 'SERVICE_GUARD_CONFIGURATION_ERROR'
    | 'ENCRYPTION_NOT_CONFIGURED'
    | 'UNAVAILABLE_DELEGATES'
    | 'WORKFLOW_EXECUTION_IN_PROGRESS'
    | 'PIPELINE_EXECUTION_IN_PROGRESS'
    | 'AWS_ACCESS_DENIED'
    | 'AWS_CLUSTER_NOT_FOUND'
    | 'AWS_SERVICE_NOT_FOUND'
    | 'IMAGE_NOT_FOUND'
    | 'ILLEGAL_ARGUMENT'
    | 'IMAGE_TAG_NOT_FOUND'
    | 'DELEGATE_NOT_AVAILABLE'
    | 'INVALID_YAML_PAYLOAD'
    | 'AUTHENTICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'UNRECOGNIZED_YAML_FIELDS'
    | 'COULD_NOT_MAP_BEFORE_YAML'
    | 'MISSING_BEFORE_YAML'
    | 'MISSING_YAML'
    | 'NON_EMPTY_DELETIONS'
    | 'GENERAL_YAML_ERROR'
    | 'GENERAL_YAML_INFO'
    | 'YAML_GIT_SYNC_ERROR'
    | 'GIT_CONNECTION_ERROR'
    | 'GIT_ERROR'
    | 'ARTIFACT_SERVER_ERROR'
    | 'ENCRYPT_DECRYPT_ERROR'
    | 'SECRET_MANAGEMENT_ERROR'
    | 'SECRET_NOT_FOUND'
    | 'KMS_OPERATION_ERROR'
    | 'GCP_KMS_OPERATION_ERROR'
    | 'VAULT_OPERATION_ERROR'
    | 'AWS_SECRETS_MANAGER_OPERATION_ERROR'
    | 'AZURE_KEY_VAULT_OPERATION_ERROR'
    | 'CYBERARK_OPERATION_ERROR'
    | 'UNSUPPORTED_OPERATION_EXCEPTION'
    | 'FEATURE_UNAVAILABLE'
    | 'GENERAL_ERROR'
    | 'BASELINE_CONFIGURATION_ERROR'
    | 'SAML_IDP_CONFIGURATION_NOT_AVAILABLE'
    | 'INVALID_AUTHENTICATION_MECHANISM'
    | 'INVALID_SAML_CONFIGURATION'
    | 'INVALID_OAUTH_CONFIGURATION'
    | 'INVALID_LDAP_CONFIGURATION'
    | 'USER_GROUP_SYNC_FAILURE'
    | 'USER_GROUP_ALREADY_EXIST'
    | 'INVALID_TWO_FACTOR_AUTHENTICATION_CONFIGURATION'
    | 'EXPLANATION'
    | 'HINT'
    | 'NOT_WHITELISTED_IP'
    | 'INVALID_TOTP_TOKEN'
    | 'EMAIL_FAILED'
    | 'SSL_HANDSHAKE_FAILED'
    | 'NO_APPS_ASSIGNED'
    | 'INVALID_INFRA_CONFIGURATION'
    | 'TEMPLATES_LINKED'
    | 'USER_HAS_NO_PERMISSIONS'
    | 'USER_NOT_AUTHORIZED'
    | 'USER_ALREADY_PRESENT'
    | 'INVALID_USAGE_RESTRICTION'
    | 'USAGE_RESTRICTION_ERROR'
    | 'STATE_EXECUTION_INSTANCE_NOT_FOUND'
    | 'DELEGATE_TASK_RETRY'
    | 'KUBERNETES_YAML_ERROR'
    | 'SAVE_FILE_INTO_GCP_STORAGE_FAILED'
    | 'READ_FILE_FROM_GCP_STORAGE_FAILED'
    | 'FILE_NOT_FOUND_ERROR'
    | 'USAGE_LIMITS_EXCEEDED'
    | 'EVENT_PUBLISH_FAILED'
    | 'JIRA_ERROR'
    | 'EXPRESSION_EVALUATION_FAILED'
    | 'KUBERNETES_VALUES_ERROR'
    | 'KUBERNETES_CLUSTER_ERROR'
    | 'INCORRECT_SIGN_IN_MECHANISM'
    | 'OAUTH_LOGIN_FAILED'
    | 'INVALID_TERRAFORM_TARGETS_REQUEST'
    | 'TERRAFORM_EXECUTION_ERROR'
    | 'FILE_READ_FAILED'
    | 'FILE_SIZE_EXCEEDS_LIMIT'
    | 'CLUSTER_NOT_FOUND'
    | 'MARKETPLACE_TOKEN_NOT_FOUND'
    | 'INVALID_MARKETPLACE_TOKEN'
    | 'INVALID_TICKETING_SERVER'
    | 'SERVICENOW_ERROR'
    | 'PASSWORD_EXPIRED'
    | 'USER_LOCKED'
    | 'PASSWORD_STRENGTH_CHECK_FAILED'
    | 'ACCOUNT_DISABLED'
    | 'INVALID_ACCOUNT_PERMISSION'
    | 'PAGERDUTY_ERROR'
    | 'HEALTH_ERROR'
    | 'SAML_TEST_SUCCESS_MECHANISM_NOT_ENABLED'
    | 'DOMAIN_WHITELIST_FILTER_CHECK_FAILED'
    | 'INVALID_DASHBOARD_UPDATE_REQUEST'
    | 'DUPLICATE_FIELD'
    | 'INVALID_AZURE_VAULT_CONFIGURATION'
    | 'USER_NOT_AUTHORIZED_DUE_TO_USAGE_RESTRICTIONS'
    | 'INVALID_ROLLBACK'
    | 'DATA_COLLECTION_ERROR'
    | 'SUMO_DATA_COLLECTION_ERROR'
    | 'DEPLOYMENT_GOVERNANCE_ERROR'
    | 'BATCH_PROCESSING_ERROR'
    | 'GRAPHQL_ERROR'
    | 'FILE_CREATE_ERROR'
    | 'ILLEGAL_STATE'
    | 'GIT_DIFF_COMMIT_NOT_IN_ORDER'
    | 'FAILED_TO_ACQUIRE_PERSISTENT_LOCK'
    | 'FAILED_TO_ACQUIRE_NON_PERSISTENT_LOCK'
    | 'POD_NOT_FOUND_ERROR'
    | 'COMMAND_EXECUTION_ERROR'
    | 'REGISTRY_EXCEPTION'
    | 'ENGINE_INTERRUPT_PROCESSING_EXCEPTION'
    | 'ENGINE_IO_EXCEPTION'
    | 'ENGINE_OUTCOME_EXCEPTION'
    | 'ENGINE_SWEEPING_OUTPUT_EXCEPTION'
    | 'CACHE_NOT_FOUND_EXCEPTION'
    | 'ENGINE_ENTITY_UPDATE_EXCEPTION'
    | 'SHELL_EXECUTION_EXCEPTION'
    | 'TEMPLATE_NOT_FOUND'
    | 'AZURE_SERVICE_EXCEPTION'
    | 'AZURE_CLIENT_EXCEPTION'
    | 'GIT_UNSEEN_REMOTE_HEAD_COMMIT'
    | 'TIMEOUT_ENGINE_EXCEPTION'
    | 'NO_AVAILABLE_DELEGATES'
    | 'NO_INSTALLED_DELEGATES'
    | 'DUPLICATE_DELEGATE_EXCEPTION'
    | 'GCP_MARKETPLACE_EXCEPTION'
    | 'MISSING_DEFAULT_GOOGLE_CREDENTIALS'
    | 'INCORRECT_DEFAULT_GOOGLE_CREDENTIALS'
    | 'OPTIMISTIC_LOCKING_EXCEPTION'
    | 'NG_PIPELINE_EXECUTION_EXCEPTION'
    | 'NG_PIPELINE_CREATE_EXCEPTION'
    | 'RESOURCE_NOT_FOUND_EXCEPTION'
    | 'PMS_INITIALIZE_SDK_EXCEPTION'
    | 'UNEXPECTED_SNIPPET_EXCEPTION'
    | 'UNEXPECTED_SCHEMA_EXCEPTION'
    | 'CONNECTOR_VALIDATION_EXCEPTION'
    | 'GCP_SECRET_MANAGER_OPERATION_ERROR'
    | 'GCP_SECRET_OPERATION_ERROR'
    | 'GIT_OPERATION_ERROR'
    | 'TASK_FAILURE_ERROR'
    | 'INSTANCE_STATS_PROCESS_ERROR'
    | 'INSTANCE_STATS_MIGRATION_ERROR'
    | 'DEPLOYMENT_MIGRATION_ERROR'
    | 'INSTANCE_STATS_AGGREGATION_ERROR'
    | 'UNRESOLVED_EXPRESSIONS_ERROR'
    | 'KRYO_HANDLER_NOT_FOUND_ERROR'
    | 'DELEGATE_ERROR_HANDLER_EXCEPTION'
    | 'UNEXPECTED_TYPE_ERROR'
    | 'EXCEPTION_HANDLER_NOT_FOUND'
    | 'CONNECTOR_NOT_FOUND_EXCEPTION'
    | 'GCP_SERVER_ERROR'
    | 'HTTP_RESPONSE_EXCEPTION'
    | 'SCM_NOT_FOUND_ERROR'
    | 'SCM_CONFLICT_ERROR'
    | 'SCM_UNPROCESSABLE_ENTITY'
    | 'PROCESS_EXECUTION_EXCEPTION'
    | 'SCM_UNAUTHORIZED'
    | 'DATA'
    | 'CONTEXT'
    | 'PR_CREATION_ERROR'
    | 'URL_NOT_REACHABLE'
    | 'URL_NOT_PROVIDED'
    | 'ENGINE_EXPRESSION_EVALUATION_ERROR'
    | 'ENGINE_FUNCTOR_ERROR'
    | 'JIRA_CLIENT_ERROR'
    | 'SCM_NOT_MODIFIED'
    | 'JIRA_STEP_ERROR'
    | 'BUCKET_SERVER_ERROR'
  exception?: Throwable
  failureTypes?: (
    | 'EXPIRED'
    | 'DELEGATE_PROVISIONING'
    | 'CONNECTIVITY'
    | 'AUTHENTICATION'
    | 'VERIFICATION_FAILURE'
    | 'APPLICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'TIMEOUT_ERROR'
  )[]
  level?: 'INFO' | 'ERROR'
  message?: string
}

export interface ResponseString {
  correlationId?: string
  data?: string
  metaData?: { [key: string]: any }
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

export interface RestResponse {
  metaData?: {
    [key: string]: { [key: string]: any }
  }
  resource?: { [key: string]: any }
  responseMessages?: ResponseMessage[]
}

export interface RestResponseCEView {
  metaData?: {
    [key: string]: { [key: string]: any }
  }
  resource?: CEView
  responseMessages?: ResponseMessage[]
}

export interface RestResponseListCEReportSchedule {
  metaData?: {
    [key: string]: { [key: string]: any }
  }
  resource?: CEReportSchedule[]
  responseMessages?: ResponseMessage[]
}

export interface RestResponseString {
  metaData?: {
    [key: string]: { [key: string]: any }
  }
  resource?: string
  responseMessages?: ResponseMessage[]
}

export interface RestResponseViewCustomField {
  metaData?: {
    [key: string]: { [key: string]: any }
  }
  resource?: ViewCustomField
  responseMessages?: ResponseMessage[]
}

export interface StackTraceElement {
  className?: string
  fileName?: string
  lineNumber?: number
  methodName?: string
  nativeMethod?: boolean
}

export interface Throwable {
  cause?: Throwable
  localizedMessage?: string
  message?: string
  stackTrace?: StackTraceElement[]
  suppressed?: Throwable[]
}

export interface ViewCondition {
  type?: string
}

export interface ViewCustomField {
  accountId?: string
  createdAt?: number
  description?: string
  displayFormula?: string
  lastUpdatedAt?: number
  name?: string
  sqlFormula?: string
  userDefinedExpression?: string
  uuid?: string
  viewFields?: ViewField[]
  viewId?: string
}

export interface ViewField {
  fieldId?: string
  fieldName?: string
  identifier?: 'CLUSTER' | 'AWS' | 'GCP' | 'AZURE' | 'COMMON' | 'CUSTOM' | 'LABEL'
  identifierName?: string
}

export type ViewIdCondition = ViewCondition & {
  values?: string[]
  viewField?: ViewField
  viewOperator?: 'IN' | 'NOT_IN' | 'NOT_NULL' | 'NULL'
}

export interface ViewRule {
  viewConditions?: ViewCondition[]
}

export interface ViewTimeRange {
  endTime?: number
  startTime?: number
  viewTimeRangeType?: 'LAST_7' | 'LAST_30' | 'LAST_MONTH' | 'CURRENT_MONTH' | 'CUSTOM'
}

export interface ViewVisualization {
  chartType?: 'STACKED_TIME_SERIES' | 'STACKED_LINE_CHART'
  granularity?: 'DAY' | 'MONTH'
  groupBy?: ViewField
}

export type CEReportScheduleRequestBody = CEReportSchedule

export type CEViewRequestBody = CEView

export type ViewCustomFieldRequestBody = ViewCustomField

export interface AwsaccountconnectiondetailQueryParams {
  accountIdentifier?: string
}

export type AwsaccountconnectiondetailProps = Omit<
  GetProps<ResponseAwsAccountConnectionDetail, unknown, AwsaccountconnectiondetailQueryParams, void>,
  'path'
>

/**
 * Get Aws account connection details
 */
export const Awsaccountconnectiondetail = (props: AwsaccountconnectiondetailProps) => (
  <Get<ResponseAwsAccountConnectionDetail, unknown, AwsaccountconnectiondetailQueryParams, void>
    path={`/connector/awsaccountconnectiondetail`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseAwsaccountconnectiondetailProps = Omit<
  UseGetProps<ResponseAwsAccountConnectionDetail, unknown, AwsaccountconnectiondetailQueryParams, void>,
  'path'
>

/**
 * Get Aws account connection details
 */
export const useAwsaccountconnectiondetail = (props: UseAwsaccountconnectiondetailProps) =>
  useGet<ResponseAwsAccountConnectionDetail, unknown, AwsaccountconnectiondetailQueryParams, void>(
    `/connector/awsaccountconnectiondetail`,
    { base: getConfig('ccm/api'), ...props }
  )

export type AzureappclientidProps = Omit<GetProps<ResponseString, unknown, void, void>, 'path'>

/**
 * Get Azure application client Id
 */
export const Azureappclientid = (props: AzureappclientidProps) => (
  <Get<ResponseString, unknown, void, void>
    path={`/connector/azureappclientid`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseAzureappclientidProps = Omit<UseGetProps<ResponseString, unknown, void, void>, 'path'>

/**
 * Get Azure application client Id
 */
export const useAzureappclientid = (props: UseAzureappclientidProps) =>
  useGet<ResponseString, unknown, void, void>(`/connector/azureappclientid`, { base: getConfig('ccm/api'), ...props })

export interface Execute1Response {
  [key: string]: { [key: string]: any }
}

export interface Execute1QueryParams {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export type Execute1Props = Omit<
  MutateProps<Execute1Response, unknown, Execute1QueryParams, void, void>,
  'path' | 'verb'
>

export const Execute1 = (props: Execute1Props) => (
  <Mutate<Execute1Response, unknown, Execute1QueryParams, void, void>
    verb="POST"
    path={`/graphql`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseExecute1Props = Omit<
  UseMutateProps<Execute1Response, unknown, Execute1QueryParams, void, void>,
  'path' | 'verb'
>

export const useExecute1 = (props: UseExecute1Props) =>
  useMutate<Execute1Response, unknown, Execute1QueryParams, void, void>('POST', `/graphql`, {
    base: getConfig('ccm/api'),
    ...props
  })

export type GetSchemaProps = Omit<GetProps<void, unknown, void, void>, 'path'>

export const GetSchema = (props: GetSchemaProps) => (
  <Get<void, unknown, void, void> path={`/graphql/schema`} base={getConfig('ccm/api')} {...props} />
)

export type UseGetSchemaProps = Omit<UseGetProps<void, unknown, void, void>, 'path'>

export const useGetSchema = (props: UseGetSchemaProps) =>
  useGet<void, unknown, void, void>(`/graphql/schema`, { base: getConfig('ccm/api'), ...props })

export type GetCENGMicroserviceHealthStatusProps = Omit<GetProps<ResponseString, unknown, void, void>, 'path'>

/**
 * Get CE-NG Manager health
 */
export const GetCENGMicroserviceHealthStatus = (props: GetCENGMicroserviceHealthStatusProps) => (
  <Get<ResponseString, unknown, void, void> path={`/health`} base={getConfig('ccm/api')} {...props} />
)

export type UseGetCENGMicroserviceHealthStatusProps = Omit<UseGetProps<ResponseString, unknown, void, void>, 'path'>

/**
 * Get CE-NG Manager health
 */
export const useGetCENGMicroserviceHealthStatus = (props: UseGetCENGMicroserviceHealthStatusProps) =>
  useGet<ResponseString, unknown, void, void>(`/health`, { base: getConfig('ccm/api'), ...props })

export interface TimescaleSqlQueriesStatsQueryParams {
  accountId?: string
}

export type TimescaleSqlQueriesStatsProps = Omit<
  GetProps<ResponseMapStringQueryStat, unknown, TimescaleSqlQueriesStatsQueryParams, void>,
  'path'
>

/**
 * timescale
 */
export const TimescaleSqlQueriesStats = (props: TimescaleSqlQueriesStatsProps) => (
  <Get<ResponseMapStringQueryStat, unknown, TimescaleSqlQueriesStatsQueryParams, void>
    path={`/metrics/timescale`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseTimescaleSqlQueriesStatsProps = Omit<
  UseGetProps<ResponseMapStringQueryStat, unknown, TimescaleSqlQueriesStatsQueryParams, void>,
  'path'
>

/**
 * timescale
 */
export const useTimescaleSqlQueriesStats = (props: UseTimescaleSqlQueriesStatsProps) =>
  useGet<ResponseMapStringQueryStat, unknown, TimescaleSqlQueriesStatsQueryParams, void>(`/metrics/timescale`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface DeletePerspectiveQueryParams {
  accountId?: string
  perspectiveId?: string
}

export type DeletePerspectiveProps = Omit<
  MutateProps<RestResponseString, unknown, DeletePerspectiveQueryParams, void, void>,
  'path' | 'verb'
>

/**
 * Delete perspective
 */
export const DeletePerspective = (props: DeletePerspectiveProps) => (
  <Mutate<RestResponseString, unknown, DeletePerspectiveQueryParams, void, void>
    verb="DELETE"
    path={`/perspective`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseDeletePerspectiveProps = Omit<
  UseMutateProps<RestResponseString, unknown, DeletePerspectiveQueryParams, void, void>,
  'path' | 'verb'
>

/**
 * Delete perspective
 */
export const useDeletePerspective = (props: UseDeletePerspectiveProps) =>
  useMutate<RestResponseString, unknown, DeletePerspectiveQueryParams, void, void>('DELETE', `/perspective`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface GetPerspectiveQueryParams {
  accountId?: string
  perspectiveId?: string
}

export type GetPerspectiveProps = Omit<GetProps<RestResponseCEView, unknown, GetPerspectiveQueryParams, void>, 'path'>

/**
 * Get perspective
 */
export const GetPerspective = (props: GetPerspectiveProps) => (
  <Get<RestResponseCEView, unknown, GetPerspectiveQueryParams, void>
    path={`/perspective`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseGetPerspectiveProps = Omit<
  UseGetProps<RestResponseCEView, unknown, GetPerspectiveQueryParams, void>,
  'path'
>

/**
 * Get perspective
 */
export const useGetPerspective = (props: UseGetPerspectiveProps) =>
  useGet<RestResponseCEView, unknown, GetPerspectiveQueryParams, void>(`/perspective`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface CreatePerspectiveQueryParams {
  accountId?: string
  clone?: boolean
}

export type CreatePerspectiveProps = Omit<
  MutateProps<RestResponseCEView, unknown, CreatePerspectiveQueryParams, CEViewRequestBody, void>,
  'path' | 'verb'
>

/**
 * Create perspective
 */
export const CreatePerspective = (props: CreatePerspectiveProps) => (
  <Mutate<RestResponseCEView, unknown, CreatePerspectiveQueryParams, CEViewRequestBody, void>
    verb="POST"
    path={`/perspective`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseCreatePerspectiveProps = Omit<
  UseMutateProps<RestResponseCEView, unknown, CreatePerspectiveQueryParams, CEViewRequestBody, void>,
  'path' | 'verb'
>

/**
 * Create perspective
 */
export const useCreatePerspective = (props: UseCreatePerspectiveProps) =>
  useMutate<RestResponseCEView, unknown, CreatePerspectiveQueryParams, CEViewRequestBody, void>(
    'POST',
    `/perspective`,
    { base: getConfig('ccm/api'), ...props }
  )

export interface UpdatePerspectiveQueryParams {
  accountId?: string
}

export type UpdatePerspectiveProps = Omit<
  MutateProps<RestResponseCEView, unknown, UpdatePerspectiveQueryParams, CEViewRequestBody, void>,
  'path' | 'verb'
>

/**
 * Update perspective
 */
export const UpdatePerspective = (props: UpdatePerspectiveProps) => (
  <Mutate<RestResponseCEView, unknown, UpdatePerspectiveQueryParams, CEViewRequestBody, void>
    verb="PUT"
    path={`/perspective`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseUpdatePerspectiveProps = Omit<
  UseMutateProps<RestResponseCEView, unknown, UpdatePerspectiveQueryParams, CEViewRequestBody, void>,
  'path' | 'verb'
>

/**
 * Update perspective
 */
export const useUpdatePerspective = (props: UseUpdatePerspectiveProps) =>
  useMutate<RestResponseCEView, unknown, UpdatePerspectiveQueryParams, CEViewRequestBody, void>('PUT', `/perspective`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface DeleteCustomFieldQueryParams {
  accountId?: string
  customFieldId?: string
}

export type DeleteCustomFieldProps = Omit<
  MutateProps<void, void, DeleteCustomFieldQueryParams, CEViewRequestBody, void>,
  'path' | 'verb'
>

/**
 * Delete customField
 */
export const DeleteCustomField = (props: DeleteCustomFieldProps) => (
  <Mutate<void, void, DeleteCustomFieldQueryParams, CEViewRequestBody, void>
    verb="DELETE"
    path={`/perspective-custom-field`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseDeleteCustomFieldProps = Omit<
  UseMutateProps<void, void, DeleteCustomFieldQueryParams, CEViewRequestBody, void>,
  'path' | 'verb'
>

/**
 * Delete customField
 */
export const useDeleteCustomField = (props: UseDeleteCustomFieldProps) =>
  useMutate<void, void, DeleteCustomFieldQueryParams, CEViewRequestBody, void>('DELETE', `/perspective-custom-field`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface GetCustomFieldQueryParams {
  accountId?: string
  customFieldId?: string
}

export type GetCustomFieldProps = Omit<
  GetProps<RestResponseViewCustomField, unknown, GetCustomFieldQueryParams, void>,
  'path'
>

/**
 * Get customField
 */
export const GetCustomField = (props: GetCustomFieldProps) => (
  <Get<RestResponseViewCustomField, unknown, GetCustomFieldQueryParams, void>
    path={`/perspective-custom-field`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseGetCustomFieldProps = Omit<
  UseGetProps<RestResponseViewCustomField, unknown, GetCustomFieldQueryParams, void>,
  'path'
>

/**
 * Get customField
 */
export const useGetCustomField = (props: UseGetCustomFieldProps) =>
  useGet<RestResponseViewCustomField, unknown, GetCustomFieldQueryParams, void>(`/perspective-custom-field`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface SaveCustomFieldQueryParams {
  accountId?: string
}

export type SaveCustomFieldProps = Omit<
  MutateProps<RestResponseViewCustomField, unknown, SaveCustomFieldQueryParams, ViewCustomFieldRequestBody, void>,
  'path' | 'verb'
>

/**
 * Save customField
 */
export const SaveCustomField = (props: SaveCustomFieldProps) => (
  <Mutate<RestResponseViewCustomField, unknown, SaveCustomFieldQueryParams, ViewCustomFieldRequestBody, void>
    verb="POST"
    path={`/perspective-custom-field`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseSaveCustomFieldProps = Omit<
  UseMutateProps<RestResponseViewCustomField, unknown, SaveCustomFieldQueryParams, ViewCustomFieldRequestBody, void>,
  'path' | 'verb'
>

/**
 * Save customField
 */
export const useSaveCustomField = (props: UseSaveCustomFieldProps) =>
  useMutate<RestResponseViewCustomField, unknown, SaveCustomFieldQueryParams, ViewCustomFieldRequestBody, void>(
    'POST',
    `/perspective-custom-field`,
    { base: getConfig('ccm/api'), ...props }
  )

export interface UpdateCustomFieldQueryParams {
  accountId?: string
}

export type UpdateCustomFieldProps = Omit<
  MutateProps<RestResponseViewCustomField, unknown, UpdateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>,
  'path' | 'verb'
>

/**
 * Update customField
 */
export const UpdateCustomField = (props: UpdateCustomFieldProps) => (
  <Mutate<RestResponseViewCustomField, unknown, UpdateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>
    verb="PUT"
    path={`/perspective-custom-field`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseUpdateCustomFieldProps = Omit<
  UseMutateProps<RestResponseViewCustomField, unknown, UpdateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>,
  'path' | 'verb'
>

/**
 * Update customField
 */
export const useUpdateCustomField = (props: UseUpdateCustomFieldProps) =>
  useMutate<RestResponseViewCustomField, unknown, UpdateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>(
    'PUT',
    `/perspective-custom-field`,
    { base: getConfig('ccm/api'), ...props }
  )

export interface ValidateCustomFieldQueryParams {
  accountId?: string
}

export type ValidateCustomFieldProps = Omit<
  MutateProps<void, void, ValidateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>,
  'path' | 'verb'
>

/**
 * Validate customField
 */
export const ValidateCustomField = (props: ValidateCustomFieldProps) => (
  <Mutate<void, void, ValidateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>
    verb="POST"
    path={`/perspective-custom-field/validate`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseValidateCustomFieldProps = Omit<
  UseMutateProps<void, void, ValidateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>,
  'path' | 'verb'
>

/**
 * Validate customField
 */
export const useValidateCustomField = (props: UseValidateCustomFieldProps) =>
  useMutate<void, void, ValidateCustomFieldQueryParams, ViewCustomFieldRequestBody, void>(
    'POST',
    `/perspective-custom-field/validate`,
    { base: getConfig('ccm/api'), ...props }
  )

export interface DeleteReportSettingQueryParams {
  reportId?: string
  perspectiveId?: string
}

export type DeleteReportSettingProps = Omit<
  MutateProps<RestResponseString, unknown, DeleteReportSettingQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete perspective reports
 */
export const DeleteReportSetting = (props: DeleteReportSettingProps) => (
  <Mutate<RestResponseString, unknown, DeleteReportSettingQueryParams, string, void>
    verb="DELETE"
    path={`/perspectiveReport`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseDeleteReportSettingProps = Omit<
  UseMutateProps<RestResponseString, unknown, DeleteReportSettingQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Delete perspective reports
 */
export const useDeleteReportSetting = (props: UseDeleteReportSettingProps) =>
  useMutate<RestResponseString, unknown, DeleteReportSettingQueryParams, string, void>('DELETE', `/perspectiveReport`, {
    base: getConfig('ccm/api'),
    ...props
  })

export interface GetReportSettingQueryParams {
  perspectiveId?: string
  reportId?: string
}

export interface GetReportSettingPathParams {
  accountId: string
}

export type GetReportSettingProps = Omit<
  GetProps<RestResponseListCEReportSchedule, unknown, GetReportSettingQueryParams, GetReportSettingPathParams>,
  'path'
> &
  GetReportSettingPathParams

/**
 * Get perspective reports
 */
export const GetReportSetting = ({ accountId, ...props }: GetReportSettingProps) => (
  <Get<RestResponseListCEReportSchedule, unknown, GetReportSettingQueryParams, GetReportSettingPathParams>
    path={`/perspectiveReport/${accountId}`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseGetReportSettingProps = Omit<
  UseGetProps<RestResponseListCEReportSchedule, unknown, GetReportSettingQueryParams, GetReportSettingPathParams>,
  'path'
> &
  GetReportSettingPathParams

/**
 * Get perspective reports
 */
export const useGetReportSetting = ({ accountId, ...props }: UseGetReportSettingProps) =>
  useGet<RestResponseListCEReportSchedule, unknown, GetReportSettingQueryParams, GetReportSettingPathParams>(
    (paramsInPath: GetReportSettingPathParams) => `/perspectiveReport/${paramsInPath.accountId}`,
    { base: getConfig('ccm/api'), pathParams: { accountId }, ...props }
  )

export interface CreateReportSettingPathParams {
  accountId: string
}

export type CreateReportSettingProps = Omit<
  MutateProps<
    RestResponseListCEReportSchedule,
    unknown,
    void,
    CEReportScheduleRequestBody,
    CreateReportSettingPathParams
  >,
  'path' | 'verb'
> &
  CreateReportSettingPathParams

/**
 * Create perspective reports
 */
export const CreateReportSetting = ({ accountId, ...props }: CreateReportSettingProps) => (
  <Mutate<RestResponseListCEReportSchedule, unknown, void, CEReportScheduleRequestBody, CreateReportSettingPathParams>
    verb="POST"
    path={`/perspectiveReport/${accountId}`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseCreateReportSettingProps = Omit<
  UseMutateProps<
    RestResponseListCEReportSchedule,
    unknown,
    void,
    CEReportScheduleRequestBody,
    CreateReportSettingPathParams
  >,
  'path' | 'verb'
> &
  CreateReportSettingPathParams

/**
 * Create perspective reports
 */
export const useCreateReportSetting = ({ accountId, ...props }: UseCreateReportSettingProps) =>
  useMutate<
    RestResponseListCEReportSchedule,
    unknown,
    void,
    CEReportScheduleRequestBody,
    CreateReportSettingPathParams
  >('POST', (paramsInPath: CreateReportSettingPathParams) => `/perspectiveReport/${paramsInPath.accountId}`, {
    base: getConfig('ccm/api'),
    pathParams: { accountId },
    ...props
  })

export interface UpdateReportSettingPathParams {
  accountId: string
}

export type UpdateReportSettingProps = Omit<
  MutateProps<
    RestResponseListCEReportSchedule,
    unknown,
    void,
    CEReportScheduleRequestBody,
    UpdateReportSettingPathParams
  >,
  'path' | 'verb'
> &
  UpdateReportSettingPathParams

/**
 * Update perspective reports
 */
export const UpdateReportSetting = ({ accountId, ...props }: UpdateReportSettingProps) => (
  <Mutate<RestResponseListCEReportSchedule, unknown, void, CEReportScheduleRequestBody, UpdateReportSettingPathParams>
    verb="PUT"
    path={`/perspectiveReport/${accountId}`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseUpdateReportSettingProps = Omit<
  UseMutateProps<
    RestResponseListCEReportSchedule,
    unknown,
    void,
    CEReportScheduleRequestBody,
    UpdateReportSettingPathParams
  >,
  'path' | 'verb'
> &
  UpdateReportSettingPathParams

/**
 * Update perspective reports
 */
export const useUpdateReportSetting = ({ accountId, ...props }: UseUpdateReportSettingProps) =>
  useMutate<
    RestResponseListCEReportSchedule,
    unknown,
    void,
    CEReportScheduleRequestBody,
    UpdateReportSettingPathParams
  >('PUT', (paramsInPath: UpdateReportSettingPathParams) => `/perspectiveReport/${paramsInPath.accountId}`, {
    base: getConfig('ccm/api'),
    pathParams: { accountId },
    ...props
  })

export interface CloudCostK8sClusterSetupQueryParams {
  accountId?: string
}

export type CloudCostK8sClusterSetupProps = Omit<
  MutateProps<void, void, CloudCostK8sClusterSetupQueryParams, K8sClusterSetupRequest, void>,
  'path' | 'verb'
>

/**
 * get k8s cluster setup yaml based on features enabled
 */
export const CloudCostK8sClusterSetup = (props: CloudCostK8sClusterSetupProps) => (
  <Mutate<void, void, CloudCostK8sClusterSetupQueryParams, K8sClusterSetupRequest, void>
    verb="POST"
    path={`/yaml/cloudCostK8sClusterSetup`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseCloudCostK8sClusterSetupProps = Omit<
  UseMutateProps<void, void, CloudCostK8sClusterSetupQueryParams, K8sClusterSetupRequest, void>,
  'path' | 'verb'
>

/**
 * get k8s cluster setup yaml based on features enabled
 */
export const useCloudCostK8sClusterSetup = (props: UseCloudCostK8sClusterSetupProps) =>
  useMutate<void, void, CloudCostK8sClusterSetupQueryParams, K8sClusterSetupRequest, void>(
    'POST',
    `/yaml/cloudCostK8sClusterSetup`,
    { base: getConfig('ccm/api'), ...props }
  )

export interface GetCostOptimisationYamlTemplateQueryParams {
  accountId?: string
  connectorIdentifier?: string
}

export type GetCostOptimisationYamlTemplateProps = Omit<
  MutateProps<void, void, GetCostOptimisationYamlTemplateQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Get Cost Optimisation Yaml
 */
export const GetCostOptimisationYamlTemplate = (props: GetCostOptimisationYamlTemplateProps) => (
  <Mutate<void, void, GetCostOptimisationYamlTemplateQueryParams, string, void>
    verb="POST"
    path={`/yaml/generate-cost-optimisation-yaml`}
    base={getConfig('ccm/api')}
    {...props}
  />
)

export type UseGetCostOptimisationYamlTemplateProps = Omit<
  UseMutateProps<void, void, GetCostOptimisationYamlTemplateQueryParams, string, void>,
  'path' | 'verb'
>

/**
 * Get Cost Optimisation Yaml
 */
export const useGetCostOptimisationYamlTemplate = (props: UseGetCostOptimisationYamlTemplateProps) =>
  useMutate<void, void, GetCostOptimisationYamlTemplateQueryParams, string, void>(
    'POST',
    `/yaml/generate-cost-optimisation-yaml`,
    { base: getConfig('ccm/api'), ...props }
  )

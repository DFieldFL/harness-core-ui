import type { NGTemplateInfoConfig } from 'services/template-ng'
import type { TemplateViewData } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateReducer'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'

export enum TemplateActions {
  DBInitialize = 'DBInitialize',
  Initialize = 'Initialize',
  Fetching = 'Fetching',
  Loading = 'Loading',
  UpdateTemplateView = 'UpdateTemplateView',
  UpdateTemplate = 'UpdateTemplate',
  SetYamlHandler = 'SetYamlHandler',
  Success = 'Success',
  Error = 'Error'
}

export interface ActionResponse {
  error?: string
  isUpdated?: boolean
  template?: NGTemplateInfoConfig
  yamlHandler?: YamlBuilderHandlerBinding
  originalTemplate?: NGTemplateInfoConfig
  isBETemplateUpdated?: boolean
  templateView?: TemplateViewData
  stableVersion?: boolean
  versions?: string[]
  isLoading?: boolean
}

export interface ActionReturnType {
  type: TemplateActions
  response?: ActionResponse
}

const dbInitialized = (): ActionReturnType => ({ type: TemplateActions.DBInitialize })
const initialized = (): ActionReturnType => ({ type: TemplateActions.Initialize })
const loading = (): ActionReturnType => ({ type: TemplateActions.Loading })
const updateTemplateView = (response: ActionResponse): ActionReturnType => ({
  type: TemplateActions.UpdateTemplateView,
  response
})
const setYamlHandler = (response: ActionResponse): ActionReturnType => ({
  type: TemplateActions.SetYamlHandler,
  response
})
const updating = (): ActionReturnType => ({ type: TemplateActions.UpdateTemplate })
const fetching = (): ActionReturnType => ({ type: TemplateActions.Fetching })
const success = (response: ActionResponse): ActionReturnType => ({ type: TemplateActions.Success, response })
const error = (response: ActionResponse): ActionReturnType => ({ type: TemplateActions.Error, response })

export const TemplateContextActions = {
  dbInitialized,
  initialized,
  loading,
  updating,
  fetching,
  updateTemplateView,
  setYamlHandler,
  success,
  error
}

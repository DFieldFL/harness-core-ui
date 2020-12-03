import { createContext, useContext } from 'react'

import type { PipelineExecutionDetail, StageExecutionSummaryDTO } from 'services/cd-ng'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'

export interface ExecutionContextParams {
  pipelineExecutionDetail: PipelineExecutionDetail | null
  pipelineStagesMap: Map<string, StageExecutionSummaryDTO>
  selectedStageId: string
  selectedStepId: string
  loading: boolean
  queryParams: ExecutionPageQueryParams
}

const ExecutionConext = createContext<ExecutionContextParams>({
  pipelineExecutionDetail: null,
  pipelineStagesMap: new Map(),
  selectedStageId: '',
  selectedStepId: '',
  loading: false,
  queryParams: {}
})

export default ExecutionConext

export function useExecutionContext(): ExecutionContextParams {
  return useContext(ExecutionConext)
}

import type { GetListOfExecutionsQueryParams, PipelineExecutionFilterProperties } from 'services/pipeline-ng'

export type StringQueryParams = Partial<Record<keyof GetListOfExecutionsQueryParams, string>> & {
  filters?: string
}

export type QueryParams = Partial<GetListOfExecutionsQueryParams> & {
  filters?: PipelineExecutionFilterProperties
}

export type QuickStatusParam = GetListOfExecutionsQueryParams['status']

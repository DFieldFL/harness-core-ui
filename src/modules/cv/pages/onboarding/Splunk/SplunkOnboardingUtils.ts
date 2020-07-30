import type { SplunkSavedSearch, DSConfig } from '@wings-software/swagger-ts/definitions'
import type { SelectOption } from '@wings-software/uikit'
import { Utils } from '@wings-software/uikit'
import cloneDeep from 'lodash/cloneDeep'
import type { YAxisOptions, XAxisOptions } from 'highcharts'

export const SplunkColumnChartOptions: Highcharts.Options = {
  chart: {
    renderTo: 'chart',
    margin: 0
  },
  title: {
    text: undefined
  },
  yAxis: {
    title: {
      enabled: false
    } as YAxisOptions,
    gridLineWidth: 0
  },
  xAxis: {
    title: {
      enabled: false
    } as XAxisOptions,
    labels: {
      enabled: false
    },
    tickLength: 0,
    lineWidth: 0,
    gridLineWidth: 0
  },
  legend: {
    enabled: false
  },
  series: [],
  tooltip: {
    headerFormat: ' '
  },
  credits: {
    enabled: false
  }
}

export interface SplunkDSConfig extends DSConfig {
  query?: string
  queryName?: string
  isSplunkQuery?: boolean
  serviceInstanceIdentifier?: string
  eventType?: string
  serviceIdentifier?: string
  id: string
  isValid?: boolean
}

export function transformQueriesFromSplunk(splunkSavedQueries: SplunkSavedSearch[]): SelectOption[] {
  return !splunkSavedQueries?.length
    ? []
    : splunkSavedQueries
        .filter(query => query?.title && query?.searchQuery)
        .map((query: SplunkSavedSearch) => ({
          label: query.title || '',
          value: query.searchQuery || ''
        }))
}

export function transformSavedQueries(savedQueries: DSConfig[]): SplunkDSConfig[] {
  return savedQueries.map((query: DSConfig) => {
    const splunkQuery = query as SplunkDSConfig
    splunkQuery.queryName = query.identifier
    splunkQuery.id = Utils.randomId()
    return splunkQuery
  })
}

export function transformToSaveConfig(createdConfigs: DSConfig): SplunkDSConfig {
  const splunkConfig = cloneDeep(createdConfigs) as SplunkDSConfig
  splunkConfig.identifier = splunkConfig.queryName
  delete splunkConfig.queryName
  delete splunkConfig.isSplunkQuery
  delete splunkConfig.id
  return splunkConfig
}

export function createDefaultSplunkDSConfig(
  accountId: string,
  dataSourceId: string,
  productName: string,
  queryName?: string,
  query?: string,
  isSplunkQuery?: boolean
): SplunkDSConfig {
  return {
    serviceIdentifier: '',
    envIdentifier: '',
    serviceInstanceIdentifier: '',
    eventType: 'Quality',
    type: 'SPLUNK',
    projectIdentifier: 'harness',
    accountId,
    connectorId: dataSourceId,
    productName,
    query,
    id: Utils.randomId(),
    queryName,
    isValid: true,
    isSplunkQuery: Boolean(isSplunkQuery)
  }
}

export function createDefaultConfigObjectBasedOnSelectedQueries(
  queries: SelectOption[],
  dataSourceId: string,
  accId: string,
  productName: string
): SplunkDSConfig[] {
  const defaultQueries = queries?.map(query => {
    return createDefaultSplunkDSConfig(accId, dataSourceId, productName, query.label, query.value as string, true)
  })

  if (!defaultQueries?.length) {
    defaultQueries.push(createDefaultSplunkDSConfig(accId, dataSourceId, productName, undefined, undefined, false))
  }

  return defaultQueries
}

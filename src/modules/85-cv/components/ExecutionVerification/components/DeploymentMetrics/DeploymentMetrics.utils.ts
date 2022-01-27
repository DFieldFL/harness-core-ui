/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { extendMoment } from 'moment-range'
import { get } from 'lodash-es'
import type { MultiSelectOption } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import type { ExecutionNode } from 'services/pipeline-ng'
import type { DatasourceTypeDTO, RestResponseTransactionMetricInfoSummaryPageDTO } from 'services/cv'
import type { HostTestData } from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowProps } from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'
import type { DeploymentNodeAnalysisResult } from '../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'

const moment = extendMoment(require('moment')) // eslint-disable-line

export function transformMetricData(
  metricData?: RestResponseTransactionMetricInfoSummaryPageDTO | null
): DeploymentMetricsAnalysisRowProps[] {
  if (!metricData?.resource || metricData.resource.pageResponse?.empty) {
    return []
  }

  const graphData: DeploymentMetricsAnalysisRowProps[] = []

  const range = moment.range(
    moment(metricData.resource?.deploymentStartTime),
    moment(metricData.resource?.deploymentEndTime)
  )
  const startOfRange = range.start.valueOf()

  for (const analysisData of metricData.resource?.pageResponse?.content || []) {
    const { nodes, transactionMetric, dataSourceType, connectorName, nodeRiskCountDTO } = analysisData || {}
    if (!nodes?.length || !transactionMetric?.metricName || !transactionMetric.transactionName) continue

    const increment = Math.floor(range.diff() / Math.max(nodes.length - 1, 1))
    const controlPoints: Highcharts.SeriesLineOptions['data'][] = []
    const testPoints: HostTestData[] = []

    for (const hostInfo of nodes) {
      const { controlData, testData, risk, hostName } = hostInfo || {}
      const hostControlData: Highcharts.SeriesLineOptions['data'] = []
      const hostTestData: Highcharts.SeriesLineOptions['data'] = []

      controlData?.forEach((dataPoint, index) => {
        hostControlData.push({ x: startOfRange + index * increment, y: dataPoint === -1 ? null : dataPoint })
      })

      testData?.forEach((dataPoint, index) => {
        hostTestData.push({ x: startOfRange + index * increment, y: dataPoint === -1 ? null : dataPoint })
      })

      controlPoints.push(hostControlData)
      testPoints.push({ points: hostTestData, risk, name: hostName || '' })
    }

    graphData.push({
      controlData: controlPoints,
      testData: testPoints,
      transactionName: transactionMetric.transactionName,
      metricName: transactionMetric.metricName,
      healthSourceType: dataSourceType,
      risk: transactionMetric.risk,
      connectorName,
      nodeRiskCount: nodeRiskCountDTO
    })
  }

  return graphData
}

export function dataSourceTypeToLabel(dataSourceType: DatasourceTypeDTO['dataSourceType']): string {
  switch (dataSourceType) {
    case 'APP_DYNAMICS':
      return 'AppDynamics'
    case 'SPLUNK':
      return 'Splunk'
    case 'STACKDRIVER':
      return 'Google Cloud Operations (Metrics)'
    case 'STACKDRIVER_LOG':
      return 'Google Cloud Operations (Logs)'
    case 'NEW_RELIC':
      return 'New Relic'
    case 'PROMETHEUS':
      return 'Prometheus'
    default:
      return ''
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message')
}

export const getAccordionIds = (data: DeploymentMetricsAnalysisRowProps[]): string[] => {
  if (data.length) {
    return data?.map(
      analysisRow => `${analysisRow.transactionName}-${analysisRow.metricName}-${analysisRow.healthSourceType}`
    )
  }
  return []
}

export const getDropdownItems = (
  filterData?: string[],
  isLoading?: boolean,
  error?: GetDataError<unknown> | null
): MultiSelectOption[] => {
  if (!filterData?.length || isLoading || error) {
    return []
  }

  return filterData.map(item => ({
    label: item,
    value: item
  }))
}

export function getInitialNodeName(selectedNode: DeploymentNodeAnalysisResult | undefined): MultiSelectOption[] {
  if (!selectedNode) {
    return []
  }

  return [
    {
      label: selectedNode?.hostName,
      value: selectedNode?.hostName
    }
  ]
}

export function getQueryParamForHostname(value: string | undefined): string[] | undefined {
  return value ? [value] : undefined
}

export function getQueryParamFromFilters(value: string[]): string[] | undefined {
  return value.length ? value : undefined
}

export function getFilterDisplayText(selectedOptions: MultiSelectOption[], baseText: string, allText: string): string {
  return selectedOptions?.length > 0 ? baseText : baseText + `: ${allText}`
}

export function getShouldShowSpinner(loading: boolean, showSpinner: boolean): boolean {
  return loading && showSpinner
}

export function getShouldShowError(error: GetDataError<unknown> | null, shouldUpdateView: boolean): boolean | null {
  return error && shouldUpdateView
}

export function isErrorOrLoading(
  error: GetDataError<unknown> | null,
  loading: boolean
): boolean | GetDataError<unknown> {
  return error || loading
}

export function isStepRunningOrWaiting(status: ExecutionNode['status']): boolean {
  return status === 'Running' || status === 'AsyncWaiting'
}

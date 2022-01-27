/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Dispatch, SetStateAction } from 'react'
import type { FormikProps } from 'formik'
import type { IOptionProps } from '@blueprintjs/core'
import { isNumber, isEmpty } from 'lodash-es'
import type {
  RiskProfile,
  MetricPackDTO,
  TimeSeriesSampleDTO,
  StackdriverMetricHealthSourceSpec,
  StackdriverDefinition,
  StackdriverDashboardDetail
} from 'services/cv'
import type { MetricWidget } from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import type { StringKeys } from 'framework/strings'
import type { GCOMetricInfo, GCOMetricSetupSource } from './GCOMetricsHealthSource.type'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import { chartsConfig } from './GCOWidgetChartConfig'
import { OVERALL } from './GCOMetricsHealthSource.constants'
import { MANUAL_INPUT_QUERY } from './components/ManualInputQueryModal/ManualInputQueryModal'

export const GCOProduct = {
  CLOUD_METRICS: 'Cloud Metrics',
  CLOUD_LOGS: 'Cloud Logs'
}

export const MANUAL_QUERY_DASHBOARD = 'Manual_Query_Dashboard'

export function getManuallyCreatedQueries(selectedMetrics: GCOMetricSetupSource['metricDefinition']): string[] {
  if (!selectedMetrics?.size) return []
  const manualQueries: string[] = []
  for (const entry of selectedMetrics) {
    const [metricName, metricInfo] = entry
    if (metricName && metricInfo?.isManualQuery) {
      manualQueries.push(metricName)
    }
  }
  return manualQueries
}

export function formatJSON(val?: string | Record<string, unknown>): string | undefined {
  try {
    if (!val) return
    const res = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(res, null, 2)
  } catch (e) {
    return
  }
}

export function transformGCOMetricHealthSourceToGCOMetricSetupSource(sourceData: any): GCOMetricSetupSource {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.name === sourceData.healthSourceName
  )

  const setupSource: GCOMetricSetupSource = {
    selectedDashboards: sourceData.selectedDashboards || [],
    metricDefinition:
      new Map([...(sourceData.metricDefinition || new Map()), ...(sourceData.selectedMetrics || new Map())]) ||
      new Map(),
    isEdit: sourceData.isEdit,
    healthSourceName: sourceData.healthSourceName,
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    connectorRef: sourceData.connectorRef,
    product: sourceData.product
  }

  if (!healthSource) {
    return setupSource
  }

  const gcoMetricSpec: StackdriverMetricHealthSourceSpec = healthSource.spec || {}

  for (const metricDefinition of gcoMetricSpec.metricDefinitions || []) {
    const manualQuery = metricDefinition?.isManualQuery
    if (
      !metricDefinition?.metricName ||
      ((!metricDefinition.dashboardName || !metricDefinition.dashboardPath) && !manualQuery)
    )
      continue

    const metricTags: any = {}
    for (const tag of metricDefinition.metricTags || []) {
      metricTags[tag] = ''
    }

    if (!sourceData.selectedDashboards?.length) {
      setupSource.selectedDashboards.push({
        name: metricDefinition.dashboardName,
        path: metricDefinition.dashboardPath
      })
    }
    setupSource.metricDefinition.set(metricDefinition.metricName, {
      metricName: metricDefinition.metricName,
      identifier: metricDefinition.identifier,
      metricTags,
      dashboardName: metricDefinition.dashboardName,
      dashboardPath: metricDefinition.dashboardPath,
      isManualQuery: manualQuery,
      riskCategory: `${metricDefinition.riskProfile?.category}/${metricDefinition.riskProfile?.metricType}`,
      higherBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER'),
      lowerBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER'),
      query: JSON.stringify(metricDefinition.jsonMetricDefinition, null, 2),
      sli: metricDefinition.sli?.enabled,
      continuousVerification: metricDefinition.analysis?.deploymentVerification?.enabled,
      healthScore: metricDefinition.analysis?.liveMonitoring?.enabled,
      serviceInstanceField: metricDefinition.serviceInstanceField
    })
  }

  return setupSource
}

export function transformGCOMetricSetupSourceToGCOHealthSource(setupSource: GCOMetricSetupSource): UpdatedHealthSource {
  const healthSource: UpdatedHealthSource = {
    type: HealthSourceTypes.StackdriverMetrics as UpdatedHealthSource['type'],
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec: {
      connectorRef: setupSource.connectorRef,
      feature: GCOProduct.CLOUD_METRICS,
      metricDefinitions: []
    }
  }
  for (const selectedMetricInfo of setupSource.metricDefinition) {
    const [selectedMetric, metricInfo] = selectedMetricInfo
    if (!selectedMetric || !metricInfo) continue
    const [category, metricType] = metricInfo.riskCategory?.split('/') || []

    const thresholdTypes: RiskProfile['thresholdTypes'] = []
    if (metricInfo.lowerBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_LOWER')
    }
    if (metricInfo.higherBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_HIGHER')
    }

    const spec: StackdriverMetricHealthSourceSpec = healthSource.spec || []
    spec.metricDefinitions?.push({
      dashboardName: (metricInfo.dashboardName || '') as string,
      dashboardPath: (metricInfo.dashboardPath || '') as string,
      metricName: metricInfo.metricName as string,
      metricTags: Object.keys(metricInfo.metricTags || {}),
      identifier: metricInfo.identifier,
      isManualQuery: metricInfo.isManualQuery,
      jsonMetricDefinition: JSON.parse(metricInfo.query || ''),
      riskProfile: {
        metricType: metricType as RiskProfile['metricType'],
        category: category as RiskProfile['category'],
        thresholdTypes
      },
      sli: { enabled: metricInfo?.sli || false },
      serviceInstanceField: metricInfo.continuousVerification ? metricInfo.serviceInstanceField : null,
      analysis: {
        riskProfile: {
          category: category as RiskProfile['category'],
          metricType: metricType,
          thresholdTypes
        },
        liveMonitoring: { enabled: metricInfo.healthScore || false },
        deploymentVerification: {
          enabled: metricInfo.continuousVerification || false
        }
      }
    } as StackdriverDefinition)
  }

  return healthSource
}

function getIsAllIDsUnique(
  selectedMetrics: Map<string, GCOMetricInfo>,
  currentId: string,
  currentMetricName: string
): boolean {
  // to prevent error during submit
  if (!selectedMetrics) {
    return false
  }

  return ![...selectedMetrics.values()].find(
    metricData => metricData.identifier === currentId && currentMetricName !== metricData.metricName
  )
}

export function ensureFieldsAreFilled(
  values: GCOMetricInfo,
  getString: (key: StringKeys, vars?: Record<string, any> | undefined) => string,
  selectedMetrics: Map<string, GCOMetricInfo>
): Record<string, any> {
  const ret: any = {}
  if (!values?.query?.length) {
    ret.query = getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
  }

  // values.sli, values.continuousVerification , values.healthScore
  if (![values.sli, values.continuousVerification, values.healthScore].some(i => i)) {
    ret.sli = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  }

  if (values.continuousVerification || values.healthScore) {
    if (!values.riskCategory) {
      ret.riskCategory = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
    }
    if (!(values.higherBaselineDeviation || values.lowerBaselineDeviation)) {
      ret.higherBaselineDeviation = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
    }
  }

  if (values.continuousVerification && !values.serviceInstanceField) {
    ret.serviceInstanceField = getString('cv.monitoringSources.prometheus.validation.serviceInstanceIdentifier')
  }

  if (!values.identifier?.trim()) {
    ret.identifier = getString('validation.identifierRequired')
  } else {
    const isAllIDsUnique = getIsAllIDsUnique(selectedMetrics, values.identifier.trim(), values.metricName || '')

    if (!isAllIDsUnique) {
      ret.identifier = getString('cv.monitoringSources.uniqueIdentifierValidation', {
        idName: values.identifier.trim()
      })
    }
  }

  if (!values.metricName?.length) {
    ret.metricName = getString('cv.monitoringSources.metricNameValidation')
  }
  if (isEmpty(values.metricTags)) {
    ret.metricTags = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tags')
  }
  return ret
}

export function validate(
  values: GCOMetricInfo,
  selectedMetrics: Map<string, GCOMetricInfo>,
  getString: (key: StringKeys) => string
): { [key: string]: string } | undefined {
  const errors = ensureFieldsAreFilled(values, getString, selectedMetrics)

  if (selectedMetrics.size === 1) {
    return errors
  }

  for (const entry of selectedMetrics) {
    const [, metricInfo] = entry
    if (metricInfo.metricName === values.metricName) continue
    if (isEmpty(ensureFieldsAreFilled(metricInfo, getString, selectedMetrics))) {
      return errors
    }
  }

  if (!isEmpty(errors)) {
    errors[OVERALL] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.mainSetupValidation')
  }

  return errors
}

export function initializeSelectedMetrics(
  selectedDashboards: GCOMetricSetupSource['selectedDashboards'],
  selectedMetrics?: GCOMetricSetupSource['metricDefinition']
): GCOMetricSetupSource['metricDefinition'] {
  if (!selectedMetrics?.size) {
    return new Map()
  }

  const updatedMap = new Map(selectedMetrics)
  for (const entry of updatedMap) {
    const [metricName, metricInfo] = entry
    if (
      !selectedDashboards.find(dashboard => dashboard?.name === metricInfo?.dashboardName) &&
      !metricInfo.isManualQuery
    ) {
      updatedMap.delete(metricName)
    }
  }

  return updatedMap
}

export function getRiskCategoryOptions(metricPacks?: MetricPackDTO[]): IOptionProps[] {
  if (!metricPacks?.length) {
    return []
  }

  const riskCategoryOptions: IOptionProps[] = []
  for (const metricPack of metricPacks) {
    if (metricPack?.identifier && metricPack.metrics?.length) {
      for (const metric of metricPack.metrics) {
        if (!metric?.name) {
          continue
        }

        riskCategoryOptions.push({
          label: metricPack.category !== metric.name ? `${metricPack.category}/${metric.name}` : metricPack.category,
          value: `${metricPack.category}/${metric.type}`
        })
      }
    }
  }

  return riskCategoryOptions
}

export function transformSampleDataIntoHighchartOptions(sampleData?: TimeSeriesSampleDTO[]): Highcharts.Options {
  if (!sampleData?.length) {
    return {}
  }

  const seriesData = new Map<string, Highcharts.SeriesLineOptions>()
  for (const data of sampleData) {
    if (!data || !data.timestamp || !data.txnName || !isNumber(data.metricValue)) continue
    let highchartsOptions = seriesData.get(data.txnName)
    if (!highchartsOptions) {
      highchartsOptions = { name: data.txnName, data: [], type: 'line' }
      seriesData.set(data.txnName, highchartsOptions)
    }

    highchartsOptions.data?.push([data.timestamp, data.metricValue])
  }

  return chartsConfig(Array.from(seriesData.values()).slice(0, 5))
}

export function getPlaceholderForIdentifier(
  metricName = '',
  getString?: (key: StringKeys, vars?: Record<string, any> | undefined) => string
): string {
  if (!metricName.length && getString) {
    return getString('cv.identifierPlaceholder')
  }

  // Default maxInput for InputWithIdentifier is 63
  return metricName.substr(-63).replace(/[^a-zA-Z_ ]/g, '')
}

export function mapstackdriverDashboardDetailToMetricWidget(
  _: string,
  stackdriverDashboardDetail: StackdriverDashboardDetail
): MetricWidget {
  const widgetName = stackdriverDashboardDetail.widgetName
  return {
    widgetName: widgetName || '',
    dataSets:
      stackdriverDashboardDetail.dataSetList?.map(dataSet => {
        return {
          id: `${dataSet.metricName}`,
          name: `${dataSet.metricName}`,
          query: dataSet.timeSeriesQuery || ''
        }
      }) || []
  }
}

export const onSelectNavItem = ({
  id,
  metricName,
  query,
  widget,
  dashboardId,
  dashboardTitle,
  updatedData,
  setUpdatedData,
  selectedMetric,
  formikProps
}: {
  id: string
  metricName: string
  query: string
  widget?: string
  dashboardId?: string
  dashboardTitle?: string
  updatedData: Map<string, GCOMetricInfo>
  setUpdatedData: Dispatch<SetStateAction<Map<string, GCOMetricInfo>>>
  selectedMetric?: string
  formikProps: FormikProps<GCOMetricInfo>
}): void => {
  let metricInfo: GCOMetricInfo | undefined = updatedData.get(metricName)
  if (!metricInfo) {
    metricInfo = {
      metricName,
      identifier: id,
      query,
      metricTags: { [widget as string]: '' },
      isManualQuery: query === MANUAL_INPUT_QUERY,
      dashboardName: dashboardTitle,
      dashboardPath: dashboardId
    }
  }

  metricInfo.query = formatJSON(metricInfo.query) || ''
  updatedData.set(metricName, metricInfo)
  if (selectedMetric) {
    updatedData.set(selectedMetric as string, { ...formikProps.values })
  }
  setUpdatedData(new Map(updatedData))
}

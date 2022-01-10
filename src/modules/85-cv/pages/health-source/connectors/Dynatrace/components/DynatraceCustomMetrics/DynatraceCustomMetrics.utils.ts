/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { SelectOption } from '@wings-software/uicore'
import type { DynatraceMetricInfo } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import type {
  CreatedMetricsWithSelectedIndex,
  SelectedAndMappedMetrics
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.type'
import type { DynatraceMetricDTO } from 'services/cv'
import { DynatraceHealthSourceFieldNames } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.constants'
import type { StringKeys } from 'framework/strings'

export function initializeCreatedMetrics(
  defaultSelectedMetricName: string,
  selectedMetric: string,
  mappedMetrics: Map<string, DynatraceMetricInfo>
): CreatedMetricsWithSelectedIndex {
  const createdMetrics = mappedMetrics.size ? Array.from(mappedMetrics.keys()) : [defaultSelectedMetricName]
  const metricToCheck = selectedMetric || defaultSelectedMetricName
  return {
    createdMetrics: createdMetrics,
    selectedMetricIndex: Array.from(createdMetrics).findIndex(metric => metric === metricToCheck)
  }
}

export function updateMappedMetricMap(
  metricValues: DynatraceMetricInfo,
  removedMetric: string,
  updatedMetric: string,
  oldState: SelectedAndMappedMetrics
): SelectedAndMappedMetrics {
  const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
  const updatedMap = new Map(oldMappedMetric)
  if (updatedMap.has(removedMetric)) {
    updatedMap.delete(removedMetric)
  } else {
    updatedMap.delete(oldMetric)
  }
  if (metricValues?.metricName !== removedMetric) {
    updatedMap.set(updatedMetric, { ...metricValues } || { metricName: updatedMetric })
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  customMetrics?: Map<string, DynatraceMetricInfo>
): SelectedAndMappedMetrics {
  return {
    selectedMetric: (Array.from(customMetrics?.keys() || [])?.[0] as string) || defaultSelectedMetricName,
    mappedMetrics: customMetrics?.size
      ? customMetrics
      : new Map([
          [
            defaultSelectedMetricName,
            {
              identifier: defaultSelectedMetricName,
              metricSelector: '',
              sli: false,
              healthScore: false,
              continuousVerification: false,
              metricName: defaultSelectedMetricName
            }
          ]
        ])
  }
}

export function updateSelectedMetricsMap(
  updatedMetric: string,
  oldMetric: string,
  mappedMetrics: Map<string, DynatraceMetricInfo>,
  currentValues: DynatraceMetricInfo
): SelectedAndMappedMetrics {
  const updatedMap = new Map(mappedMetrics)

  // in the case where user updates metric name, update the key for current value
  if (oldMetric !== currentValues?.metricName) {
    updatedMap.delete(oldMetric)
  }
  // if newly created metric create form object
  if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, {
      metricName: updatedMetric,
      identifier: updatedMetric,
      isNew: true,
      sli: false,
      continuousVerification: false,
      healthScore: false,
      groupName: { label: '', value: '' }
    })
  }

  // update map with current form data
  if (currentValues?.metricName) {
    updatedMap.set(currentValues.metricName, currentValues)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function mapMetricSelectorsToMetricSelectorOptions(metrics: DynatraceMetricDTO[]): SelectOption[] {
  return metrics?.map(metricSelector => {
    return {
      label: metricSelector.metricId || '',
      value: metricSelector.metricId || ''
    }
  })
}

export const editQueryConfirmationDialogProps = (getString: (key: StringKeys) => string, setField: any) => {
  return {
    titleText: getString('cv.monitoringSources.prometheus.querySettingsNotEditable'),
    contentText: getString('cv.monitoringSources.prometheus.querySettingsSubtext'),
    confirmButtonText: getString('cv.proceedToEdit'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: (proceed: boolean) => {
      if (proceed) {
        setField(DynatraceHealthSourceFieldNames.MANUAL_QUERY, true)
      }
    }
  }
}

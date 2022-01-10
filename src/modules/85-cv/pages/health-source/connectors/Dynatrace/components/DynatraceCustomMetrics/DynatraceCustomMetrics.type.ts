/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DynatraceMetricInfo } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export interface DynatraceCustomMetricsProps {
  isFormValid: boolean
  formikSetField: any
  metricValues: DynatraceMetricInfo
  createdMetrics: string[]
  setCreatedMetrics: React.Dispatch<React.SetStateAction<CreatedMetricsWithSelectedIndex>>
  mappedMetrics: Map<string, DynatraceMetricInfo>
  setMappedMetrics: React.Dispatch<React.SetStateAction<SelectedAndMappedMetrics>>
  selectedMetric: string
  connectorIdentifier: string
  selectedServiceId: string
}

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, DynatraceMetricInfo>
}

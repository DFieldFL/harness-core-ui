/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  DynatraceCustomMetricsProps,
  CreatedMetricsWithSelectedIndex,
  SelectedAndMappedMetrics
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.type'
import type { DynatraceMetricInfo } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'

export const DEFAULT_METRIC_NAME = 'mock_default_metric_name'
export const CREATED_METRICS_WITH_DEFAULT_METRIC_MOCK: CreatedMetricsWithSelectedIndex = {
  createdMetrics: [DEFAULT_METRIC_NAME],
  selectedMetricIndex: 0
}

export const MAPPED_METRICS_LIST_MOCK: Map<string, DynatraceMetricInfo> = new Map([
  [
    'mapped_metric_1',
    {
      identifier: 'mapped_metric_1',
      metricSelector: 'metric_selector_mock',
      sli: false,
      healthScore: false,
      continuousVerification: false,
      metricName: 'mapped_metric_1'
    }
  ],
  [
    'mapped_metric_2',
    {
      identifier: 'mapped_metric_2',
      metricSelector: '',
      sli: false,
      healthScore: false,
      continuousVerification: false,
      metricName: 'mapped_metric_2'
    }
  ]
])

export const SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK: SelectedAndMappedMetrics = {
  selectedMetric: DEFAULT_METRIC_NAME,
  mappedMetrics: new Map([
    [
      DEFAULT_METRIC_NAME,
      {
        identifier: DEFAULT_METRIC_NAME,
        metricSelector: '',
        sli: false,
        healthScore: false,
        continuousVerification: false,
        metricName: DEFAULT_METRIC_NAME
      }
    ]
  ])
}

export const DYNATRACE_CUSTOM_METRICS_PROPS_MOCK: DynatraceCustomMetricsProps = {
  isFormValid: false,
  formikSetField: jest.fn(),
  metricValues: {
    identifier: 'mapped_metric_1',
    metricSelector: 'metric_selector_mock',
    sli: false,
    healthScore: false,
    continuousVerification: false,
    metricName: 'mapped_metric_1'
  },
  createdMetrics: ['mapped_metric_1', 'mapped_metric_2'],
  setCreatedMetrics: jest.fn(),
  mappedMetrics: MAPPED_METRICS_LIST_MOCK,
  setMappedMetrics: jest.fn(),
  selectedMetric: 'mapped_metric_1',
  connectorIdentifier: 'mock_connector',
  selectedServiceId: 'mock_service_id'
}

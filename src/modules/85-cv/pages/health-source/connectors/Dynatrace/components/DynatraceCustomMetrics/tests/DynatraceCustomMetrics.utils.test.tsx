/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import {
  initializeCreatedMetrics,
  initializeSelectedMetricsMap
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.utils'
import {
  CREATED_METRICS_WITH_DEFAULT_METRIC_MOCK,
  DEFAULT_METRIC_NAME,
  MAPPED_METRICS_LIST_MOCK,
  SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/tests/mock'

describe('Validate DynatraceCustomMetrics utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('It should initialize created metrics with provided default name when no metrics are passed', async () => {
    expect(initializeCreatedMetrics(DEFAULT_METRIC_NAME, '', new Map())).toEqual(
      CREATED_METRICS_WITH_DEFAULT_METRIC_MOCK
    )
  })

  test('It should return index of provided selected metric', async () => {
    expect(
      initializeCreatedMetrics(DEFAULT_METRIC_NAME, 'mapped_metric_2', MAPPED_METRICS_LIST_MOCK).selectedMetricIndex
    ).toEqual(1)
  })

  test('should create map with default metric when there are no metrics provided', async () => {
    expect(initializeSelectedMetricsMap(DEFAULT_METRIC_NAME, new Map())).toEqual(
      SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK
    )
  })

  test('should select first metric', async () => {
    expect(initializeSelectedMetricsMap(DEFAULT_METRIC_NAME, MAPPED_METRICS_LIST_MOCK)).toEqual({
      selectedMetric: 'mapped_metric_1',
      mappedMetrics: MAPPED_METRICS_LIST_MOCK
    })
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  mapDynatraceMetricDataToHealthSource,
  mapHealthSourceToDynatraceMetricData,
  mapServiceListToOptions
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import {
  MockDynatraceMetricData,
  DynatraceMockHealthSourceData,
  ServiceListMock,
  ServiceListOptionsMock,
  Mock
} from '@cv/pages/health-source/connectors/Dynatrace/tests/mock'

describe('Validate DynatraceHealthSource Utils', () => {
  test('validate mapping health source data to Dynatrace mapping', () => {
    expect(mapHealthSourceToDynatraceMetricData(DynatraceMockHealthSourceData)).toEqual(MockDynatraceMetricData)
  })

  test('validate mapping Dynatrace data to health source', () => {
    expect(mapDynatraceMetricDataToHealthSource(MockDynatraceMetricData)).toEqual(Mock)
  })

  test('validate mapping services to select options', () => {
    expect(mapServiceListToOptions(ServiceListMock)).toEqual(ServiceListOptionsMock)
  })
})

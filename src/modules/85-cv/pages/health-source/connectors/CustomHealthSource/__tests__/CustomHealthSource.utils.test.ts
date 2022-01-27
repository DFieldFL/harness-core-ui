/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  validateMappings,
  transformCustomHealthSourceToSetupSource,
  transformCustomSetupSourceToHealthSource,
  initializeSelectedMetricsMap,
  initializeCreatedMetrics
} from '../CustomHealthSource.utils'
import {
  customHealthSourceData,
  mappedValue,
  mockedHealthSourcePayload,
  noErrorValidatation,
  transformedSetupSource
} from './CustomHealthSource.mock'

const transformHealthSourceMap = new Map()
transformHealthSourceMap.set('CustomHealth Metric 101', mappedValue)

describe('Validate utils', () => {
  test('verify transformPrometheusHealthSourceToSetupSource', () => {
    expect(transformCustomHealthSourceToSetupSource(customHealthSourceData)).toEqual(transformedSetupSource)
  })

  test('verify transformCustomSetupSourceToHealthSource', () => {
    expect(
      transformCustomSetupSourceToHealthSource({
        isEdit: true,
        connectorRef: 'customhealth',
        healthSourceIdentifier: 'New_Custom',
        healthSourceName: 'New Custom',
        mappedServicesAndEnvs: transformHealthSourceMap
      })
    ).toEqual(mockedHealthSourcePayload)
  })

  test('should verify validateMappings', () => {
    expect(validateMappings(val => val, ['CustomHealth Metric 101'], 0, noErrorValidatation as any)).toEqual({})
  })

  test('should validate createAppDFormData', () => {
    const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
      'CustomHealth Metric',
      transformHealthSourceMap
    )
    expect(selectedMetric).toEqual('CustomHealth Metric 101')
    expect(mappedMetrics).toEqual(transformHealthSourceMap)

    const { createdMetrics, selectedMetricIndex } = initializeCreatedMetrics(
      'CustomHealth Metric',
      selectedMetric,
      mappedMetrics
    )

    expect(createdMetrics).toEqual(['CustomHealth Metric 101'])
    expect(selectedMetricIndex).toEqual(0)
  })

  test('Validate end and start time placeholder', async () => {
    // path url should include placeholders
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=2234&startTime=243',
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({ pathURL: 'cv.customHealthSource.Querymapping.validation.pathWithoutPlaceholder' })

    // path url should include placeholders
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=end_time&startTime=243',
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({ pathURL: 'cv.customHealthSource.Querymapping.validation.pathWithoutPlaceholder' })

    // placeholders in body not in url
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=end_time&startTime=243',
        query: 'sdffsfdf?end_time=sdf&start_time=23weewr',
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({})

    // placeholders are the same
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=now&startTime=now',
        endTime: {
          placeholder: 'now',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'now',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({ 'startTime.placeholder': 'cv.customHealthSource.Querymapping.validation.startAndEndTime' })

    // placeholders must be included
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=now&startTime=now',
        endTime: null,
        startTime: null
      } as any)
    ).toEqual({
      'endTime.placeholder': 'cv.customHealthSource.Querymapping.validation.endTime.timestamp',
      'endTime.timestampFormat': 'cv.customHealthSource.Querymapping.validation.endTime.timestamp',
      'startTime.placeholder': 'cv.customHealthSource.Querymapping.validation.startTime.placeholder',
      'startTime.timestampFormat': 'cv.customHealthSource.Querymapping.validation.startTime.timestamp'
    })
  })
})

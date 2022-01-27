/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import type { RestResponseSetHealthSourceDTO } from 'services/cv'
import { VerificationType } from '../HealthSourceDropDown.constants'
import { getDropdownOptions } from '../HealthSourceDropDown.utils'
import { mockedHealthSourcesData, mockedMultipleHealthSourcesData } from './HealthSourceDropDown.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Unit tests for HealthSourceDropDown', () => {
  const dropdownData = {
    loading: false,
    error: null,
    data: null,
    verificationType: VerificationType.TIME_SERIES
  }
  test('Should return loading option when loading is true', async () => {
    const newDropdownData = { ...dropdownData, loading: true }
    expect(getDropdownOptions(newDropdownData, getString)).toEqual([{ value: '', label: 'loading' }])
  })

  test('Should return the health source option when loading is false and there is only one health source', async () => {
    const newDropdownData = { ...dropdownData, data: mockedHealthSourcesData as RestResponseSetHealthSourceDTO }
    expect(getDropdownOptions(newDropdownData, getString)).toEqual([
      {
        label: 'Appd Health source',
        value: 'Appd_Monitored_service/Appd_Health_source',
        icon: {
          name: 'service-appdynamics'
        }
      }
    ])
  })

  test('Should also return the All option whenever there are multiple health sources of same verificationType', async () => {
    const newDropdownData = { ...dropdownData, data: mockedMultipleHealthSourcesData as RestResponseSetHealthSourceDTO }
    expect(getDropdownOptions(newDropdownData, getString)).toEqual([
      {
        icon: {
          name: 'service-appdynamics'
        },
        label: 'Appd Health source',
        value: 'Appd_Monitored_service/Appd_Health_source'
      },
      {
        icon: {
          name: 'service-prometheus'
        },
        label: 'Prometheus Health source',
        value: 'Appd_Monitored_service/Prometheus_Health_source'
      }
    ])
  })
})

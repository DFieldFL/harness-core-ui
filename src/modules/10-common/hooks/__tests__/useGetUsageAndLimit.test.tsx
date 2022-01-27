/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useGetLicenseUsage } from 'services/cf'
import { useGetUsage } from 'services/ci'
import { useGetCCMLicenseUsage } from 'services/ce'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '../useGetUsageAndLimit'

jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
jest.mock('services/cf')
const useGetFFLicenseUsageMock = useGetLicenseUsage as jest.MockedFunction<any>
useGetFFLicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      activeClientMAUs: {
        count: 32,
        displayName: 'Last 30 Days'
      },
      activeFeatureFlagUsers: {
        count: 55
      }
    },
    status: 'SUCCESS'
  }
})
jest.mock('services/ci')
const useGetCILicenseUsageMock = useGetUsage as jest.MockedFunction<any>
useGetCILicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeCommitters: {
          count: 23,
          displayName: 'Last 30 Days'
        }
      },
      status: 'SUCCESS'
    }
  }
})

jest.mock('services/ce')
const useGetCCMLicenseUsageMock = useGetCCMLicenseUsage as jest.MockedFunction<any>
useGetCCMLicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeSpend: {
          count: 29,
          displayName: 'Last 30 Days'
        }
      },
      status: 'SUCCESS'
    }
  }
})

describe('useGetUsageAndLimit', () => {
  test('should fetch CI usage and limit when module is CI', () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalDevelopers: 100
          },
          status: 'SUCCESS'
        }
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CI), { wrapper })
    expect(result.current.limitData.limit?.ci?.totalDevelopers).toBe(100)
    expect(result.current.limitData.limit?.ff).toBeUndefined()
    expect(result.current.usageData.usage?.ci?.activeCommitters?.count).toBe(23)
    expect(result.current.usageData.usage?.ff).toBeUndefined()
  })
  test('should fetch FF usage and limit when module is FF', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalClientMAUs: 200,
            totalFeatureFlagUnits: 300
          },
          status: 'SUCCESS'
        }
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CF), { wrapper })
    expect(result.current.limitData.limit?.ci).toBeUndefined()
    expect(result.current.limitData.limit?.ff?.totalClientMAUs).toBe(200)
    expect(result.current.limitData.limit?.ff?.totalFeatureFlagUnits).toBe(300)
    expect(result.current.usageData.usage?.ci).toBeUndefined()
    expect(result.current.usageData.usage?.ff?.activeClientMAUs?.count).toBe(32)
    expect(result.current.usageData.usage?.ff?.activeFeatureFlagUsers?.count).toBe(55)
  })

  test('should fetch CCM usage and limit when module is CCM', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalSpendLimit: 1000
          },
          status: 'SUCCESS'
        }
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CE), { wrapper })
    expect(result.current.limitData.limit?.ci).toBeUndefined()
    expect(result.current.limitData.limit?.ff).toBeUndefined()
    expect(result.current.limitData.limit?.ccm?.totalSpendLimit).toBe(1000)
    expect(result.current.usageData.usage?.ci).toBeUndefined()
    expect(result.current.usageData.usage?.ff).toBeUndefined()
    expect(result.current.usageData.usage?.ccm?.activeSpend?.count).toBe(29)
  })
})

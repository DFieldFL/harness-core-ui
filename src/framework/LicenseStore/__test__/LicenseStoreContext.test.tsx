import React from 'react'
import moment from 'moment'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { useGetAccountLicenses, useGetLastModifiedTimeForAllModuleTypes } from 'services/cd-ng'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { Editions } from '@common/constants/SubscriptionTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { LicenseStoreProvider, useLicenseStore, handleUpdateLicenseStore } from '../LicenseStoreContext'

const featureFlags = {
  NG_LICENSES_ENABLED: true
}
const defaultUuid = '1234'
const defaultUserInfo = {
  accounts: [
    {
      uuid: defaultUuid
    }
  ]
}

const defaultAppStoreValues = {
  featureFlags,
  currentUserInfo: defaultUserInfo
}

const expiryTime = moment.now()

jest.mock('services/cd-ng')
const useGetAccountLicensesMock = useGetAccountLicenses as jest.MockedFunction<any>
useGetAccountLicensesMock.mockImplementation(() => {
  return {
    data: {
      data: {
        allModuleLicenses: {
          CD: [
            {
              edition: 'ENTERPRISE',
              expiryTime,
              licenseType: 'TRIAL'
            }
          ]
        }
      }
    },
    status: 'SUCCESS',
    loading: false
  }
})

const useGetLastModifiedTimeForAllModuleTypesMock = useGetLastModifiedTimeForAllModuleTypes as jest.MockedFunction<any>
useGetLastModifiedTimeForAllModuleTypesMock.mockImplementation(() => {
  return {
    mutate: jest.fn().mockRejectedValue({})
  }
})
describe('LicenseStoreContext', () => {
  test('should return the correct license info', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: defaultUuid })}
        pathParams={{ accountId: defaultUuid }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <LicenseStoreProvider>{children}</LicenseStoreProvider>
      </TestWrapper>
    )

    const { result } = renderHook(() => useLicenseStore(), { wrapper })
    await waitFor(() => expect(result.current.CD_LICENSE_STATE).toBe(LICENSE_STATE_VALUES.ACTIVE))
    expect(result.current.licenseInformation['CD']?.edition).toBe(Editions.ENTERPRISE)
  })

  test('should update license store', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: defaultUuid })}
        pathParams={{ accountId: defaultUuid }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <LicenseStoreProvider>{children}</LicenseStoreProvider>
      </TestWrapper>
    )

    const { result } = renderHook(() => useLicenseStore(), { wrapper })
    await waitFor(() => expect(result.current.licenseInformation['CD']?.licenseType).toBe('TRIAL'))
    handleUpdateLicenseStore(result.current.licenseInformation, result.current.updateLicenseStore, 'CD' as Module, {
      edition: 'ENTERPRISE',
      expiryTime,
      licenseType: 'PAID'
    })
    await waitFor(() => expect(result.current.licenseInformation['CD']?.licenseType).toBe('PAID'))
  })
})

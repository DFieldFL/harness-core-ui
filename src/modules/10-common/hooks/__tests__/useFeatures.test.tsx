import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { FeaturesProvider } from 'framework/featureStore/FeaturesContext'
import {
  useGetEnabledFeatureRestrictionDetailByAccountId,
  useGetFeatureRestrictionDetail,
  useGetAllFeatureRestrictionMetadata
} from 'services/cd-ng'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { Editions } from '@common/constants/SubscriptionTypes'
import { useFeature } from '../useFeatures'
import mocks from './featuresMocks.json'
import metadata from './featureMetaData.json'

const getFeatureListMock = jest.fn()
const getFeatureDetailsMock = jest.fn()
const featureListResponse = mocks.featureList
const featureDetailEnabledResponse = mocks['featureDetail-enabled']
const featureDetailDisabledResponse = mocks['featureDetail-disabled']
const featureMetadataResponse = metadata.featureMetadata

jest.mock('services/cd-ng')
const useGetEnabledFeatureListMock = useGetEnabledFeatureRestrictionDetailByAccountId as jest.MockedFunction<any>
const useGetFeatureDetailsMock = useGetFeatureRestrictionDetail as jest.MockedFunction<any>
const useGetAllFeatureRestrictionMetadataMock = useGetAllFeatureRestrictionMetadata as jest.MockedFunction<any>

let defaultLicenseStoreValues = {}

beforeEach(() => {
  jest.clearAllMocks()
  useGetEnabledFeatureListMock.mockImplementation(() => {
    return {
      refetch: getFeatureListMock,
      data: featureListResponse
    }
  })
  useGetFeatureDetailsMock.mockImplementation(() => {
    return {
      mutate: getFeatureDetailsMock.mockReturnValue(featureDetailEnabledResponse)
    }
  })
  useGetAllFeatureRestrictionMetadataMock.mockImplementation(() => {
    return {
      data: featureMetadataResponse
    }
  })
  defaultLicenseStoreValues = {
    licenseInformation: {
      CD: {
        edition: Editions.ENTERPRISE
      },
      CI: {
        edition: Editions.TEAM
      },
      CF: {
        edition: Editions.FREE
      },
      CCM: {
        edition: Editions.ENTERPRISE
      }
    }
  }
})

describe('useFeatures', () => {
  test('feature call should fetch from cache when skipCondition is true', async () => {
    useGetEnabledFeatureListMock.mockImplementation(() => {
      return {
        refetch: getFeatureListMock
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST1,
            moduleType: 'CD'
          },
          options: {
            skipCondition: () => true
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).not.toHaveBeenCalled())
    expect((result as any).current.enabled).toBe(false)
  })

  test('useFeature should make the get feature list call by default: disabled feature', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST3,
            moduleType: 'CD'
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).toHaveBeenCalledTimes(1))
    expect((result as any).current.enabled).toBe(false)
  })

  test('feature call should fetch from apiCall when skipCache is true: enabled feature', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST1,
            moduleType: 'CD'
          },
          options: {
            skipCache: true
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).toHaveBeenCalledTimes(1))
    expect((result as any).current.enabled).toBe(true)
  })

  test('useFeature should make the get feature detail call if restrictionType is NOT AVAILABILITY: enabled feature', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST3,
            moduleType: 'CI'
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).not.toHaveBeenCalled())
    expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1)
    const resolvedValue = await result.current
    expect(resolvedValue.enabled).toBe(true)
  })

  test('useFeature should make the get feature detail call if restrictionType is NOT AVAILABILITY: disabled feature', async () => {
    useGetFeatureDetailsMock.mockImplementation(() => {
      return {
        mutate: getFeatureDetailsMock.mockReturnValue(featureDetailDisabledResponse)
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST3,
            moduleType: 'CI'
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).not.toHaveBeenCalled())
    expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1)
    const resolvedValue = await result.current
    expect(resolvedValue.enabled).toBe(false)
  })

  test('useFeature should return true if exception occurs getting enabled feature list', async () => {
    useGetEnabledFeatureListMock.mockImplementation(() => {
      return {
        refetch: getFeatureListMock,
        data: null,
        error: new Error('api call failed')
      }
    })

    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST3,
            moduleType: 'CD'
          }
        }),
      { wrapper }
    )
    expect((result as any).current.enabled).toBe(true)
  })

  test('useFeature should return true  if exception occurs getting feature detail', async () => {
    useGetFeatureDetailsMock.mockImplementation(() => {
      return {
        mutate: getFeatureDetailsMock.mockRejectedValue('api call failed')
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.TEST3,
            moduleType: 'CI'
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1))
    const resolvedValue = await result.current
    expect(resolvedValue.enabled).toBe(true)
  })
})

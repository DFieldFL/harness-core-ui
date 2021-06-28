import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary, useExtendTrialLicense, useSaveFeedback } from 'services/cd-ng'
import CIHomePage from '../CIHomePage'

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>
useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})

const currentUser = {
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

describe('CIHomePage', () => {
  test('should render HomePageTemplate when return success with data', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('ci.dashboard.subHeading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render the home page template when the current user is not created from NG', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })

    const userCreatedFromCG = {
      accounts: [
        {
          uuid: '123',
          createdFromNG: false
        }
      ]
    }

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: userCreatedFromCG }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('ci.dashboard.subHeading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should return error page if call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        error: {
          data: {
            message: 'call failed'
          }
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('call failed')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should move to trial in progress page when query param trial is true', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        queryParams={{ trial: true }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should update the license store', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })

    const updateLicenseStoreSpy = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        queryParams={{ trial: true }}
        defaultLicenseStoreValues={{
          updateLicenseStore: updateLicenseStoreSpy
        }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()

    await waitFor(() => expect(updateLicenseStoreSpy).toHaveBeenCalledTimes(1))
  })
})

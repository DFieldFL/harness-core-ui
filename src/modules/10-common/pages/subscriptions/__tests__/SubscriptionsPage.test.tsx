import React from 'react'
import moment from 'moment'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetAccountNG,
  useGetModuleLicensesByAccountAndModuleType,
  useExtendTrialLicense,
  useSaveFeedback
} from 'services/cd-ng'
import { Editions } from '@common/constants/SubscriptionTypes'
import { ModuleName } from 'framework/types/ModuleName'
import SubscriptionsPage from '../SubscriptionsPage'

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetModuleLicensesByAccountAndModuleType as jest.MockedFunction<any>
const useGetAccountMock = useGetAccountNG as jest.MockedFunction<any>
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

moment.now = jest.fn(() => 1482363367071)

const featureFlags = {
  CDNG_ENABLED: true,
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CFNG_ENABLED: true
}

describe('Subscriptions Page', () => {
  test('it renders the subscriptions page', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expiryCountdown')).toBeTruthy()
    expect(getByText('common.subscriptions.enterpriseTrial')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it renders the correct card in the subscriptions page', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CI }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expiryCountdown')).toBeTruthy()
    expect(getByText('common.subscriptions.enterpriseTrial')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it renders a page error when the account call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        error: {
          message: 'hello'
        },
        refetch: jest.fn()
      }
    })

    const { container, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(queryByText('common.subscriptions.title')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it renders a page error when the license call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        error: {
          message: 'hello'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(queryByText('common.subscriptions.title')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it renders an expired banner when the trial is expired', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              expiryTime: 0
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expired')).toBeTruthy()
    expect(getByText('common.subscriptions.enterpriseTrial')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it renders trial not started information', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: [
          {
            status: 'SUCCESS'
          }
        ],
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.noActiveSubscription')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it shows the header and a loading spinner while the account call is loading', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn()
      }
    })

    const { container, getByText, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.purpose.cd.delivery')).toBeTruthy()
    expect(queryByText('common.subscriptions.noActiveSubscription')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it shows the header and a loading spinner while the license call is loading', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.purpose.cd.delivery')).toBeTruthy()
    expect(queryByText('common.subscriptions.noActiveSubscription')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it routes to the module trial home page when the trial hasn"t been started and the user clicks subscribe', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <SubscriptionsPage />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('common.subscriptions.overview.subscribe'))
    })

    await waitFor(() => expect(container).toMatchSnapshot())
  })

  test('it should update the license store', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const updateLicenseStoreSpy = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          updateLicenseStore: updateLicenseStoreSpy
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.purpose.cd.delivery')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})

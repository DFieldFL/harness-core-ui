import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetAccountLicenses, useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { PurposePage } from '../PurposePage'

jest.mock('services/cd-ng')
const useGetAccountLicenseInfoMock = useGetAccountLicenses as jest.MockedFunction<any>
const useUpdateAccountDefaultExperienceNGMock = useUpdateAccountDefaultExperienceNG as jest.MockedFunction<any>

const featureFlags = {
  CDNG_ENABLED: true,
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CFNG_ENABLED: true
}

describe('PurposePage', () => {
  test('should render module description and continue button when select module', async () => {
    useUpdateAccountDefaultExperienceNGMock.mockImplementation(() => {
      return {
        mutate: () => void 0
      }
    })

    useGetAccountLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          correlationId: '40d39b08-857d-4bd2-9418-af1aafc42d20',
          data: {
            accountId: 'HlORRJY8SH2IlwpAGWwkmg',
            moduleLicenses: {
              CI: {
                accountIdentifier: 'HlORRJY8SH2IlwpAGWwkmg',
                createdAt: 1618619866814,
                edition: 'ENTERPRISE',
                expiryTime: 1619829466787,
                id: '607a2ddaa8641a3a65f8bbde',
                lastModifiedAt: 1618619866814,
                licenseType: 'TRIAL',
                moduleType: 'CI',
                numberOfCommitters: 10,
                startTime: 1618619866,
                status: 'ACTIVE'
              }
            }
          },
          metaData: null,
          status: 'SUCCESS'
        }
      }
    })
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <PurposePage />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.purpose.ci.integration'))
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})

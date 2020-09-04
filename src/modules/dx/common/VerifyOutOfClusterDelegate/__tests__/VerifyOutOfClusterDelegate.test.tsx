import React from 'react'
import { MemoryRouter } from 'react-router'
import { render } from '@testing-library/react'
import type { ResponseDTOConnectorValidationResult } from 'services/cd-ng'
import type { RestResponseDelegateStatus } from 'services/portal'
import VerifyOutOfClusterDelegate from '../VerifyOutOfClusterDelegate'
import statusData from './mockData/delegate-status-response.json'
import testConnectionSuccess from './mockData/test-connection-success.json'

describe('Verification step for out of cluster delegate', () => {
  test('render VerifyOutOfClusterDelegate', () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <VerifyOutOfClusterDelegate
          name="sample-name"
          delegateStatusMockData={{
            data: statusData as RestResponseDelegateStatus,
            loading: false
          }}
          testConnectionMockData={{
            data: testConnectionSuccess as ResponseDTOConnectorValidationResult,
            loading: false
          }}
        />
      </MemoryRouter>
    )
    expect(getByText('Verifying Connection')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('render in modal', () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <VerifyOutOfClusterDelegate
          name="sample-name"
          renderInModal={true}
          delegateStatusMockData={{
            data: statusData as RestResponseDelegateStatus,
            loading: false
          }}
          testConnectionMockData={{
            data: testConnectionSuccess as ResponseDTOConnectorValidationResult,
            loading: false
          }}
        />
      </MemoryRouter>
    )
    expect(getByText('Verifying Connection')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render in popover', () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <VerifyOutOfClusterDelegate
          name="sample-name"
          inPopover={true}
          delegateStatusMockData={{
            data: statusData as RestResponseDelegateStatus,
            loading: false
          }}
          testConnectionMockData={{
            data: testConnectionSuccess as ResponseDTOConnectorValidationResult,
            loading: false
          }}
        />
      </MemoryRouter>
    )
    expect(getByText('Establishing connection')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})

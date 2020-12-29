import React from 'react'
import { waitFor, act, fireEvent, findByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import BuildInfraSpecifications from '../BuildInfraSpecifications'

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa 1',
        identifier: 'tesa_1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListPromise: () =>
    Promise.resolve({
      data: {
        content: [
          {
            connector: ConnectorResponse.data!.data!.connector
          }
        ]
      }
    })
}))

describe('BuildInfraSpecifications snapshot test', () => {
  test('initializes ok', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('able to select a connector', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    const selectBtn = await findByText(container, 'Select')
    expect(selectBtn).toBeDefined()
    fireEvent.click(selectBtn)
    await act(async () => {
      const portal = document.getElementsByClassName('bp3-portal')[0]
      expect(portal).toBeDefined()
      fireEvent.click(await findByText(portal as HTMLElement, 'Account'))
      const connector = await findByText(portal as HTMLElement, 'tesa_1')
      await waitFor(() => expect(connector).toBeDefined())
      fireEvent.click(connector)
    })
    const chosenConnector = await findByText(container, 'tesa 1')
    expect(chosenConnector).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})

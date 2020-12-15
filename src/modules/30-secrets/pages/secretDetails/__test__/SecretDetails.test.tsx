import React from 'react'
import { render, fireEvent, findByText, act, getByText, waitFor } from '@testing-library/react'

import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import SecretDetails from '../SecretDetails'

import mockData from './secretDetailsMocks.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', jest.fn())
jest.mock('services/cd-ng', () => ({
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { ...mockData.text, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...mockData.secretManagers, refetch: jest.fn(), error: null, loading: false }
  }),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetYamlSchema: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Secret Details', () => {
  test('Text Secret', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretDetails
          mockSecretDetails={mockData.text as any}
          connectorListMockData={mockData.secretManagers as any}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      const $editButton = await findByText(container, 'Edit Details')
      fireEvent.click($editButton)
      await waitFor(() => getByText(document.body, 'Edit Encrypted Text'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
  })
  test('File Secret', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/org/:orgIdentifier/resources/secrets"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy' }}
      >
        <SecretDetails mockSecretDetails={mockData.file as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('SSH Secret with Key', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretDetails
          mockSecretDetails={mockData.sshKey as any}
          mockPassword={mockData.text.data as any}
          mockPassphrase={mockData.text.data as any}
          mockKey={mockData.file.data as any}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

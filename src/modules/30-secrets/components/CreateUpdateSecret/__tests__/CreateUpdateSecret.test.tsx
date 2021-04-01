import React from 'react'
import { render, fireEvent, findByText, act, getByText, queryByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import CreateUpdateSecret from '../CreateUpdateSecret'

import mockData from './listSecretManagersMock.json'
import connectorMockData from './getConnectorMock.json'
import secretDetailsMock from './secretDetailsMock.json'
import secretMockData from './secretMockData.json'

const mockUpdateTextSecret = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTextSecret })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetSecretV2: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), data: secretMockData })),
  useGetConnectorList: () => {
    return {
      data: mockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorMockData,
      refetch: jest.fn()
    }
  }
}))

describe('CreateUpdateSecret', () => {
  test('Create Text Secret', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretText'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Create File Secret', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretFile'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    expect(getByText(container, 'Secret type')).toBeDefined()
    expect(getByText(container, 'Secret Value*')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button and switch radio from text to file', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    expect(getByText(container, 'Secret Value*')).toBeDefined()
    fireEvent.click(getByText(container, 'File'))
    expect(getByText(container, 'Select File')).toBeDefined()
    expect(queryByText(container, 'Secret Value*')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button and switch radio from text to file and back', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    expect(getByText(container, 'Secret Value*')).toBeDefined()
    fireEvent.click(getByText(container, 'File'))
    expect(getByText(container, 'Select File')).toBeDefined()
    expect(queryByText(container, 'Secret Value*')).toBeNull()
    fireEvent.click(getByText(container, 'Text'))
    expect(queryByText(container, 'Select File')).toBeNull()
    expect(getByText(container, 'Secret Value*')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Update Text Secret', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret secret={secretDetailsMock as any} type={'SecretText'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.change(container.querySelector("textarea[name='description']")!, { target: { value: 'new desc' } })
      const submitBtn = await findByText(container, 'Save')
      fireEvent.click(submitBtn)
    })

    expect(mockUpdateTextSecret).toHaveBeenCalledWith({
      secret: {
        type: 'SecretText',
        name: 'text1',
        identifier: 'text1',
        description: 'new desc',
        tags: {},
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        spec: { secretManagerIdentifier: 'vault1', valueType: 'Inline' }
      }
    })
  })
})

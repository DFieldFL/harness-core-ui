/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateSmtpWizard from '../CreateSmtpWizard'
let validateNameCalled = false
let createSmtpCalled = false
jest.mock('services/cd-ng', () => ({
  useGetSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    data: {
      status: 'SUCCESS',
      data: {
        uuid: 'fdfdsfd',
        accountId: 'dummy',
        name: 'check1',
        value: {
          host: '192.168.0.102',
          port: 465,
          fromAddress: null,
          useSSL: true,
          startTLS: false,
          username: 'apikey',
          password: '*******'
        }
      },
      metaData: null,
      correlationId: 'dummy'
    },
    refetch: jest.fn()
  })),
  useValidateName: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      validateNameCalled = true
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  })),
  useUpdateSmtp: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 'SUCCESS',
        data: {
          uuid: 'fdfdsfd'
        }
      })
    }),
    refetch: jest.fn()
  })),
  useCreateSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      createSmtpCalled = true
      return Promise.resolve({
        status: 'SUCCESS',
        data: {
          uuid: 'fdfdsfd'
        }
      })
    }),
    refetch: jest.fn()
  })),
  useValidateConnectivity: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  })),
  useDeleteSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  }))
}))

describe('smtp details', () => {
  const setup = (): RenderResult =>
    render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <CreateSmtpWizard />
      </TestWrapper>
    )

  test('render smtp creation dialog', async () => {
    const { container } = setup()
    expect(container).toMatchSnapshot()
  })

  test('smtp name test', async () => {
    const { container, getByText } = setup()

    waitFor(() => {
      return expect(getByText('continue')).toBeTruthy()
    })
    fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: '$##test' } })
    fireEvent.change(container.querySelector('input[name="host"]')!, { target: { value: 'host' } })
    fireEvent.change(container.querySelector('input[name="port"]')!, { target: { value: 123 } })
    fireEvent.click(getByText('continue'))
    await waitFor(() => {
      return expect(getByText('common.validation.namePatternIsNotValid')).toBeTruthy()
    })
  })

  test('create smtp details and test', async () => {
    const { container, getByText } = setup()

    waitFor(() => {
      return expect(getByText('continue')).toBeTruthy()
    })
    fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'test' } })
    fireEvent.change(container.querySelector('input[name="host"]')!, { target: { value: 'host' } })
    fireEvent.change(container.querySelector('input[name="port"]')!, { target: { value: 123 } })
    fireEvent.click(getByText('continue'))
    await waitFor(() => {
      return expect(getByText('saveAndContinue')).toBeTruthy()
    })
    expect(validateNameCalled).toBeTruthy()
    fireEvent.change(container.querySelector('input[name="username"]')!, { target: { value: 'test' } })
    fireEvent.change(container.querySelector('input[name="password"]')!, { target: { value: 'test' } })
    fireEvent.click(getByText('saveAndContinue'))
    await waitFor(() => {
      return expect(getByText('continue')).toBeTruthy()
    })
    expect(createSmtpCalled).toBeTruthy()
    fireEvent.change(container.querySelector('input[name="to"]')!, { target: { value: 'test@test.com' } })
    fireEvent.click(getByText('test'))
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      return expect(getByText('common.smtp.emailSent')).toBeTruthy()
    })
  })
  test('fail to create smtp details', async () => {
    validateNameCalled = false
    const { container, getByText } = setup()
    waitFor(() => {
      return expect(getByText('continue')).toBeTruthy()
    })
    fireEvent.change(container.querySelector('input[name="host"]')!, { target: { value: 'host' } })
    fireEvent.change(container.querySelector('input[name="port"]')!, { target: { value: 123 } })
    fireEvent.click(getByText('continue'))
    expect(validateNameCalled).toBeFalsy()
  })
})

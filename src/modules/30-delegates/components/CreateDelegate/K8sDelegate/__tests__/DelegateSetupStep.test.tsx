/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateSetupStep from '../DelegateSetupStep/DelegateSetupStep'
import DelegateSizesmock from './DelegateSizesmock.json'
import DelegateProfilesMock from './DelegateProfilesMock.json'

const featureFlags = {
  NG_SHOW_DEL_TOKENS: true
}

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useCreateDelegateToken: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => undefined)
  })),
  useGetDelegateSizes: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: DelegateSizesmock, refetch: jest.fn(), error: null, loading: false }
  }),
  useValidateKubernetesYaml: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateTokens: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => ({
      resource: []
    }))
  }))
}))
jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: DelegateProfilesMock, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('Create DelegateSetup Step', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <DelegateSetupStep />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submit click required name', async () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <DelegateSetupStep />
      </TestWrapper>
    )
    const submitBtn = getByText('continue')
    act(() => {
      fireEvent.click(submitBtn)
    })
    await waitFor(() => expect(container.innerHTML).toContain('delegateNameRequired'))
  })

  test('submit click', async () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <DelegateSetupStep />
      </TestWrapper>
    )

    const nameInput = container.getElementsByTagName('input')[0]
    act(() => {
      fireEvent.change(nameInput, 'new name')
    })
    const submitBtn = getByText('continue')
    act(() => {
      fireEvent.click(submitBtn)
    })
    await waitFor(() => expect(container.innerHTML).not.toContain('delegateNameRequired'))
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateK8sDelegate from '../CreateK8sDelegate'
import DelegateSizesmock from './DelegateSizesmock.json'

const featureFlags = {
  NG_SHOW_DEL_TOKENS: true
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useCreateDelegateToken: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => undefined)
  })),
  useGetDelegateProfilesV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
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
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}))
const onBack = jest.fn()

describe('Create K8s Delegate', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <CreateK8sDelegate onBack={onBack} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('test back btn', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <CreateK8sDelegate onBack={onBack} />
      </TestWrapper>
    )
    const buttons = container.getElementsByTagName('button')
    const backBtn = buttons[1]
    act(() => {
      fireEvent.click(backBtn!)
    })
    expect(onBack).toBeCalled()
  })
})

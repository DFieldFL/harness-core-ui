/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Step1Setup from '../Step1Setup/Step1Setup'

const featureFlags = {
  NG_SHOW_DEL_TOKENS: true
}

jest.mock('services/portal', () => ({
  useCreateDelegateToken: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => undefined)
  })),
  useGetDelegateSizes: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          size: 'MEDIUM',
          label: 'medium',
          ram: '16',
          cpu: '4'
        }
      ],
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGenerateDockerDelegate: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn().mockImplementation(() => ({
        resource: {}
      }))
    }
  }),
  useGetDelegateTokens: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => ({
      resource: [
        {
          name: 'Token1'
        }
      ]
    }))
  }))
}))

describe('Create Docker Step1Setup', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <Step1Setup />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

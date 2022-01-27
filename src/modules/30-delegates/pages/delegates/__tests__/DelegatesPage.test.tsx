/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesPage from '../DelegatesPage'
import DelegateListing from '../DelegateListing'
import ProfileMock from './ProfilesMock'

const featureFlags = {
  NG_SHOW_DEL_TOKENS: true
}

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupsNGV2WithFilter: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

jest.mock('services/cd-ng', () => ({
  useListDelegateConfigsNgV2WithFilter: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      mutate: jest.fn().mockImplementation(() => ProfileMock),
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  usePostFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useUpdateFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useDeleteFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
describe('Delegates Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegates"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={{ featureFlags }}
      >
        <DelegatesPage>
          <DelegateListing />
        </DelegatesPage>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

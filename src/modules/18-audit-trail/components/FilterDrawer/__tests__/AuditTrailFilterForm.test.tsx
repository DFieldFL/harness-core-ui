/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AuditTrailFilterForm from '../AuditTrailFilterForm'
import { usersData, organizations } from './mockData'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: usersData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: organizations, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectListWithMultiOrgFilter: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Audit trail filter form test', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <AuditTrailFilterForm />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import type { Target } from 'services/cf'
import TargetSelect, { TargetSelectProps } from '../TargetSelect'

type UseGetAllTargetsReturn = ReturnType<typeof cfServices['useGetAllTargets']>

const mockResponse = (overrides: Partial<UseGetAllTargetsReturn> = {}): UseGetAllTargetsReturn =>
  ({
    data: { targets: [{ name: 'Target 1', identifier: 't1' }] },
    error: null,
    loading: false,
    refetch: jest.fn(),
    ...overrides
  } as any)

const renderComponent = (props: Partial<TargetSelectProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: 'Target_Group_1'
      }}
      queryParams={{ environment: 'env' }}
    >
      <TargetSelect environment="env" fieldName="testField" label="Field" {...props} />
    </TestWrapper>
  )

describe('TargetSelect', () => {
  const useGetAllTargetsMock = jest.spyOn(cfServices, 'useGetAllTargets')

  beforeEach(() => {
    jest.resetAllMocks()
    useGetAllTargetsMock.mockReturnValue(mockResponse())
  })

  test('it should render a multi select', async () => {
    const label = 'TEST FIELD LABEL'
    renderComponent({ label })

    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('- cf.segmentDetail.searchTarget -')).toBeInTheDocument()
  })

  test('it should display the list of targets when the field is clicked', async () => {
    const mockTargets = [
      { name: 'Target 1', identifier: 't1' },
      { name: 'Target 2', identifier: 't2' },
      { name: 'Target 3', identifier: 't3' }
    ] as Target[]

    useGetAllTargetsMock.mockReturnValue(
      mockResponse({
        data: { targets: mockTargets } as any
      })
    )
    renderComponent()

    expect(screen.queryByText(mockTargets[0].name)).not.toBeInTheDocument()
    expect(screen.queryByText(mockTargets[1].name)).not.toBeInTheDocument()
    expect(screen.queryByText(mockTargets[2].name)).not.toBeInTheDocument()

    userEvent.click(screen.getByPlaceholderText('- cf.segmentDetail.searchTarget -'))

    await waitFor(() => {
      expect(screen.getByText(mockTargets[0].name)).toBeInTheDocument()
      expect(screen.getByText(mockTargets[1].name)).toBeInTheDocument()
      expect(screen.getByText(mockTargets[2].name)).toBeInTheDocument()
    })
  })

  test('it should trigger a refetch when the field is typed in', async () => {
    const searchTerm = 'TEST'
    const refetchMock = jest.fn()
    useGetAllTargetsMock.mockReturnValue(mockResponse({ refetch: refetchMock }))

    renderComponent()

    expect(refetchMock).not.toHaveBeenCalled()

    await userEvent.type(screen.getByPlaceholderText('- cf.segmentDetail.searchTarget -'), searchTerm)

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({ targetName: searchTerm })
        })
      )
    })
  })
})

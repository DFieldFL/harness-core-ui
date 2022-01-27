/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { omit } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import type { Segment, Target } from 'services/cf'
import EditTargetGroupCriteriaDialog, { EditTargetGroupCriteriaDialogProps } from '../EditTargetGroupCriteriaDialog'

const mockTargets = [
  { identifier: 't1', name: 'Target 1' },
  { identifier: 't2', name: 'Target 2' },
  { identifier: 't3', name: 'Target 3' },
  { identifier: 't4', name: 'Target 4' },
  { identifier: 't5', name: 'Target 5' },
  { identifier: 't6', name: 'Target 6' }
] as Target[]

const mockTargetGroup = {
  identifier: 'tg1',
  environment: 'env',
  rules: [
    { id: 'r1', attribute: 'name', op: 'starts_with', values: ['something'] },
    { id: 'r2', attribute: 'identifier', op: 'starts_with', values: ['something else '] },
    { id: 'r3', attribute: 'name', op: 'end_with', values: ['other thing'] }
  ],
  included: [...mockTargets].slice(0, 3),
  excluded: [...mockTargets].slice(3)
} as Segment

const renderComponent = (props: Partial<EditTargetGroupCriteriaDialogProps> = {}): RenderResult =>
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
      <EditTargetGroupCriteriaDialog
        targetGroup={mockTargetGroup}
        hideModal={jest.fn()}
        onUpdate={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('EditTargetGroupCriteriaDialog', () => {
  const usePatchSegmentMock = jest.spyOn(cfServices, 'usePatchSegment')
  const useGetAllTargetsMock = jest.spyOn(cfServices, 'useGetAllTargets')
  const useGetAllTargetAttributesMock = jest.spyOn(cfServices, 'useGetAllTargetAttributes')

  beforeEach(() => {
    jest.resetAllMocks()
    usePatchSegmentMock.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null
    } as any)

    useGetAllTargetsMock.mockReturnValue({
      data: { targets: [...mockTargets] },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    useGetAllTargetAttributesMock.mockReturnValue({
      data: ['ta1', 'ta2', 'ta3'],
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  test('it should display the heading, form and save and cancel buttons', async () => {
    renderComponent()

    expect(screen.getByText('cf.segmentDetail.targetGroupCriteria')).toBeInTheDocument()
    expect(document.querySelector('form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  test('it should render when rules, included and excluded are empty', async () => {
    renderComponent({ targetGroup: { ...omit(mockTargetGroup, ['rules', 'included', 'excluded']) } })

    expect(screen.getByText('cf.segmentDetail.targetGroupCriteria')).toBeInTheDocument()
    expect(document.querySelector('form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.specifyIndividualTargets')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.includeTheFollowing:')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.excludeTheFollowing:')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.targetBasedOnCondition')).toBeInTheDocument()
  })

  test('it should not try to send a patch when there are no changes', async () => {
    const sendPatchMock = jest.fn().mockResolvedValue(null)
    const hideModalMock = jest.fn()
    const onUpdateMock = jest.fn()

    usePatchSegmentMock.mockReturnValue({
      mutate: sendPatchMock,
      loading: false,
      error: null
    } as any)

    renderComponent({ hideModal: hideModalMock, onUpdate: onUpdateMock })

    expect(sendPatchMock).not.toHaveBeenCalled()
    expect(hideModalMock).not.toHaveBeenCalled()
    expect(onUpdateMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(sendPatchMock).not.toHaveBeenCalled()
      expect(hideModalMock).toHaveBeenCalled()
      expect(onUpdateMock).not.toHaveBeenCalled()
      expect(screen.queryByText('cf.segmentDetail.updated')).not.toBeInTheDocument()
    })
  })

  test('it should send a patch when submitting changes', async () => {
    const sendPatchMock = jest.fn().mockResolvedValue(null)
    const hideModalMock = jest.fn()
    const onUpdateMock = jest.fn()

    usePatchSegmentMock.mockReturnValue({
      mutate: sendPatchMock,
      loading: false,
      error: null
    } as any)

    renderComponent({ hideModal: hideModalMock, onUpdate: onUpdateMock })

    userEvent.click(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })[0])

    await waitFor(() => {
      expect(sendPatchMock).not.toHaveBeenCalled()
      expect(hideModalMock).not.toHaveBeenCalled()
      expect(onUpdateMock).not.toHaveBeenCalled()
    })

    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(sendPatchMock).toHaveBeenCalled()
      expect(screen.getByText('cf.segmentDetail.updated')).toBeInTheDocument()
      expect(hideModalMock).toHaveBeenCalled()
      expect(onUpdateMock).toHaveBeenCalled()
    })
  })

  test('it should display an error if sendPatch fails', async () => {
    const message = 'TEST ERROR MESSAGE'
    const sendPatchMock = jest.fn().mockRejectedValue({ message })
    const hideModalMock = jest.fn()
    const onUpdateMock = jest.fn()

    usePatchSegmentMock.mockReturnValue({
      mutate: sendPatchMock,
      loading: false,
      error: null
    } as any)

    renderComponent({ hideModal: hideModalMock, onUpdate: onUpdateMock })

    userEvent.click(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })[0])
    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(sendPatchMock).toHaveBeenCalled()
      expect(screen.getByText(message)).toBeInTheDocument()
      expect(hideModalMock).not.toHaveBeenCalled()
      expect(onUpdateMock).not.toHaveBeenCalled()
    })
  })

  test('it should show the loading spinner when submitting', async () => {
    usePatchSegmentMock.mockReturnValue({
      mutate: jest.fn(),
      loading: true,
      error: null
    } as any)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('saving-spinner')).toBeInTheDocument()
    })
  })
})

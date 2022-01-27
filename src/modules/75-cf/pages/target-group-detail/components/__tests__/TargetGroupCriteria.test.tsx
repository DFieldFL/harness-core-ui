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
import { Dialog } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import TargetGroupCriteria, { TargetGroupCriteriaProps } from '../TargetGroupCriteria'

jest.mock('../EditTargetGroupCriteria/EditTargetGroupCriteriaDialog', () => ({
  __esModule: true,
  default: () => (
    <Dialog isOpen enforceFocus={false}>
      <span data-testid="edit-target-group-criteria-dialog">Edit Target Group Criteria Dialog</span>
    </Dialog>
  )
}))

const mockTargetGroup = {
  createdAt: 1641567852496,
  environment: 'dev',
  excluded: [
    {
      account: '',
      environment: '',
      identifier: 't499',
      name: 'Target 499 of 1000',
      org: '',
      project: ''
    },
    {
      account: '',
      environment: '',
      identifier: 't507',
      name: 'Target 507 of 1000',
      org: '',
      project: ''
    }
  ],
  identifier: 'Target_Group_with_Specific_Targets',
  included: [
    {
      account: '',
      environment: '',
      identifier: 't501',
      name: 'Target 501 of 1000',
      org: '',
      project: ''
    },
    {
      account: '',
      environment: '',
      identifier: 't494',
      name: 'Target 494 of 1000',
      org: '',
      project: ''
    }
  ],
  name: 'Target Group with Specific Targets',
  rules: []
}

const renderComponent = (props: Partial<TargetGroupCriteriaProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: mockTargetGroup.identifier
      }}
      queryParams={{ environment: 'env' }}
    >
      <TargetGroupCriteria targetGroup={mockTargetGroup} reloadTargetGroup={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('TargetGroupCriteria', () => {
  test('it should display the heading and sub-sections', async () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: 'cf.segmentDetail.criteria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'cf.segmentDetail.specificTargets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'cf.segmentDetail.targetBasedOnCondition' })).toBeInTheDocument()
  })

  test('it should open the criteria dialog when the edit button is clicked', async () => {
    renderComponent()

    expect(screen.queryByTestId('edit-target-group-criteria-dialog')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'edit edit' }))

    await waitFor(() => {
      expect(screen.getByTestId('edit-target-group-criteria-dialog')).toBeInTheDocument()
    })
  })
})

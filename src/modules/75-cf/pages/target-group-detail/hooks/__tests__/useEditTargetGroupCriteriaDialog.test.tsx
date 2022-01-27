/* eslint-disable react/display-name */
import React, { FC } from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { Segment } from 'services/cf'
import useEditTargetGroupCriteriaDialog from '../useEditTargetGroupCriteriaDialog'

jest.mock('../../components/EditTargetGroupCriteria/EditTargetGroupCriteriaDialog', () => ({
  __esModule: true,
  default: () => (
    <Dialog isOpen enforceFocus={false}>
      <span data-testid="edit-target-group-criteria-dialog">Edit Target Group Criteria Dialog</span>
    </Dialog>
  )
}))

interface WrapperComponentProps {
  targetGroup: Segment
  onUpdate: () => void
}

const WrapperComponent: FC<WrapperComponentProps> = ({ targetGroup, onUpdate }) => {
  const [openModal] = useEditTargetGroupCriteriaDialog(targetGroup, onUpdate)

  return <button onClick={openModal}>Open dialog</button>
}

const sampleTargetGroup = {
  name: 'SAMPLE TARGET GROUP NAME',
  identifier: 'SAMPLE_TARGET_GROUP_ID'
} as Segment

const renderComponent = (props: Partial<WrapperComponentProps> = {}): RenderResult => {
  const result = render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: sampleTargetGroup.identifier
      }}
      queryParams={{ environment: 'env' }}
    >
      <WrapperComponent targetGroup={sampleTargetGroup} onUpdate={jest.fn()} {...props} />
    </TestWrapper>
  )

  userEvent.click(screen.getByRole('button', { name: 'Open dialog' }))

  return result
}

describe('useEditTargetGroupCriteriaDialog', () => {
  test('it should render the dialog', async () => {
    renderComponent()

    expect(screen.getByTestId('edit-target-group-criteria-dialog')).toBeInTheDocument()
  })
})

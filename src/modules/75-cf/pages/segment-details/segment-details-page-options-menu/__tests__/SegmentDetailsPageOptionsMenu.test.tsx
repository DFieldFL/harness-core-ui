/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import SegmentDetailsPageOptionsMenu, { SegmentDetailsPageOptionsMenuProps } from '../SegmentDetailsPageOptionsMenu'

const renderComponent = (props: Partial<SegmentDetailsPageOptionsMenuProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SegmentDetailsPageOptionsMenu deleteSegmentConfirm={jest.fn()} activeEnvironment="test-qa" {...props} />
    </TestWrapper>
  )
}

describe('SegmentDetailsPageOptionsMenu', () => {
  beforeEach(() => jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true }))

  test('it should render menu correctly when options button clicked', async () => {
    renderComponent()

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    expect(document.querySelector('[data-icon="cross"]')).toBeInTheDocument()

    expect(screen.getByText('delete')).toBeInTheDocument()
  })

  test('it should call delete callback correctly when delete option clicked', async () => {
    const deleteSegmentConfirmMock = jest.fn()

    renderComponent({ deleteSegmentConfirm: deleteSegmentConfirmMock })

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    expect(document.querySelector('[data-icon="cross"]')).toBeInTheDocument()

    expect(screen.getByText('delete')).toBeInTheDocument()

    userEvent.click(screen.getByText('delete') as HTMLButtonElement)

    expect(deleteSegmentConfirmMock).toBeCalled()
  })

  test('it should display plan enforcement popup when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    renderComponent()

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

    fireEvent.mouseOver(document.querySelector('[data-icon="cross"]') as HTMLButtonElement)

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument())
  })
})

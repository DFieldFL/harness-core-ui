/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FlagItemOptionsMenuButton, { FlagItemOptionsMenuButtonProps } from '../FlagItemOptionsMenuButton'

const renderComponent = (props: Partial<FlagItemOptionsMenuButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagItemOptionsMenuButton onClick={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('FlagItemOptionsMenuButtonProps', () => {
  beforeEach(() => jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true }))

  test('it should render menu correctly when options button clicked', async () => {
    renderComponent()

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    expect(document.querySelector('[data-icon="cross"]')).toBeInTheDocument()

    expect(screen.getByText('cf.segmentDetail.removeFomFlag')).toBeInTheDocument()
  })

  test('it should call onClick callback correctly when button clicked', async () => {
    const onClickMock = jest.fn()

    renderComponent({ onClick: onClickMock })

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    userEvent.click(screen.getByText('cf.segmentDetail.removeFomFlag'))

    expect(onClickMock).toBeCalled()
  })

  test('it should display plan enforcement popup when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    renderComponent()

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

    fireEvent.mouseOver(screen.getByText('cf.segmentDetail.removeFomFlag'))

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument())
  })
})

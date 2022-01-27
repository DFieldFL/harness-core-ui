/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

import EnvironmentDialog, { EnvironmentDialogProps } from '../EnvironmentDialog'

const renderComponent = (props: Partial<EnvironmentDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <EnvironmentDialog onCreate={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('CreateEnvironmentButton', () => {
  beforeEach(() =>
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: false })
  )

  test('it should display plan enforcement tooltip when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    renderComponent()

    const createEnvironmentButton = screen.getByRole('button', { name: '+ environment' })
    fireEvent.mouseOver(createEnvironmentButton)

    await waitFor(() => {
      expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument()
      expect(createEnvironmentButton).toHaveClass('bp3-disabled')
    })
  })

  test('it should hide tooltip and render button when plan enforcement disabled and feature disabled', async () => {
    jest
      .spyOn(usePlanEnforcementMock, 'default')
      .mockReturnValue({ isPlanEnforcementEnabled: false, isFreePlan: false })
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })

    renderComponent()

    const createEnvironmentButton = screen.getByRole('button', { name: '+ environment' })
    fireEvent.mouseOver(createEnvironmentButton)

    await waitFor(() => {
      expect(screen.queryByText('cf.planEnforcement.upgradeRequired')).not.toBeInTheDocument()
      expect(createEnvironmentButton).not.toBeDisabled()
    })
  })
})

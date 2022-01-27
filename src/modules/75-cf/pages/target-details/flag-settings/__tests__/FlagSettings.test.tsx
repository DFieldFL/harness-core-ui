/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, RenderResult, waitFor, screen } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'

import { TestWrapper } from '@common/utils/testUtils'

import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import * as cfServices from 'services/cf'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import { FlagSettings } from '../FlagSettings'

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagSettings gitSync={mockGitSync} target={mockTarget} />
    </TestWrapper>
  )
}

describe('FlagSettings', () => {
  const useGetAllFeaturesMock = jest.spyOn(cfServices, 'useGetAllFeatures')
  jest.spyOn(cfServices, 'usePatchFeature').mockReturnValue({ mutate: jest.fn(), loading: false, data: [] } as any)

  beforeEach(() => {
    useGetAllFeaturesMock.mockReturnValue({
      data: { features: [mockFeature] },
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  test('it should render correctly', async () => {
    const { container } = renderComponent()

    expect(container).toMatchSnapshot()
  })

  test('it should render plan enforcement popover when limits reached for free plans', async () => {
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })

    renderComponent()

    fireEvent.mouseOver(screen.getByPlaceholderText('- Select -'))

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument())
  })

  test('it should not render plan enforcement popover when limits reached for non-free plans', async () => {
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: false })

    renderComponent()

    fireEvent.mouseOver(screen.getByPlaceholderText('- Select -'))

    await waitFor(() => expect(screen.queryByText('cf.planEnforcement.upgradeRequired')).not.toBeInTheDocument())
  })

  test('it should disable variation drop downs when the flag is disabled', async () => {
    const disabledFeature1 = cloneDeep(mockFeature)
    disabledFeature1.identifier = 'disabled_feature_1'
    ;(disabledFeature1.envProperties as any).state = 'off'

    const disabledFeature2 = cloneDeep(disabledFeature1)
    disabledFeature2.identifier = 'disabled_feature_2'

    useGetAllFeaturesMock.mockReturnValue({
      data: { features: [mockFeature, disabledFeature1, disabledFeature2] },
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent()

    const inputs = [...document.querySelectorAll('[data-testid^="variation_select"] input')] as HTMLInputElement[]

    expect(inputs).toHaveLength(3)
    expect(inputs.filter(({ disabled }) => !disabled)).toHaveLength(1)
    expect(inputs.filter(({ disabled }) => disabled)).toHaveLength(2)
  })
})

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
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

import type { NewUserRoleDropdownProps } from '../NewUserRoleDropdown'
import NewUserRoleDropdown from '../NewUserRoleDropdown'

const renderComponent = (props: Partial<NewUserRoleDropdownProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <NewUserRoleDropdown
        roles={[
          {
            label: 'Feature Flag Manage Role',
            value: '_feature_flag_manage_role',
            managed: true,
            managedRoleAssignment: false
          },
          {
            label: 'Pipeline Executor',
            value: '_pipeline_executor',
            managed: true,
            managedRoleAssignment: false
          },
          {
            label: 'Project Admin',
            value: '_project_admin',
            managed: true,
            managedRoleAssignment: false
          }
        ]}
        value={{
          label: 'Project Admin',
          value: '_project_admin',
          managed: true,
          managedRoleAssignment: false
        }}
        handleChange={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('NewUserRoleDropdown', () => {
  beforeEach(() => jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false))

  test('it should display correct roles in dropdown', async () => {
    renderComponent()

    await waitFor(() => expect(screen.getByPlaceholderText('rbac.usersPage.selectRole')).toBeInTheDocument())

    userEvent.click(screen.getByPlaceholderText('rbac.usersPage.selectRole'))

    await waitFor(() => {
      expect(screen.getByText('Feature Flag Manage Role')).toBeInTheDocument()
      expect(screen.getByText('Pipeline Executor')).toBeInTheDocument()
      expect(screen.getByText('Project Admin')).toBeInTheDocument()
    })

    expect(screen.getByText('Feature Flag Manage Role').closest('a')).not.toHaveClass('bp3-disabled')
    expect(screen.getByText('Pipeline Executor').closest('a')).not.toHaveClass('bp3-disabled')
    expect(screen.getByText('Project Admin').closest('a')).not.toHaveClass('bp3-disabled')
  })

  test('it should show plan enforcement popover for "Feature Flags Manage Role" when plan enforcement enabled', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)

    renderComponent()

    await waitFor(() => expect(screen.getByPlaceholderText('rbac.usersPage.selectRole')).toBeInTheDocument())

    userEvent.click(screen.getByPlaceholderText('rbac.usersPage.selectRole'))

    fireEvent.mouseOver(screen.getByText('Feature Flag Manage Role'))

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument())

    expect(screen.getByText('Feature Flag Manage Role').closest('a')).toHaveClass('bp3-disabled')
    expect(screen.getByText('Pipeline Executor').closest('a')).not.toHaveClass('bp3-disabled')
    expect(screen.getByText('Project Admin').closest('a')).not.toHaveClass('bp3-disabled')
  })

  test('it should show plan enforcement popover for FF management when plan enforcement enabled and limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)

    const handleChangeMock = jest.fn()
    renderComponent({ handleChange: handleChangeMock })

    await waitFor(() => expect(screen.getByPlaceholderText('rbac.usersPage.selectRole')).toBeInTheDocument())

    userEvent.click(screen.getByPlaceholderText('rbac.usersPage.selectRole'))

    fireEvent.mouseOver(screen.getByText('Feature Flag Manage Role'))

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument())

    userEvent.click(screen.getByText('Feature Flag Manage Role'))

    await waitFor(() => expect(handleChangeMock).not.toHaveBeenCalled())

    expect(screen.getByText('Feature Flag Manage Role').closest('a')).toHaveClass('bp3-disabled')
    expect(screen.getByText('Pipeline Executor').closest('a')).not.toHaveClass('bp3-disabled')
    expect(screen.getByText('Project Admin').closest('a')).not.toHaveClass('bp3-disabled')
  })

  test('it should show not plan enforcement popover for FF management when plan enforcement disabled and limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)

    renderComponent()

    await waitFor(() => expect(screen.getByPlaceholderText('rbac.usersPage.selectRole')).toBeInTheDocument())

    userEvent.click(screen.getByPlaceholderText('rbac.usersPage.selectRole'))

    fireEvent.mouseOver(screen.getByText('Feature Flag Manage Role'))

    await waitFor(() => expect(screen.queryByText('cf.planEnforcement.upgradeRequired')).not.toBeInTheDocument())

    expect(screen.getByText('Feature Flag Manage Role').closest('a')).not.toHaveClass('bp3-disabled')
    expect(screen.getByText('Pipeline Executor').closest('a')).not.toHaveClass('bp3-disabled')
    expect(screen.getByText('Project Admin').closest('a')).not.toHaveClass('bp3-disabled')
  })

  test('it should call callback correctly when menu item clicked', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)

    const handleChangeMock = jest.fn()

    renderComponent({ handleChange: handleChangeMock })

    await waitFor(() => expect(screen.getByPlaceholderText('rbac.usersPage.selectRole')).toBeInTheDocument())

    userEvent.click(screen.getByPlaceholderText('rbac.usersPage.selectRole'))
    userEvent.click(screen.getByText('Feature Flag Manage Role'))

    await waitFor(() =>
      expect(handleChangeMock).toHaveBeenCalledWith({
        label: 'Feature Flag Manage Role',
        managed: true,
        managedRoleAssignment: false,
        value: '_feature_flag_manage_role'
      })
    )
  })
})

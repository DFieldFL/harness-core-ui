/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import { clickSubmit } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { orgPathProps } from '@common/utils/routeUtils'
import { activeUserMock, mockResponse, resourceGroupsMockData, roleMockData, usersMockData } from './mock'
import UsersPage from '../UsersPage'

jest.useFakeTimers()

const deleteActiveUser = jest.fn()
const unlockActiveUser = jest.fn()
const deleteActiveUserMock = (): ResponseBoolean => {
  deleteActiveUser()
  return mockResponse
}
const unlockActiveUserMock = (): ResponseBoolean => {
  unlockActiveUser()
  return mockResponse
}

const createUser = jest.fn()
const createUserMock = (): ResponseBoolean => {
  createUser()
  return mockResponse
}

const createRole = jest.fn()
const createRoleMock = (): ResponseBoolean => {
  createRole()
  return mockResponse
}

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => {
    return { data: roleMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  usePostRoleAssignments: jest.fn().mockImplementation(() => ({ mutate: createRoleMock })),
  useDeleteRoleAssignment: jest.fn().mockImplementation(() => ({ mutate: mockResponse }))
}))

jest.mock('services/resourcegroups', () => ({
  useGetResourceGroupList: jest.fn().mockImplementation(() => {
    return { data: resourceGroupsMockData, refetch: jest.fn(), error: null }
  })
}))

jest.mock('@common/hooks/useMutateAsGet')

jest.mock('services/cd-ng', () => ({
  checkIfLastAdminPromise: jest.fn().mockImplementation(() => ({ data: true })),
  useRemoveUser: jest.fn().mockImplementation(() => ({ mutate: deleteActiveUserMock })),
  useUnlockUser: jest.fn().mockImplementation(() => ({ mutate: unlockActiveUserMock })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: createUserMock })),
  useGetAggregatedUsers: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => activeUserMock)
  })),
  useGetUsers: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => usersMockData)
  }))
}))

jest.mock('@rbac/components/DeveloperLimitBanner/DeveloperLimitBanner.tsx', () => () => <></>)

jest.useFakeTimers()

describe('UsersPage Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toUsers(orgPathProps)} pathParams={{ accountId: 'testAcc', orgIdentifier: 'org' }}>
        <UsersPage />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('newUser'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  })
  test('Invite a User', async () => {
    createUser.mockReset()
    const addUser = getByText(container, 'newUser')
    expect(addUser).toBeTruthy()
    fireEvent.click(addUser!)
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const input = form?.querySelector('.bp3-input-ghost')!
    expect(input).toBeDefined()
    fireEvent.focus(input)
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', code: 13 })
    })
    const admin = getByText(form!, 'Admin')
    await act(async () => {
      fireEvent.click(admin)
    })
    expect(form).toMatchSnapshot()
    await act(async () => {
      clickSubmit(form!)
    })
    expect(createUser).toBeCalled()
  })
  test('Delete Active User', async () => {
    deleteActiveUser.mockReset()
    const menu = container.querySelector(`[data-testid="menu-${activeUserMock.data?.content?.[0].user.uuid}"]`)
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const deleteMenu = getByText(popover as HTMLElement, 'delete')
    await act(async () => {
      fireEvent.click(deleteMenu)
      await waitFor(() => getByText(document.body, 'rbac.usersPage.deleteTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'delete')
      fireEvent.click(deleteBtn!)
      expect(deleteActiveUser).toBeCalled()
    })
  })
  test('Add Roles', async () => {
    createRole.mockReset()
    const addRole = container.querySelector(`[data-testid="addRole-${activeUserMock.data?.content?.[0].user.uuid}"]`)
    expect(addRole).toBeTruthy()
    act(() => {
      fireEvent.click(addRole!)
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const addButton = form?.querySelector('button[data-id="btn-add"]')

    expect(addButton).toBeTruthy()

    act(() => {
      fireEvent.click(addButton!)
    })

    await act(async () => {
      clickSubmit(form!)
    })

    expect(form).toMatchSnapshot()
  })
  test('Unlock Active User', async () => {
    unlockActiveUser.mockReset()
    const menu = container.querySelector(`[data-testid="menu-${activeUserMock.data?.content?.[1].user.uuid}"]`)
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const unlockMenu = getByText(popover as HTMLElement, 'rbac.usersPage.unlockTitle')
    await act(async () => {
      fireEvent.click(unlockMenu)
      await waitFor(() => getByText(document.body, 'rbac.usersPage.unlockTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const confirmBtn = queryByText(form as HTMLElement, 'confirm')
      fireEvent.click(confirmBtn!)
      expect(unlockActiveUser).toBeCalled()
    })
  })
})

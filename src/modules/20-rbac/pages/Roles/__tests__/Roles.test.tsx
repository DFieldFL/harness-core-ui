import React from 'react'
import { act, fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import Roles from '../Roles'
import { createRoleMockData, rolesMockList } from './RolesMock'

jest.useFakeTimers()

const deleteRole = jest.fn()
const deleteRoleMock = (): Promise<{ status: string }> => {
  deleteRole()
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => {
    return { data: rolesMockList, refetch: jest.fn(), error: null }
  }),
  useDeleteRole: jest.fn().mockImplementation(() => ({ mutate: deleteRoleMock })),
  useCreateRole: jest.fn().mockImplementation(() => createRoleMockData),
  useUpdateRole: jest.fn().mockImplementation(() => createRoleMockData)
}))

jest.mock('react-timeago', () => () => 'dummy date')

describe('Role Details Page', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path="/account/:accountId/admin/access-control/roles" pathParams={{ accountId: 'testAcc' }}>
        <Roles />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getAllByText('New Role'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Create Role', async () => {
      const newRole = getByTestId('createRole')
      await act(async () => {
        fireEvent.click(newRole)
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      if (form) {
        fillAtForm([{ container: form, type: InputTypes.TEXTFIELD, value: 'new Role', fieldId: 'name' }])
        await act(async () => {
          clickSubmit(form)
        })
      }
    }),
    test('Close Role Form', async () => {
      const newRole = getByTestId('createRole')
      await act(async () => {
        fireEvent.click(newRole)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      act(() => {
        fireEvent.click(form?.querySelector('[icon="cross"]')!)
      })
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    }),
    test('Edit Role', async () => {
      const menu = container
        .querySelector(`[data-testid="role-card-${rolesMockList.data?.content?.[0].role.identifier}"]`)
        ?.querySelector("[data-icon='Options']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const edit = getByText(popover as HTMLElement, 'Edit')
      await act(async () => {
        fireEvent.click(edit)
        await waitFor(() => getByText(document.body, 'Edit Role'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        if (form) clickSubmit(form)
      })
    }),
    test('Delete Role', async () => {
      deleteRole.mockReset()
      const menu = container
        .querySelector(`[data-testid="role-card-${rolesMockList.data?.content?.[0].role.identifier}"]`)
        ?.querySelector("[data-icon='Options']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'Delete')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'Delete Role'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'Delete')
        fireEvent.click(deleteBtn!)
        expect(deleteRole).toBeCalled()
      })
    }),
    test('Go to Role Details', async () => {
      const card = getByTestId('role-card-role1')
      act(() => {
        fireEvent.click(card)
      })
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toRoleDetails({
            accountId: 'testAcc',
            roleIdentifier: 'role1'
          })
        )
      ).toBeTruthy()
    })
})

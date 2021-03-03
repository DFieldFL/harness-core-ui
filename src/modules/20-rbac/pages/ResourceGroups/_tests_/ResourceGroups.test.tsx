import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, RenderResult } from '@testing-library/react'

import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { fillAtForm, clickSubmit, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import ResourceGroups from '../ResourceGroups'
import { resourceGroupListResponse } from './mock'

jest.mock('react-timeago', () => () => 'dummy date')

const deleteResourceGroup = jest.fn()
const createResourceGroup = jest.fn()
const updateResourceGroup = jest.fn()
const deleteResourceMock = (): Promise<{ status: string }> => {
  deleteResourceGroup()
  return Promise.resolve({ status: 'SUCCESS' })
}
const createResourceMock = (): Promise<{ status: string }> => {
  createResourceGroup()
  return Promise.resolve({ status: 'SUCCESS' })
}
const updateResourceMock = (): Promise<{ status: string }> => {
  updateResourceGroup()
  return Promise.resolve({ status: 'SUCCESS' })
}
jest.mock('services/cd-ng', () => ({
  useGetResourceGroupList: jest.fn().mockImplementation(() => {
    return { data: resourceGroupListResponse, refetch: jest.fn(), error: null }
  }),
  useDeleteResourceGroup: jest.fn().mockImplementation(() => ({ mutate: deleteResourceMock })),
  useCreateResourceGroup: jest.fn().mockImplementation(() => ({ mutate: createResourceMock })),
  useUpdateResourceGroup: jest.fn().mockImplementation(() => ({ mutate: updateResourceMock }))
}))

describe('Resource Groups Page', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper path={routes.toResourceGroups({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <ResourceGroups />
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('render data', () => {
    const { container } = renderObj
    expect(container).toMatchSnapshot()
  })
  test('delete  resource group data', async () => {
    deleteResourceGroup.mockReset()
    const { getByTestId, getByText } = renderObj
    await act(async () => {
      fireEvent.click(getByTestId('resourceGroupDetailsEditMenuss33'))
    })
    await waitFor(() => {
      expect(getByText('Delete')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('Delete'))
    })
    await waitFor(() => {
      expect(getByText('Delete Resource Group')).toBeDefined()
    })
    await waitFor(() => {
      fireEvent.click(getByText('Delete'))
    })
    await waitFor(() => {
      expect(deleteResourceGroup).toBeCalled()
    })
  })
  test('create  resource group data', async () => {
    createResourceGroup.mockReset()
    const { getByTestId } = renderObj
    await act(async () => {
      await waitFor(() => {
        expect(getByTestId('addNewResourceGroup')).toBeDefined()
      })
      fireEvent.click(getByTestId('addNewResourceGroup'))
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    if (form) {
      fillAtForm([{ container: form, type: InputTypes.TEXTFIELD, value: 'new resource', fieldId: 'name' }])
      clickSubmit(form)
      await waitFor(() => {
        expect(createResourceGroup).toBeCalled()
      })
    }
  })
  test('create  with errors resource group data', async () => {
    createResourceGroup.mockReset()
    const { getByTestId } = renderObj
    await act(async () => {
      await waitFor(() => {
        expect(getByTestId('addNewResourceGroup')).toBeDefined()
      })
      fireEvent.click(getByTestId('addNewResourceGroup'))
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    if (form) {
      clickSubmit(form)
      expect(queryByText(form, 'name is a required field')).toBeDefined()
    }
  })
  test('edit  resource group data', async () => {
    updateResourceGroup.mockReset()
    const { getByTestId, getByText } = renderObj
    await act(async () => {
      fireEvent.click(getByTestId('resourceGroupDetailsEditMenuss33'))
    })
    await waitFor(() => {
      expect(getByText('Edit')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('Edit'))
    })

    const form = findDialogContainer()
    expect(form).toBeTruthy()
    if (form) {
      clickSubmit(form)
      await waitFor(() => {
        expect(updateResourceGroup).toBeCalled()
      })
    }
  })
})

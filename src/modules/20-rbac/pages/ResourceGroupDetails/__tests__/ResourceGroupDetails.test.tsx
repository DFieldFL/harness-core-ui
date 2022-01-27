/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, RenderResult, queryByAttribute, getByText } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, resourceGroupPathProps } from '@common/utils/routeUtils'
import {
  getResourceTypeHandlerMock,
  getResourceGroupTypeHandlerMock,
  getResourceCategoryListMock
} from '@rbac/utils/RbacFactoryMockData'
import ResourceGroupDetails from '../ResourceGroupDetails'
import { resourceTypes, resourceGroupDetails, resourceGroupDetailsWithHarnessManaged } from './mock'

const updateResourceGroupDetails = jest.fn()
const getResourceGroupDetailsMock = jest.fn().mockImplementation(() => {
  return { data: resourceGroupDetails, refetch: jest.fn(), error: null, loading: false }
})
const updateResourceGroupDetailsMock = (data: any): Promise<{ status: string }> => {
  updateResourceGroupDetails(data.resourcegroup)
  return Promise.resolve({ status: 'SUCCESS' })
}
jest.mock('services/resourcegroups', () => ({
  useGetResourceTypes: jest.fn().mockImplementation(() => {
    return { data: resourceTypes, refetch: jest.fn(), error: null, loading: false }
  }),
  useUpdateResourceGroup: jest.fn().mockImplementation(() => ({ mutate: updateResourceGroupDetailsMock })),
  useGetResourceGroup: jest.fn().mockImplementation(() => {
    return getResourceGroupDetailsMock()
  })
}))

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource)),
  getResourceCategoryHandler: jest.fn().mockImplementation(resource => getResourceGroupTypeHandlerMock(resource)),
  getResourceCategoryList: jest.fn().mockImplementation(() => getResourceCategoryListMock()),
  getResourceTypeLabelKey: jest.fn(),
  isRegisteredResourceType: jest.fn().mockImplementation(() => true)
}))

describe('Resource Groups Page', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper
        path={routes.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps })}
        pathParams={{ accountId: 'dummy', resourceGroupIdentifier: 'dummyResourceGroupIdentifier' }}
      >
        <ResourceGroupDetails />
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
  })
  test('render data', async () => {
    const { container } = renderObj
    expect(container).toMatchSnapshot()
  })
  test('test projects selection and save', async () => {
    const { getAllByText, container } = renderObj
    const project = queryByAttribute('data-testid', container, 'CHECK-BOX-CONNECTOR')
    expect(project).toBeTruthy()
    act(() => {
      fireEvent.click(project!)
    })
    expect(getAllByText('rbac.resourceGroup.all')[0]).toBeTruthy()
    await act(async () => {
      fireEvent.click(getByText(container, 'applyChanges'))
    })
    expect(updateResourceGroupDetails).toBeCalledWith({
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'nameewrewew',
      resourceSelectors: [
        { type: 'DynamicResourceSelector', resourceType: 'SECRET', includeChildScopes: false },
        { type: 'DynamicResourceSelector', resourceType: 'CONNECTOR', includeChildScopes: false }
      ],
      tags: {},
      description: '',
      color: '#0063f7'
    })
  })
  test('test orgs selection and save', async () => {
    const { container, getByTestId } = renderObj
    const specifiedResource = getByTestId('static-SECRET')
    act(() => {
      fireEvent.click(specifiedResource)
    })
    const addResources = getByTestId('addResources-SECRET')
    expect(addResources).toBeTruthy()
    act(() => {
      fireEvent.click(addResources)
    })
    let form = findDialogContainer()
    expect(form).toBeTruthy()

    act(() => {
      fireEvent.click(getByText(form!, 'cancel'))
    })
    form = findDialogContainer()
    expect(form).toBeFalsy()

    await act(async () => {
      fireEvent.click(getByText(container, 'applyChanges'))
    })
    expect(updateResourceGroupDetails).toBeCalledWith({
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'nameewrewew',
      resourceSelectors: [
        { type: 'DynamicResourceSelector', resourceType: 'SECRET', includeChildScopes: false },
        { type: 'DynamicResourceSelector', resourceType: 'CONNECTOR', includeChildScopes: false }
      ],
      tags: {},
      description: '',
      color: '#0063f7'
    })
  })
})
test('with harness managed resources', async () => {
  getResourceGroupDetailsMock.mockImplementation(() => {
    return { data: resourceGroupDetailsWithHarnessManaged, refetch: jest.fn(), error: null, loading: false }
  })
  const { queryByText } = render(
    <TestWrapper
      path={routes.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps })}
      pathParams={{ accountId: 'dummy', resourceGroupIdentifier: 'dummyResourceGroupIdentifier' }}
    >
      <ResourceGroupDetails />
    </TestWrapper>
  )
  const applyChanges = queryByText('applyChanges')
  expect(applyChanges).toBeFalsy()
})

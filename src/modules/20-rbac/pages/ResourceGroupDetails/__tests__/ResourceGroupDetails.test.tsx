import React from 'react'
import { render, act, fireEvent, waitFor, RenderResult, queryByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, resourceGroupPathProps } from '@common/utils/routeUtils'
import {
  getResourceTypeHandlerMock,
  getResourceGroupTypeHandlerMock,
  getResourceCategoryListMock
} from '@rbac/utils/RbacFactoryMockData'
import ResourceGroupDetails from '../ResourceGroupDetails'
import { resourceTypes, resourceGroupDetails, resourceGroupDetailsWithHarnessManaged } from './mock'

jest.mock('react-timeago', () => () => 'dummy date')

const updateResourceGroupDetails = jest.fn()
const getResourceGroupDetailsMock = jest.fn().mockImplementation(() => {
  return { data: resourceGroupDetails, refetch: jest.fn(), error: null, loading: false }
})
const updateResourceGroupDetailsMock = (data: any): Promise<{ status: string }> => {
  updateResourceGroupDetails(data.resourcegroup)
  return Promise.resolve({ status: 'SUCCESS' })
}
jest.mock('services/platform', () => ({
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
  getResourceCategoryList: jest.fn().mockImplementation(() => getResourceCategoryListMock())
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
    const { getByText, getAllByText, container } = renderObj
    const project = queryByAttribute('data-testid', container, 'CHECK-BOX-PROJECT')
    expect(project).toBeTruthy()
    fireEvent.click(project!)
    await waitFor(() => {
      expect(getAllByText('resourceGroup.all')[0]).toBeDefined()
    })
    act(() => {
      fireEvent.click(getByText('applyChanges'))
    })
    expect(updateResourceGroupDetails).toBeCalledWith({
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'ewrewew',
      resourceSelectors: [
        { type: 'DynamicResourceSelector', resourceType: 'ORGANIZATION' },
        { type: 'DynamicResourceSelector', resourceType: 'PROJECT' }
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
  await waitFor(() => {
    expect(queryByText('All Organizations')).toBeDefined()
  })
  expect(queryByText('Apply Changes')).toBeNull()
})

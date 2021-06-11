import React from 'react'
import {
  render,
  waitFor,
  queryByAttribute,
  fireEvent,
  findByText as findByTextGlobal,
  act
} from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { useGetListOfExecutions } from 'services/pipeline-ng'

import PipelineDeploymentList from '../PipelineDeploymentList'
import data from './execution-list.json'
import pipelines from '../../../components/PipelineModalListView/__tests__/RunPipelineListViewMocks'
import filters from './filters.json'
import services from '../../pipelines/__tests__/mocks/services.json'
import environments from '../../pipelines/__tests__/mocks/environments.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

const mockGetCallFunction = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(data)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelines)), cancel: jest.fn(), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  usePostFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useUpdateFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useDeleteFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  }))
}))

jest.mock('services/cd-ng', () => ({
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() }))
}))

function ComponentWrapper(): React.ReactElement {
  const location = useLocation()
  return (
    <React.Fragment>
      <PipelineDeploymentList onRunPipeline={jest.fn()} />
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
    </React.Fragment>
  )
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
  pathParams: {
    accountId: 'testAcc',
    orgIdentifier: 'testOrg',
    projectIdentifier: 'testProject',
    module: 'cd'
  },
  defaultAppStoreValues
}
jest.useFakeTimers()

// eslint-disable-next-line jest/no-disabled-tests
describe('Test Pipeline Deployment list', () => {
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })

  test('should render deployment list', async () => {
    const { container, findByText } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDeploymentList onRunPipeline={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => findByText('http_pipeline', { selector: '.pipelineName' }))
    expect(container).toMatchSnapshot()
  })

  // TODO:PMS enable search once with actual API
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('search works', () => {
    const { container, getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    const search = queryByAttribute('type', container, 'search')!

    fireEvent.change(search, { target: { value: 'my search term' } })
    jest.runOnlyPendingTimers()

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?query=my%20search%20term
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        executionStatuses: undefined,
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifiers: undefined,
        projectIdentifier: 'testProject',
        searchTerm: 'my search term'
      }
    })

    const clear = queryByAttribute('data-icon', container, 'small-cross')!.closest('button')!
    fireEvent.click(clear)

    jest.runOnlyPendingTimers()

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?query=
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        executionStatuses: undefined,
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifiers: undefined,
        projectIdentifier: 'testProject',
        searchTerm: ''
      }
    })
  })

  test('Status selection works', async () => {
    const { getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    const select = await waitFor(() => getByTestId('status-select')!)

    fireEvent.click(select)

    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const option1 = await findByTextGlobal(document.body, 'pipeline.executionFilters.labels.Failed', {
      selector: '.bp3-fill > span'
    })

    fireEvent.click(option1)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?status=Failed&page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        status: 'Failed',
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false
      }
    })

    fireEvent.click(select)

    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const option2 = await findByTextGlobal(document.body, 'Clear Selection', { selector: '.bp3-fill' })

    fireEvent.click(option2)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false
      }
    })
  })

  // TODO:PMS enable search once with actual API
  // eslint-disable-next-line jest/no-disabled-tests
  test('Pipeline selection works', async () => {
    const { getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    const select = await waitFor(() => getByTestId('pipeline-select')!)

    fireEvent.click(select)

    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))

    const option1 = await findByTextGlobal(document.body, 'pipeline1', { selector: '.bp3-fill' })

    fireEvent.click(option1)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?pipelineIdentifier=pipeline1&page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifier: 'pipeline1',
        projectIdentifier: 'testProject',
        status: undefined,
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false
      }
    })

    fireEvent.click(select)

    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const option2 = await findByTextGlobal(document.body, 'Clear Selection', { selector: '.bp3-fill' })

    fireEvent.click(option2)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        status: undefined,
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false
      }
    })
  })
})

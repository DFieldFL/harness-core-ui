import React from 'react'
import { render, fireEvent, waitFor, findAllByText as findAllByTextGlobal } from '@testing-library/react'

import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import ExecutionContext, { ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { ExecutionNode, useGetApprovalInstance, useGetExecutionNode } from 'services/pipeline-ng'
import ExecutionStepDetails from '../ExecutionStepDetails'
import data from './data.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/pipeline-ng', () => ({
  useGetApprovalInstance: jest.fn(() => ({ data: {}, loading: false })),
  useGetHarnessApprovalInstanceAuthorization: jest.fn(() => ({ data: {}, loading: false })),
  useAddHarnessApprovalActivity: jest.fn(() => ({ mutate: jest.fn() })),
  useGetExecutionNode: jest.fn(() => ({ data: {}, loading: false }))
}))
jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  stageId: 'selectedStageId'
}

const executionContext: ExecutionContextParams = {
  ...(data as any),
  pipelineStagesMap: new Map(),
  setLogsToken: jest.fn(),
  refetch: jest.fn(),
  addNewNodeToMap: jest.fn()
}

function TestComponent(props: {
  children?: React.ReactNode
  queryParams?: ExecutionContextParams['queryParams']
  nodesMap?: ExecutionContextParams['allNodeMap']
  selectedStep?: string
}): React.ReactElement {
  const { children, queryParams = {}, nodesMap, selectedStep = '', ...rest } = props
  const [allNodeMap, setAllNodeMap] = React.useState(nodesMap || executionContext.allNodeMap)

  function addNewNodeToMap(uuid: string, node: ExecutionNode): void {
    setAllNodeMap(old => ({
      ...old,
      [uuid]: node
    }))
  }

  return (
    <TestWrapper path={TEST_PATH} pathParams={pathParams}>
      <ExecutionContext.Provider
        value={{ ...executionContext, queryParams, allNodeMap, addNewNodeToMap, selectedStepId: selectedStep }}
      >
        <ExecutionStepDetails {...rest} />
        {props.children}
      </ExecutionContext.Provider>
    </TestWrapper>
  )
}

describe('<ExecutionStepDetails /> tests', () => {
  test('renders normal step', () => {
    const { container } = render(<TestComponent selectedStep="normalStep" />)
    expect(container).toMatchSnapshot()
  })

  describe('approval steps', () => {
    test('renders approval waiting step', () => {
      const { container } = render(<TestComponent selectedStep="approvalStepWaiting" />)
      expect(container).toMatchSnapshot()
    })

    test('renders approval complete step', () => {
      const { container } = render(<TestComponent selectedStep="approvalStepComplete" />)
      expect(container).toMatchSnapshot()
    })
    test('renders normal error step', () => {
      const { container } = render(<TestComponent selectedStep="errorStep" />)
      expect(container).toMatchSnapshot()
    })

    test('click on refresh triggers new approval call', async () => {
      const refetch = jest.fn()
      ;(useGetApprovalInstance as jest.Mock).mockImplementation(() => ({ data: {}, loading: false, refetch }))

      const { container, findByText } = render(<TestComponent selectedStep="approvalStepWaiting" />)
      expect(container).toMatchSnapshot()

      const refresh = await findByText('common.refresh')

      fireEvent.click(refresh)

      await waitFor(() => expect(refetch).toHaveBeenCalled())
    })
  })

  describe('retried steps', () => {
    test('shows step selection', async () => {
      const { container, findByTestId } = render(
        <TestComponent selectedStep="retriedStep">
          <CurrentLocation />
        </TestComponent>
      )
      expect(container).toMatchSnapshot()

      const loc1 = await findByTestId('location')

      expect(loc1).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline
        </div>
      `)

      const retryLogs1 = await findByTestId('retry-logs')

      fireEvent.click(retryLogs1)

      const retries = await findAllByTextGlobal(document.body, 'pipeline.execution.retryStepCount', {
        selector: '.bp3-menu-item > div'
      })

      fireEvent.click(retries[0])

      const loc2 = await findByTestId('location')

      expect(loc2).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline?retryStep=retryId_2
        </div>
      `)

      const retryLogs2 = await findByTestId('retry-logs')

      fireEvent.click(retryLogs2)

      const current = await findAllByTextGlobal(document.body, 'pipeline.execution.currentExecution', {
        selector: '.bp3-menu-item > div'
      })

      fireEvent.click(current[0])

      const loc3 = await findByTestId('location')

      expect(loc3).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline
        </div>
      `)
    })

    // define data outside to avoid infinite loop in react useEffect. It will keep the same reference.
    const responseData = {
      data: {
        uuid: 'retryId_1',
        name: 'Retried Step 1'
      }
    }

    test('fetches data for retry step, if not present', async () => {
      ;(useGetExecutionNode as jest.Mock).mockImplementation(() => ({
        data: responseData,
        loading: false
      }))
      const { container, findByText } = render(
        <TestComponent selectedStep="retriedStep" queryParams={{ retryStep: 'retryId_1' }} />
      )
      await findByText(/Retried Step 1/, { selector: '.title' })
      expect(container).toMatchSnapshot()
    })

    test('does not fetches data for retry step, if already present', async () => {
      ;(useGetExecutionNode as jest.Mock).mockImplementation(() => ({
        data: null,
        loading: false
      }))
      const { container, findByText } = render(
        <TestComponent
          selectedStep="retriedStep"
          queryParams={{ retryStep: 'retryId_1' }}
          nodesMap={{
            ...executionContext.allNodeMap,
            retryId_1: {
              uuid: 'retryId_1',
              name: 'Already_Present_Data'
            }
          }}
        />
      )
      await findByText(/Already_Present_Data/, { selector: '.title' })
      expect(container).toMatchSnapshot()
    })

    test('shows loader while loading', () => {
      ;(useGetExecutionNode as jest.Mock).mockImplementation(() => ({
        data: null,
        loading: true
      }))
      const { container } = render(<TestComponent selectedStep="retriedStep" />)
      expect(container).toMatchSnapshot()
    })
  })
})

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, findByText as findByTextContainer, queryByAttribute } from '@testing-library/react'

import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { ResponsePipelineExecutionDetail, useGetExecutionDetail } from 'services/pipeline-ng'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { getActiveStageForPipeline, getActiveStep } from '@pipeline/utils/executionUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import ExecutionLandingPage, { POLL_INTERVAL } from '../ExecutionLandingPage'
import mockData from './mock.json'

jest.mock('services/pipeline-ng', () => ({
  useGetExecutionDetail: jest.fn(() => ({
    refetch: jest.fn(),
    loading: false,
    data: {
      data: { pipelineExecution: {}, stageGraph: {} }
    }
  })),
  useHandleInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useHandleStageInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useGetInputsetYaml: jest.fn(() => ({ data: null }))
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.useFakeTimers()

const TEST_EXECUTION_PATH = routes.toExecution({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})
const TEST_EXECUTION_PIPELINE_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve([]))
})

describe('<ExecutionLandingPage /> tests', () => {
  const pathParams: PipelineType<ExecutionPathProps> = {
    accountId: 'TEST_ACCOUNT_ID',
    orgIdentifier: 'TEST_ORG',
    projectIdentifier: 'TEST_PROJECT',
    pipelineIdentifier: 'TEST_PIPELINE',
    executionIdentifier: 'TEST_EXECUTION',
    module: 'cd'
  }

  test('loading state - snapshot test', () => {
    ;(useGetExecutionDetail as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const { container } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test.each<[string, string]>([
    ['common.pipeline', routes.toExecutionPipelineView(pathParams)],
    ['inputs', routes.toExecutionInputsView(pathParams)]
    // [i18nTabs.artifacts, routes.toExecutionArtifactsView(pathParams)]
  ])('Navigation to "%s" Tabs work', async (tab, url) => {
    ;(useGetExecutionDetail as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const { container, getByTestId } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )

    const tabElem = await findByTextContainer(container.querySelector('.bp3-tab-list') as HTMLElement, tab)

    fireEvent.click(tabElem.closest('a')!)
    expect(getByTestId('location').innerHTML.endsWith(url)).toBe(true)
  })

  test('Toggle between log/graph view works', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={TEST_EXECUTION_PIPELINE_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <CurrentLocation />
        </ExecutionLandingPage>
      </TestWrapper>
    )

    const tabElem = queryByAttribute('name', container, 'console-view-toggle')!

    fireEvent.click(tabElem)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline?view=log&filterAnomalous=false
      </div>
    `)

    fireEvent.click(tabElem)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline?view=graph&filterAnomalous=false
      </div>
    `)
  })

  test.each<[ExecutionStatus, boolean]>([
    ['Aborted', false],
    ['Running', true]
  ])('For status "%s" - polling is `%s`', (status, called) => {
    const refetch = jest.fn()

    ;(useGetExecutionDetail as jest.Mock).mockImplementation(() => ({
      refetch,
      loading: false,
      data: { data: { pipelineExecutionSummary: { status } } }
    }))

    render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL + 100)
    })

    expect(refetch).toHaveBeenCalledTimes(called ? 1 : 0)
  })

  test('auto stage selection works', () => {
    ;(useGetExecutionDetail as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: mockData
    }))

    function Child(): React.ReactElement {
      const { selectedStageId, selectedStepId } = useExecutionContext()

      return (
        <React.Fragment>
          <div data-testid="autoSelectedStageId">{selectedStageId}</div>
          <div data-testid="autoSelectedStepId">{selectedStepId}</div>
        </React.Fragment>
      )
    }

    const { getByTestId } = render(
      <TestWrapper path={TEST_EXECUTION_PIPELINE_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <Child />
        </ExecutionLandingPage>
      </TestWrapper>
    )
    const testData = mockData as unknown as ResponsePipelineExecutionDetail
    const stage = getActiveStageForPipeline(testData.data?.pipelineExecutionSummary)
    const runningStep = getActiveStep(testData.data?.executionGraph || {})
    jest.runOnlyPendingTimers()

    expect(getByTestId('autoSelectedStageId').innerHTML).toBe(stage)
    expect(getByTestId('autoSelectedStepId').innerHTML).toBe(runningStep)
  })

  test('auto stage should not work when user has selected a stage/step', () => {
    ;(useGetExecutionDetail as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: false,
      data: mockData
    }))

    function Child(): React.ReactElement {
      const { selectedStageId, selectedStepId } = useExecutionContext()

      return (
        <React.Fragment>
          <div data-testid="autoSelectedStageId">{selectedStageId}</div>
          <div data-testid="autoSelectedStepId">{selectedStepId}</div>
        </React.Fragment>
      )
    }

    const { getByTestId } = render(
      <TestWrapper
        path={TEST_EXECUTION_PIPELINE_PATH}
        queryParams={{ stage: 'qaStage' }}
        pathParams={pathParams as unknown as Record<string, string>}
      >
        <ExecutionLandingPage>
          <Child />
        </ExecutionLandingPage>
      </TestWrapper>
    )

    expect(getByTestId('autoSelectedStageId').innerHTML).toBe('')
    expect(getByTestId('autoSelectedStepId').innerHTML).toBe('')
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { useQueryParams } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import * as cvService from 'services/cv'
import { DeploymentMetrics } from '../DeploymentMetrics'
import { transactionNameMock, verifyStepNodeNameMock } from './DeploymentMetrics.mock'

const ApiResponse = {
  metaData: {},
  resource: {
    pageResponse: {
      totalPages: 4,
      totalItems: 42,
      pageItemCount: 0,
      pageSize: 10,
      content: [
        {
          transactionMetric: {
            transactionName: 'Internal Server Error : 500',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'HIGH',
              score: 0.0,
              controlData: [2.6666666666666665, 3.0, 3.0, 2.6666666666666665, 3.0],
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'ConcurrentModificationException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [4.666666666666667, 6.0, 6.0, 6.0, 5.333333333333333],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : FileSystemException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.6666666666666665, 3.0, 3.0, 3.0, 2.6666666666666665],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'SocketTimeoutException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [
                2.6666666666666665, 3.3333333333333335, 3.3333333333333335, 3.6666666666666665, 3.6666666666666665
              ],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : FileNotFoundException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.6666666666666665, 3.0, 3.0, 2.6666666666666665, 3.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: '/todolist/requestLogin',
            metricName: 'Average Response Time (ms)',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [1.6666666666666667, 1.0, 1.0, 1.0, 1.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : IOException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.6666666666666665, 3.0, 2.6666666666666665, 3.0, 3.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: '/todolist/inside',
            metricName: 'Calls per Minute',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [138.33333333333334, 148.0, 152.33333333333334, 145.66666666666666, 152.66666666666666],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : InterruptedException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.3333333333333335, 3.0, 3.0, 3.0, 3.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: '/todolist/inside',
            metricName: 'Stall Count',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [0.0, 0.0, 0.0, 0.0, 0.0],
              anomalous: false
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    },
    deploymentTimeRange: { startTime: '2021-06-08 20:34:00', endTime: '2021-06-08 20:49:00' },
    deploymentStartTime: 1623184440000,
    deploymentEndTime: 1623185340000
  },
  responseMessages: []
}

const HealthSourcesResponse = {
  metaData: {},
  resource: [
    {
      identifier: 'Without_Monitored_service/Test_Appd',
      name: 'Test Appd',
      type: 'APP_DYNAMICS',
      verificationType: 'TIME_SERIES'
    },
    {
      identifier: 'Without_Monitored_service/SPLUNK_Health_Source',
      name: 'SPLUNK  Health Source',
      type: 'SPLUNK',
      verificationType: 'LOG'
    }
  ],
  responseMessages: []
}

const MockExecutionNode: ExecutionNode = {
  progressData: {
    activityId: '1234_activityId' as any
  },
  status: 'Failed',
  stepParameters: {
    environmentIdentifier: '1234_env' as any,
    serviceIdentifier: '1234_service' as any
  }
} as ExecutionNode

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn(() => ({}))
}))

describe('Unit tests for Deployment metrics ', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  test('Ensure api is called with non anomalous filter', async () => {
    const useGetHealthSourcesSpy = jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as any)

    const useGetVerifyStepTransactionNamesSpy = jest
      .spyOn(cvService, 'useGetVerifyStepTransactionNames')
      .mockReturnValue({
        data: transactionNameMock,
        refetch: jest.fn() as unknown
      } as any)

    const useGetVerifyStepNodeNamesSpy = jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetHealthSourcesSpy).toHaveBeenCalled()
    expect(useGetVerifyStepNodeNamesSpy).toHaveBeenCalled()
    expect(useGetVerifyStepTransactionNamesSpy).toHaveBeenCalled()
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountId: undefined,
        anomalousMetricsOnly: false,
        anomalousNodesOnly: false,
        healthSources: undefined,
        hostNames: undefined,
        transactionNames: undefined,
        hostName: undefined,
        pageNumber: 0,
        pageSize: 10
      },
      verifyStepExecutionId: '1234_activityId'
    })

    // select anomalous filter
    // fireEvent.click(anomalousFilter.querySelector('[data-icon="chevron-down"]')!)
    fireEvent.click(screen.getByLabelText('pipeline.verification.anomalousMetricsFilterLabel'))

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: true,
          anomalousNodesOnly: true,
          healthSources: undefined,
          hostName: undefined,
          hostNames: undefined,
          pageNumber: 0,
          pageSize: 10,
          transactionNames: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )

    // select stackdriver health source
    fireEvent.click(screen.getByTestId(/HealthSource_MultiSelect_DropDown/))
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    fireEvent.click(getByText('Test Appd'))

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: true,
          anomalousNodesOnly: true,
          healthSources: ['Without_Monitored_service/Test_Appd'],
          hostName: undefined,
          hostNames: undefined,
          pageNumber: 0,
          pageSize: 10,
          transactionNames: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )
  })

  test('Ensure api is called with filter and selected page', async () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // render all filters
    expect(screen.getByTestId(/transaction_name_filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/node_name_filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/HealthSource_MultiSelect_DropDown/)).toBeInTheDocument()

    // add a filter
    fireEvent.click(screen.getByTestId(/node_name_filter/))
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    fireEvent.click(screen.getByText('V'))
    jest.runTimersToTime(1000)

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: false,
          anomalousNodesOnly: false,
          healthSources: undefined,
          hostName: undefined,
          hostNames: ['V'],
          pageNumber: 0,
          pageSize: 10,
          transactionNames: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )

    // click on a page
    const pageButtons = container.querySelectorAll('[class*="Pagination--roundedButton"]')
    fireEvent.click(pageButtons[3])

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: false,
          anomalousNodesOnly: false,
          healthSources: undefined,
          hostName: undefined,
          hostNames: ['V'],
          pageNumber: 2,
          pageSize: 10,
          transactionNames: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )
  })

  test('Ensure loading state is rendered', async () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      loading: true,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="loading"]')).not.toBeNull())
  })

  test('Ensure error state is rendred', async () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      error: { data: { message: 'mockError' } } as any,
      refetch: refetchFn as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    getByText('mockError')

    fireEvent.click(getByText('Retry'))
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })

  test('Ensure no data state is rendered', async () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: { resource: { content: [] } } as any,
      refetch: refetchFn as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText('cv.monitoredServices.noAvailableData')).not.toBeNull()
  })

  test('Ensure that when new activityId is passed as prop view is reset', async () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const refetchFn = jest.fn()
    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: refetchFn as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container, rerender } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountId: undefined,
        anomalousMetricsOnly: false,
        anomalousNodesOnly: false,
        healthSources: undefined,
        hostName: undefined,
        hostNames: undefined,
        pageNumber: 0,
        pageSize: 10,
        transactionNames: undefined
      },
      verifyStepExecutionId: '1234_activityId'
    })

    // click on a page
    const pageButtons = container.querySelectorAll('[class*="Pagination--roundedButton"]')
    fireEvent.click(pageButtons[4])

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: false,
          anomalousNodesOnly: false,
          healthSources: undefined,
          hostName: undefined,
          hostNames: undefined,
          pageNumber: 3,
          pageSize: 10,
          transactionNames: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )

    const clonedStep = cloneDeep(MockExecutionNode)
    clonedStep.progressData!.activityId = '12312_activityId' as any
    rerender(
      <TestWrapper>
        <DeploymentMetrics step={clonedStep} activityId={clonedStep!.progressData!.activityId as unknown as string} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountId: undefined,
        anomalousMetricsOnly: false,
        anomalousNodesOnly: false,
        healthSources: undefined,
        hostName: undefined,
        hostNames: undefined,
        pageNumber: 0,
        pageSize: 10,
        transactionNames: undefined
      },
      verifyStepExecutionId: '12312_activityId'
    })
  })

  test('Ensure polling works correctly', async () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const refetchFn = jest.fn()
    const clonedNode = cloneDeep(MockExecutionNode)
    clonedNode.status = 'Running'

    jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: refetchFn as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics step={clonedNode} activityId={clonedNode!.progressData!.activityId as unknown as string} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // for next call
    const clonedResponse = cloneDeep(ApiResponse)
    clonedResponse.resource.pageResponse.content = [
      {
        transactionMetric: {
          transactionName: 'OutOfMemoryError',
          metricName: 'Number of Errors',
          score: 1.0933333333333335,
          risk: 'MEDIUM'
        },
        connectorName: 'appd-connector',
        nodes: [
          {
            hostName: 'harness-test-appd-ng-deployment-7fdd6688bd-tc2tt',
            risk: 'MEDIUM',
            score: 1.0933333333333335,
            controlData: [6.666666666666667, 3.0],
            testData: [6.0, 7.0],
            anomalous: true
          }
        ]
      }
    ]

    jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: clonedResponse,
      refetch: refetchFn as unknown
    } as any)

    jest.runTimersToTime(20000)
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })

  test('should render accordion to display metrics', () => {
    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId(/\/todolist\/inside-Stall Count-undefined-panel/)).toBeInTheDocument()
  })

  test('should check whether the anomalous checkbox is checked by default if it has filterAnomalous query param set to true', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ filterAnomalous: 'true' }))

    jest.spyOn(cvService, 'useGetHealthSources').mockReturnValue({
      data: HealthSourcesResponse,
      refetch: jest.fn() as unknown
    } as any)

    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetVerifyStepDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepTransactionNames').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        queryParamStringifyOptions: { arrayFormat: 'repeat' },
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: true,
          anomalousNodesOnly: true,
          healthSources: undefined,
          hostName: undefined,
          hostNames: undefined,
          pageNumber: 0,
          pageSize: 10,
          transactionNames: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )
  })
})

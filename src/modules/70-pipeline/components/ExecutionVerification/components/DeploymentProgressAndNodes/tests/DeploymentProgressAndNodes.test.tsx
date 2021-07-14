import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Classes } from '@blueprintjs/core'
import type { DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentProgressAndNodes, DeploymentProgressAndNodesProps } from '../DeploymentProgressAndNodes'

const BaselineDeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      baselineDeploymentTag: null,
      baselineStartTime: 0,
      currentDeploymentTag: 'build#3',
      currentStartTime: 1602600600000,
      type: 'TEST'
    } as any,
    durationMs: 600000,
    environmentName: 'QA',
    jobName: 'loadtest',
    progressPercentage: 100,
    startTime: 1602600600000,
    status: 'SUCCESS' as DeploymentVerificationJobInstanceSummary['status'],
    verificationJobInstanceId: 'VS4Ck5okSMeGKiHDKls25w'
  }
}

const CanaryDeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      canary: [
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          risk: 'LOW',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          risk: 'LOW',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      canaryInstancesLabel: 'canary',
      primaryInstancesLabel: 'primary',
      primary: [
        {
          hostName: 'manager-b6b7c4d9b-s228g',
          risk: 'NO_DATA',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-p2qlw',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-ghqpv',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-9sv75',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-czh8b',
          risk: 'NO_DATA',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-pg5wb',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-6bkpw',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-7cp2g',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-s6zzs',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-c8gzk',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      trafficSplitPercentage: null,
      type: 'CANARY'
    } as any,
    durationMs: 600000,
    environmentName: 'prod',
    jobName: 'canary',
    progressPercentage: 58,
    startTime: 1602599760000,
    status: 'ERROR',
    verificationJobInstanceId: 'kuFEp5yRRDaGgK0i5fiGdg'
  }
}

describe('Deployment progress and nodes unit tests', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure baseline info is rendered with green bar', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
      </TestWrapper>
    )
    await waitFor(() => getByText('pipeline.verification.baselineTest'))

    expect(container.querySelector('[class*="bp3-intent-success"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')
  })
  test('Ensure production info for a canary deeployment is rendered with red bar', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('CANARY')).not.toBeNull())
    expect(getByText('PRIMARY')).not.toBeNull()
    expect(container.querySelector('[class*="bp3-intent-danger"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 58%;')

    const deploymentNodes = container.querySelectorAll('[class~="hexagon"]')
    expect(deploymentNodes.length).toBe(14)
  })

  test('Ensure node selection works', async () => {
    const onSelectMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('CANARY')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-name="popoverContainer"]')!)
    await waitFor(() =>
      expect(onSelectMock).toHaveBeenLastCalledWith({
        anomalousLogClustersCount: 0,
        anomalousMetricsCount: 0,
        hostName: 'manager-b6b7c4d9b-s228g',
        risk: 'NO_DATA'
      })
    )
    expect(container.querySelector('[class*="hexagonContainer"][class*="selected"]')).not.toBeNull()

    // when on select callback is not passed make sure hexagon is not selected
    const { container: container2 } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )

    fireEvent.click(container2.querySelector('[data-name="popoverContainer"]')!)
    expect(container2.querySelector('[class*="hexagonContainer"][class*="selected"]')).toBeNull()
  })
})

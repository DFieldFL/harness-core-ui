import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SummaryOfDeployedNodes } from '../SummaryOfDeployedNodes'

describe('Unit tests for SummaryOfDeployedNodes', () => {
  test('Ensure content is rendered correctly based on input', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <SummaryOfDeployedNodes
          metricsInViolation={3}
          totalMetrics={20}
          logClustersInViolation={5}
          totalLogClusters={5}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.verifyExecution.metricsInViolation')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
})

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from 'modules/common/utils/testUtils'

import ExecutionPipelineView from '../ExecutionPipelineView'

jest.mock('../ExecutionGraphView/ExecutionGraphView', () => {
  // eslint-disable-next-line react/display-name
  return () => <div data-testid="view">ExecutionGraphView</div>
})

jest.mock('../ExecutionLogView/ExecutionLogView', () => {
  // eslint-disable-next-line react/display-name
  return () => <div data-testid="view">ExecutionLogView</div>
})

describe('<ExecutionPipelineView /> tests', () => {
  test('renders graph view by default', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionGraphView')
  })

  test('renders log view with correct params', () => {
    const { getByTestId } = render(
      <TestWrapper queryParams={{ view: 'log' }}>
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionLogView')
  })

  test('renders graph view with correct params', () => {
    const { getByTestId } = render(
      <TestWrapper queryParams={{ view: 'graph' }}>
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionGraphView')
  })
})

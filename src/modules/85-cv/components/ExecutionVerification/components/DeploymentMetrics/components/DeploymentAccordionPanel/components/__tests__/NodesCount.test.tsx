/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import NodesCount from '../NodesCount'
import { nodesCountData } from './NodeRiskCountsDisplay.mock'

jest.mock('../NodeRiskCountsDisplay', () => () => <div data-testid="mocked_NodeCountDisplay">Node count display</div>)

describe('NodesCount', () => {
  test('should render correct data', () => {
    render(
      <TestWrapper>
        <NodesCount nodeRiskCount={nodesCountData} />
      </TestWrapper>
    )

    const testNode = screen.getByText(/12\/21/)
    const testNodeDisplayText = screen.getByText(/pipeline.verification.nodeCountDisplay/)

    expect(testNode).toBeInTheDocument()
    expect(testNodeDisplayText).toBeInTheDocument()
  })

  test('should render NodeCountDisplay component', () => {
    render(
      <TestWrapper>
        <NodesCount nodeRiskCount={nodesCountData} />
      </TestWrapper>
    )

    const nodeCountsDisplay = screen.getByTestId(/mocked_NodeCountDisplay/)

    expect(nodeCountsDisplay).toBeInTheDocument()
  })
})

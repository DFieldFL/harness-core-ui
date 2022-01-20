/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { CDPipelineModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'
import type { GraphLayoutNode } from 'services/pipeline-ng'

import { TestWrapper } from '@common/utils/testUtils'

import { CDExecutionSummary, ServicesTable } from '../CDExecutionSummary'

import executionSummaryProps from './executionSummaryProps.json'
import servicesProps from './servicesProps.json'

describe('<CDExecutionSummary /> tests', () => {
  test('snapshot test for CD Execution Summary', () => {
    const { container } = render(
      <CDExecutionSummary
        data={executionSummaryProps.data as CDPipelineModuleInfo}
        nodeMap={new Map(Object.entries(executionSummaryProps.nodeMap)) as Map<string, GraphLayoutNode>}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('<ServicesTable /> tests', () => {
  test('snapshot test for Services Table in execution summary', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/home/get-started" pathParams={{ accountId: 'dummy' }}>
        <ServicesTable services={servicesProps as ServiceExecutionSummary[]} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

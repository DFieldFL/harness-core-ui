/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import { DeploymentMetricsAnalysisRow } from '../DeploymentMetricsAnalysisRow'
import { healthSourceTypeToLogo } from '../DeploymentMetricsAnalysisRow.utils'
import { InputData } from './DeploymentMetricsAnalysisRow.mocks'

describe('Unit tests for DeploymentMetricsAnalysisRow', () => {
  test('Ensure given data is rendered correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentMetricsAnalysisRow {...InputData[0]} />
      </TestWrapper>
    )
    expect(container.querySelector('[class*="graphs"]')?.children.length).toBe(6)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NO_DATA)}"]`).length).toBe(2)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NO_ANALYSIS)}"]`).length).toBe(2)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.HEALTHY)}"]`).length).toBe(1)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.OBSERVE)}"]`).length).toBe(1)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NEED_ATTENTION)}"]`).length).toBe(1)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.UNHEALTHY)}"]`).length).toBe(1)
  })

  test('Ensure healthSourceTypeToLogo function returns correct logo', async () => {
    expect(healthSourceTypeToLogo('APP_DYNAMICS')).toEqual('service-appdynamics')
    expect(healthSourceTypeToLogo('NEW_RELIC')).toEqual('service-newrelic')
    expect(healthSourceTypeToLogo('PROMETHEUS')).toEqual('service-prometheus')
    expect(healthSourceTypeToLogo('SPLUNK')).toEqual('service-splunk')
    expect(healthSourceTypeToLogo('STACKDRIVER')).toEqual('service-stackdriver')
    expect(healthSourceTypeToLogo('STACKDRIVER_LOG')).toEqual('service-stackdriver')
  })
})

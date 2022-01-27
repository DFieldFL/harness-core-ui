/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { merge } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StageInputSetForm } from '../StageInputSetForm'

jest.mock('@common/utils/YamlUtils', () => ({}))

const props = {
  deploymentStageTemplate: {
    serviceConfig: {
      stageOverrides: {
        artifacts: {
          primary: {
            spec: {
              connectorRef: '<+input'
            },
            type: 'DockerRegistry' as const
          }
        }
      }
    },
    infrastructure: {
      spec: {
        namespace: 'test',
        serviceAccountName: 'name1',
        initTimeout: '1w'
      },
      type: 'KubernetesDirect'
    },
    execution: {
      steps: [
        {
          step: {
            identifier: 'test',
            name: 'test',
            type: 'test',
            description: 'ts',
            timeout: '10m'
          }
        }
      ],
      rollbackSteps: []
    },
    serviceDependencies: [
      {
        identifier: 'dep1',
        name: 'dep1',
        type: 'Service',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine'
        }
      }
    ]
  },
  deploymentStage: {
    execution: {
      steps: [
        {
          step: {
            identifier: 'test',
            name: 'test',
            type: 'test',
            description: 'ts',
            timeout: '10m'
          }
        }
      ],
      rollbackSteps: []
    },
    serviceDependencies: [
      {
        identifier: 'dep1',
        name: 'dep1',
        type: 'Service',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine'
        }
      }
    ]
  },
  path: 'stages[1].stage.spec'
} as any

describe('stageinputset tests', () => {
  describe('viewType InputSet', () => {
    test('initial render', () => {
      const { container } = render(
        <TestWrapper>
          <StageInputSetForm {...props} viewType={StepViewType.InputSet} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('initial render2', () => {
      const formProps: any = merge({}, props)
      formProps.deploymentStageTemplate.infrastructure.spec = null
      const { container } = render(
        <TestWrapper>
          <StageInputSetForm {...merge({}, props)} viewType={StepViewType.InputSet} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
  describe('viewType DeploymentForm', () => {
    test('initial render', () => {
      const { container } = render(
        <TestWrapper>
          <StageInputSetForm {...props} viewType={StepViewType.DeploymentForm} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('initial render2', () => {
      const formProps: any = merge({}, props)
      formProps.deploymentStageTemplate.infrastructure.spec = null
      const { container } = render(
        <TestWrapper>
          <StageInputSetForm {...merge({}, props)} viewType={StepViewType.DeploymentForm} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})

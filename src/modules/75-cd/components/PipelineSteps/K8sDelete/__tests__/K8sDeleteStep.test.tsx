import React from 'react'
import { render } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sDeleteStep } from '../K8sDeleteStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sDeleteStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sDelete} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view -with ManifestPaths selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResourcesBy: 'ManifestPath',
            spec: {
              manifestPaths: ['testA', 'testB']
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view -with ReleaseName selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResourcesBy: 'ReleaseName',
            spec: {
              deleteNamespace: true
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view -with ResourceName selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResourcesBy: 'ResourceName',
            spec: {
              resourceNames: ['testABC', 'test123']
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResourcesBy: 'ResourceName',
            spec: {
              resourceNames: ['testABC', 'test123']
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.name',
                localName: 'step.K8sDelete.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.timeout',
                localName: 'step.K8sDelete.timeout'
              }
            }
          },
          variablesData: {
            type: 'K8sDelete',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',
            spec: {
              deleteResourcesBy: 'ResourceName',
              spec: {
                resourceNames: ['testABC', 'test123']
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

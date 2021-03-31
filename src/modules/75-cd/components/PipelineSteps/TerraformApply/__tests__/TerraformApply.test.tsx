import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerraformApply } from '../TerraformApply'

const mockGetCallFunction = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))
jest.mock('services/portal', () => ({
  useGetDelegateSelectors: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

describe('Test TerraformApply', () => {
  beforeEach(() => {
    factory.registerStep(new TerraformApply())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerraformApply} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as inline', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline'
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        template={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        allValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        template={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        allValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.name',
                localName: 'step.terraformDestroy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.timeout',
                localName: 'step.terraformDestroy.timeout'
              }
            },
            'step-delegateSelectors': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.delegateSelectors',
                localName: 'step.terraformDestroy.delegateSelectors'
              }
            },
            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.provisionerIdentifier',
                localName: 'step.terraformDestroy.provisionerIdentifier'
              }
            }
          },
          variablesData: {
            type: 'TerraformDestroy',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            delegateSSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',
              configuration: {
                type: 'InheritFromPlan'
              }
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
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
  test('should render edit view as edit step - Inheritfromplan', () => {
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

  test('should submit form for inheritfromplan config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
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
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm())
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('should submit form for inline config', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: {
                        label: 'test',
                        value: 'test',
                        scope: 'account',
                        connector: { type: 'Git' }
                      }
                    }
                  }
                },
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      spec: {
                        content: 'test'
                      }
                    }
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm())
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('rendering more than one varfile', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      spec: {
                        content: 'test'
                      }
                    }
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        spec: {
                          connectorRef: 'test',
                          branch: 'test-brancg',
                          folderPath: 'testfolder'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()

    fireEvent.click(getByText('pipelineSteps.terraformVarFiles'))
    const trashIcon = container.querySelector('[data-testid="remove-tfvar-file-0"]')
    fireEvent.click(trashIcon!)
    expect(container).toMatchSnapshot()
  })

  test('expand backend Spec config', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformApply',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                backendConfig: {
                  type: 'Inline',
                  spec: {
                    content: 'test'
                  }
                }
              }
            },
            targets: ['test1', 'test2'],
            environmentVariables: [
              {
                key: 'test',
                value: 'abc'
              }
            ]
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('advancedTitle'))
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
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                varFiles: [
                  {
                    type: 'Remote',
                    store: {
                      type: 'Git',
                      spec: {
                        gitFetchType: 'Branch',
                        branch: 'main',
                        paths: ['test-1', 'test-2'],
                        connectorRef: 'test-connectore'
                      }
                    }
                  }
                ]
              }
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
        type={StepType.TerraformApply}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ZeroNorthStep } from '../ZeroNorthStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

describe('ZeroNorth Step', () => {
  beforeAll(() => {
    factory.registerStep(new ZeroNorthStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.ZeroNorth} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const initialValues = {
        identifier: 'My_ZeroNorth_Step',
        name: 'My ZeroNorth Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.ZeroNorth}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm())
      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('edit mode works', async () => {
      const initialValues = {
        identifier: 'My_ZeroNorth_Step',
        name: 'My ZeroNorth Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          privileged: false,
          settings: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: 'always',
          resources: {
            limits: {
              memory: '128Mi',
              cpu: '0.2'
            }
          }
        }
      }
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.ZeroNorth}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm())

      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })
  })

  describe('InputSet View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.ZeroNorth} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.ZeroNorth,
        identifier: 'My_ZeroNorth_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const allValues = {
        type: StepType.ZeroNorth,
        name: 'Test A',
        identifier: 'My_ZeroNorth_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.ZeroNorth}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('should not render any fields', async () => {
      const template = {
        type: StepType.ZeroNorth,
        identifier: 'My_ZeroNorth_Step'
      }

      const allValues = {
        type: StepType.ZeroNorth,
        identifier: 'My_ZeroNorth_Step',
        name: 'My ZeroNorth Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          privileged: false,
          settings: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: 'always',
          resources: {
            limits: {
              memory: '128Mi',
              cpu: '0.2'
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.ZeroNorth}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('InputVariable View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            identifier: 'Test_A',
            name: 'Test A',
            type: StepType.ZeroNorth,
            description: 'Description',
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              image: 'image',
              privileged: false,
              settings: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
              // Right now we do not support Image Pull Policy but will do in the future
              // pull: 'always',
              resources: {
                limits: {
                  memory: '128Mi',
                  cpu: '0.2'
                }
              }
            }
          }}
          customStepProps={{
            stageIdentifier: 'qaStage',
            metadataMap: {
              'step-name': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.name',
                  localName: 'step.zeronorth.name'
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.description',
                  localName: 'step.zeronorth.description'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.timeout',
                  localName: 'step.zeronorth.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.spec.connectorRef',
                  localName: 'step.zeronorth.spec.connectorRef'
                }
              },
              'step-image': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.spec.image',
                  localName: 'step.zeronorth.spec.image'
                }
              },
              'step-settings': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.spec.settings',
                  localName: 'step.zeronorth.spec.settings'
                }
              },
              // Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.spec.pull',
              //     localName: 'step.zeronorth.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.spec.resources.limits.memory',
                  localName: 'step.zeronorth.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.zeronorth.spec.resources.limits.cpu',
                  localName: 'step.zeronorth.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.ZeroNorth,
              identifier: 'ZeroNorth',
              name: 'step-name',
              description: 'step-description',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                image: 'step-image',
                privileged: 'step-privileged',
                settings: 'step-settings',
                // Right now we do not support Image Pull Policy but will do in the future
                // pull: 'step-pull',
                resources: {
                  limits: {
                    memory: 'step-limitMemory',
                    cpu: 'step-limitCPU'
                  }
                }
              }
            }
          }}
          type={StepType.ZeroNorth}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})

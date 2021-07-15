import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  factory,
  TestStepWidget,
  TestStepWidgetProps
} from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { ECRStep as ECRStepComponent } from './ECRStep'

factory.registerStep(new ECRStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / ECRStep',
  // eslint-disable-next-line react/display-name
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const ECRStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}

ECRStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.ECR,
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      region: 'Region',
      account: 'Account',
      imageName: 'Image Name',
      tags: ['tag1', 'tag2', 'tag3'],
      dockerfile: 'Dockerfile',
      context: 'Context',
      labels: {
        label1: 'value1',
        label2: 'value2',
        label3: 'value3'
      },
      buildArgs: {
        buildArg1: 'value1',
        buildArg2: 'value2',
        buildArg3: 'value3'
      },
      optimize: true,
      target: 'Target',
      remoteCacheImage: 'remote cache image',
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: 'always',
      resources: {
        limits: {
          memory: '128Mi',
          cpu: '0.2'
        }
      }
    }
  },
  type: StepType.ECR,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.ECR,
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      region: RUNTIME_INPUT_VALUE,
      account: RUNTIME_INPUT_VALUE,
      imageName: RUNTIME_INPUT_VALUE,
      tags: RUNTIME_INPUT_VALUE,
      dockerfile: RUNTIME_INPUT_VALUE,
      context: RUNTIME_INPUT_VALUE,
      labels: RUNTIME_INPUT_VALUE,
      buildArgs: RUNTIME_INPUT_VALUE,
      optimize: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      remoteCacheImage: RUNTIME_INPUT_VALUE,
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  allValues: {
    type: StepType.ECR,
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      region: RUNTIME_INPUT_VALUE,
      account: RUNTIME_INPUT_VALUE,
      imageName: RUNTIME_INPUT_VALUE,
      tags: RUNTIME_INPUT_VALUE,
      dockerfile: RUNTIME_INPUT_VALUE,
      context: RUNTIME_INPUT_VALUE,
      labels: RUNTIME_INPUT_VALUE,
      buildArgs: RUNTIME_INPUT_VALUE,
      optimize: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      remoteCacheImage: RUNTIME_INPUT_VALUE,
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.name',
          localName: 'step.ecr.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.timeout',
          localName: 'step.ecr.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.connectorRef',
          localName: 'step.ecr.spec.connectorRef'
        }
      },
      'step-region': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.region',
          localName: 'step.ecr.spec.region'
        }
      },
      'step-account': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.account',
          localName: 'step.ecr.spec.account'
        }
      },
      'step-imageName': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.imageName',
          localName: 'step.ecr.spec.imageName'
        }
      },
      'step-tags': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.tags',
          localName: 'step.ecr.spec.tags'
        }
      },
      'step-dockerfile': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.dockerfile',
          localName: 'step.ecr.spec.dockerfile'
        }
      },
      'step-context': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.context',
          localName: 'step.ecr.spec.context'
        }
      },
      'step-labels': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.labels',
          localName: 'step.ecr.spec.labels'
        }
      },
      'step-buildArgs': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.buildArgs',
          localName: 'step.ecr.spec.buildArgs'
        }
      },
      'step-optimize': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.optimize',
          localName: 'step.ecr.spec.optimize'
        }
      },
      'step-target': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.target',
          localName: 'step.ecr.spec.target'
        }
      },
      'step-remoteCacheImage': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.remoteCacheImage',
          localName: 'step.ecr.spec.remoteCacheImage'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.pull',
      //     localName: 'step.ecr.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.resources.limits.memory',
          localName: 'step.ecr.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.ecr.spec.resources.limits.cpu',
          localName: 'step.ecr.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.ECR,
      identifier: 'ecr',
      name: 'step-name',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        region: 'step-region',
        account: 'step-account',
        imageName: 'step-imageName',
        tags: 'step-tags',
        dockerfile: 'step-dockerfile',
        context: 'step-context',
        labels: 'step-labels',
        buildArgs: 'step-buildArgs',
        optimize: 'step-optimize',
        target: 'step-target',
        remoteCacheImage: 'step-remoteCacheImage',
        // TODO: Right now we do not support Image Pull Policy but will do in the future
        // pull: 'step-pull',
        resources: {
          limits: {
            memory: 'step-limitMemory',
            cpu: 'step-limitCPU'
          }
        }
      }
    }
  }
}

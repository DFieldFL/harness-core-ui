import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { stringify } from 'yaml'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'

import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ShellScriptStep } from './ShellScriptStep'

factory.registerStep(new ShellScriptStep())

export default {
  title: 'Pipelines / Pipeline Steps / ShellScriptStep',

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

export const ShellScriptsStep: Story<Omit<StepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{stringify(value)}</pre>
      </Card>
    </div>
  )
}
ShellScriptsStep.args = {
  initialValues: { identifier: 'Test_A', type: StepType.SHELLSCRIPT },
  type: StepType.SHELLSCRIPT,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.SHELLSCRIPT,
    spec: {
      shell: 'Bash',
      source: {
        spec: {
          script: RUNTIME_INPUT_VALUE
        }
      },
      executionTarget: {
        host: RUNTIME_INPUT_VALUE,
        connectionType: RUNTIME_INPUT_VALUE,
        connectorRef: RUNTIME_INPUT_VALUE,
        workingDirectory: RUNTIME_INPUT_VALUE
      }
    }
  },
  allValues: {
    type: StepType.SHELLSCRIPT,
    name: 'Test A',
    identifier: 'Test_A',
    spec: {
      shell: 'Bash',
      source: {
        spec: {
          script: RUNTIME_INPUT_VALUE
        }
      },
      executionTarget: {
        host: RUNTIME_INPUT_VALUE,
        connectionType: RUNTIME_INPUT_VALUE,
        connectorRef: RUNTIME_INPUT_VALUE,
        workingDirectory: RUNTIME_INPUT_VALUE
      }
    }
  }
}

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type {
  MultiTypeSelectOption,
  MultiTypePullOption,
  MultiTypeConnectorRef,
  MultiTypeListType,
  MultiTypeListUIType,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { RunTestsStepBaseWithRef } from './RunTestsStepBase'
import { RunTestsStepInputSet } from './RunTestsStepInputSet'
import { RunTestsStepVariables, RunTestsStepVariablesProps } from './RunTestsStepVariables'
import { inputSetViewValidateFieldsConfig } from './RunTestsStepFunctionConfigs'

export interface RunTestsStepSpec {
  connectorRef: string
  image: string
  args: string
  buildTool: MultiTypePullOption
  language: MultiTypePullOption
  packages: string
  testAnnotations?: string
  runOnlySelectedTests?: boolean
  reports?: {
    type: 'JUnit'
    spec: {
      paths: MultiTypeListType
    }
  }
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface RunTestsStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: RunTestsStepSpec
}

export interface RunTestsStepSpecUI
  extends Omit<RunTestsStepSpec, 'connectorRef' | 'buildTool' | 'language' | 'reports' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  buildTool: MultiTypeSelectOption
  language: MultiTypeSelectOption
  reportPaths?: MultiTypeListUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RunTestsStepDataUI extends Omit<RunTestsStepData, 'spec'> {
  spec: RunTestsStepSpecUI
}

export interface RunTestsStepProps {
  initialValues: RunTestsStepData
  template?: RunTestsStepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: RunTestsStepData) => void
}

export class RunTestsStep extends PipelineStep<RunTestsStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.RunTests
  protected stepName = 'Configure Run Tests Step'
  protected stepIcon: IconName = 'run-tests-step'
  protected stepPaletteVisible = false

  protected defaultValues: RunTestsStepData = {
    identifier: '',
    type: StepType.RunTests as string,
    spec: {
      connectorRef: '',
      image: '',
      args: '',
      buildTool: 'maven',
      language: 'java',
      packages: '',
      runOnlySelectedTests: true
    }
  }

  validateInputSet(
    data: RunTestsStepData,
    template?: RunTestsStepData,
    getString?: UseStringsReturn['getString']
  ): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<RunTestsStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <RunTestsStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <RunTestsStepVariables
          {...(customStepProps as RunTestsStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RunTestsStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        ref={formikRef}
      />
    )
  }
}

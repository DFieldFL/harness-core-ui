import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type {
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeConnectorRef,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { PluginStepBaseWithRef } from './PluginStepBase'
import { PluginStepInputSet } from './PluginStepInputSet'
import { PluginStepVariables, PluginStepVariablesProps } from './PluginStepVariables'
import { inputSetViewValidateFieldsConfig } from './PluginStepFunctionConfigs'

export interface PluginStepSpec {
  connectorRef: string
  image: string
  settings?: MultiTypeMapType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface PluginStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: PluginStepSpec
}

export interface PluginStepSpecUI extends Omit<PluginStepSpec, 'connectorRef' | 'settings' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  settings?: MultiTypeMapUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface PluginStepDataUI extends Omit<PluginStepData, 'spec'> {
  spec: PluginStepSpecUI
}

export interface PluginStepProps {
  initialValues: PluginStepData
  template?: PluginStepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: PluginStepData) => void
}

export class PluginStep extends PipelineStep<PluginStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Plugin
  protected stepName = 'Configure Plugin Step'
  protected stepIcon: IconName = 'plugin-step'
  protected stepPaletteVisible = false

  protected defaultValues: PluginStepData = {
    identifier: '',
    type: StepType.Plugin as string,
    spec: {
      connectorRef: '',
      image: ''
    }
  }

  validateInputSet(data: PluginStepData, template?: PluginStepData, getString?: UseStringsReturn['getString']): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<PluginStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <PluginStepInputSet
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
        <PluginStepVariables
          {...(customStepProps as PluginStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <PluginStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        ref={formikRef}
      />
    )
  }
}

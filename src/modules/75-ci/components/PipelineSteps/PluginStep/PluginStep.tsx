/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeSelectOption,
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeConnectorRef,
  Resources,
  MultiTypeListUIType,
  MultiTypeListType
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { PluginStepBaseWithRef } from './PluginStepBase'
import { PluginStepInputSet } from './PluginStepInputSet'
import { PluginStepVariables, PluginStepVariablesProps } from './PluginStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './PluginStepFunctionConfigs'

export interface PluginStepSpec {
  connectorRef: string
  image: string
  privileged?: boolean
  reports?: {
    type: 'JUnit'
    spec: {
      paths: MultiTypeListType
    }
  }
  settings?: MultiTypeMapType
  imagePullPolicy?: MultiTypeSelectOption
  runAsUser?: string
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

export interface PluginStepSpecUI
  extends Omit<PluginStepSpec, 'connectorRef' | 'reports' | 'settings' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  reportPaths?: MultiTypeListUIType
  settings?: MultiTypeMapUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
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
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: PluginStepData) => void
  onChange?: (data: PluginStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class PluginStep extends PipelineStep<PluginStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Plugin
  protected stepName = 'Configure Plugin Step'
  protected stepIcon: IconName = 'plugin-step'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Plugin'

  protected stepPaletteVisible = false

  protected defaultValues: PluginStepData = {
    identifier: '',
    type: StepType.Plugin as string,
    spec: {
      connectorRef: '',
      image: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): PluginStepData {
    return getFormValuesInCorrectFormat<T, PluginStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<PluginStepData>): FormikErrors<PluginStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<PluginStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <PluginStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
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
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}

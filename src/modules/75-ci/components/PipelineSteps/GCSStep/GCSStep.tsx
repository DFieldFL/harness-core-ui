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
import type { MultiTypeConnectorRef, Resources } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { GCSStepBaseWithRef } from './GCSStepBase'
import { GCSStepInputSet } from './GCSStepInputSet'
import { GCSStepVariables, GCSStepVariablesProps } from './GCSStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GCSStepFunctionConfigs'

export interface GCSStepSpec {
  connectorRef: string
  bucket: string
  sourcePath: string
  target?: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
  runAsUser?: string
}

export interface GCSStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: GCSStepSpec
}

export interface GCSStepSpecUI extends Omit<GCSStepSpec, 'connectorRef' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface GCSStepDataUI extends Omit<GCSStepData, 'spec'> {
  spec: GCSStepSpecUI
}

export interface GCSStepProps {
  initialValues: GCSStepData
  template?: GCSStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  onUpdate?: (data: GCSStepData) => void
  stepViewType: StepViewType
  onChange?: (data: GCSStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class GCSStep extends PipelineStep<GCSStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.GCS
  protected stepName = 'Upload Artifacts to GCS'
  protected stepIcon: IconName = 'gcs-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.GCS'
  protected stepPaletteVisible = false

  protected defaultValues: GCSStepData = {
    identifier: '',
    type: StepType.GCS as string,
    spec: {
      connectorRef: '',
      bucket: '',
      sourcePath: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): GCSStepData {
    return getFormValuesInCorrectFormat<T, GCSStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<GCSStepData>): FormikErrors<GCSStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }
  renderStep(props: StepProps<GCSStepData>): JSX.Element {
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
        <GCSStepInputSet
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
        <GCSStepVariables
          {...(customStepProps as GCSStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GCSStepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}

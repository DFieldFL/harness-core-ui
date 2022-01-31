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
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { GCRStepBaseWithRef } from './GCRStepBase'
import { GCRStepInputSet } from './GCRStepInputSet'
import { GCRStepVariables, GCRStepVariablesProps } from './GCRStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GCRStepFunctionConfigs'

export interface GCRStepSpec {
  connectorRef: string
  host: string
  projectID: string
  imageName: string
  tags: MultiTypeListType
  optimize?: boolean
  dockerfile?: string
  context?: string
  labels?: MultiTypeMapType
  buildArgs?: MultiTypeMapType
  target?: string
  remoteCacheImage?: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
  runAsUser?: string
}

export interface GCRStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: GCRStepSpec
}

export interface GCRStepSpecUI
  extends Omit<GCRStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface GCRStepDataUI extends Omit<GCRStepData, 'spec'> {
  spec: GCRStepSpecUI
}

export interface GCRStepProps {
  initialValues: GCRStepData
  template?: GCRStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: GCRStepData) => void
  onChange?: (data: GCRStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class GCRStep extends PipelineStep<GCRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.GCR
  protected stepName = 'Build and Push to GCR'
  protected stepIcon: IconName = 'gcr-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.GCR'
  protected stepPaletteVisible = false

  protected defaultValues: GCRStepData = {
    identifier: '',
    type: StepType.GCR as string,
    spec: {
      connectorRef: '',
      host: '',
      projectID: '',
      remoteCacheImage: '',
      imageName: '',
      tags: []
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): GCRStepData {
    return getFormValuesInCorrectFormat<T, GCRStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<GCRStepData>): FormikErrors<GCRStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<GCRStepData>): JSX.Element {
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
        <GCRStepInputSet
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
        <GCRStepVariables
          {...(customStepProps as GCRStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GCRStepBaseWithRef
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

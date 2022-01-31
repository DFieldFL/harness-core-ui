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
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources,
  MultiTypeArchiveFormatOption,
  MultiTypeSelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { SaveCacheGCSStepBaseWithRef } from './SaveCacheGCSStepBase'
import { SaveCacheGCSStepInputSet } from './SaveCacheGCSStepInputSet'
import { SaveCacheGCSStepVariables, SaveCacheGCSStepVariablesProps } from './SaveCacheGCSStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SaveCacheGCSStepFunctionConfigs'

export interface SaveCacheGCSStepSpec {
  connectorRef: string
  bucket: string
  key: string
  sourcePaths: MultiTypeListType
  archiveFormat?: MultiTypeArchiveFormatOption
  override?: boolean
  resources?: Resources
  runAsUser?: string
}

export interface SaveCacheGCSStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: SaveCacheGCSStepSpec
}

export interface SaveCacheGCSStepSpecUI
  extends Omit<SaveCacheGCSStepSpec, 'connectorRef' | 'sourcePaths' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  sourcePaths: MultiTypeListUIType
  archiveFormat?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface SaveCacheGCSStepDataUI extends Omit<SaveCacheGCSStepData, 'spec'> {
  spec: SaveCacheGCSStepSpecUI
}

export interface SaveCacheGCSStepProps {
  initialValues: SaveCacheGCSStepData
  template?: SaveCacheGCSStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SaveCacheGCSStepData) => void
  onChange?: (data: SaveCacheGCSStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class SaveCacheGCSStep extends PipelineStep<SaveCacheGCSStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SaveCacheGCS
  protected stepName = 'Save Cache to GCS'
  protected stepIcon: IconName = 'save-cache-gcs-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SaveCacheGCS'
  protected stepPaletteVisible = false

  protected defaultValues: SaveCacheGCSStepData = {
    identifier: '',
    type: StepType.SaveCacheGCS as string,
    spec: {
      connectorRef: '',
      bucket: '',
      key: '',
      sourcePaths: []
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): SaveCacheGCSStepData {
    return getFormValuesInCorrectFormat<T, SaveCacheGCSStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SaveCacheGCSStepData>): FormikErrors<SaveCacheGCSStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SaveCacheGCSStepData>): JSX.Element {
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
        <SaveCacheGCSStepInputSet
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
        <SaveCacheGCSStepVariables
          {...(customStepProps as SaveCacheGCSStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SaveCacheGCSStepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        isNewStep={isNewStep}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}

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
  MultiTypeArchiveFormatOption,
  MultiTypeSelectOption,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { SaveCacheS3StepBaseWithRef } from './SaveCacheS3StepBase'
import { SaveCacheS3StepInputSet } from './SaveCacheS3StepInputSet'
import { SaveCacheS3StepVariables, SaveCacheS3StepVariablesProps } from './SaveCacheS3StepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SaveCacheS3StepFunctionConfigs'

export interface SaveCacheS3StepSpec {
  connectorRef: string
  region: string
  bucket: string
  key: string
  sourcePaths: MultiTypeListType
  endpoint?: string
  archiveFormat?: MultiTypeArchiveFormatOption
  override?: boolean
  pathStyle?: boolean
  resources?: Resources
  runAsUser?: string
}

export interface SaveCacheS3StepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: SaveCacheS3StepSpec
}

export interface SaveCacheS3StepSpecUI
  extends Omit<SaveCacheS3StepSpec, 'connectorRef' | 'sourcePaths' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  sourcePaths: MultiTypeListUIType
  archiveFormat?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface SaveCacheS3StepDataUI extends Omit<SaveCacheS3StepData, 'spec'> {
  spec: SaveCacheS3StepSpecUI
}

export interface SaveCacheS3StepProps {
  initialValues: SaveCacheS3StepData
  template?: SaveCacheS3StepData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SaveCacheS3StepData) => void
  onChange?: (data: SaveCacheS3StepData) => void
  allowableTypes: MultiTypeInputType[]
}
export class SaveCacheS3Step extends PipelineStep<SaveCacheS3StepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SaveCacheS3
  protected stepName = 'Save Cache to S3'
  protected stepIcon: IconName = 'save-cache-s3-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SaveCacheS3'
  protected stepPaletteVisible = false

  protected defaultValues: SaveCacheS3StepData = {
    identifier: '',
    type: StepType.SaveCacheS3 as string,
    spec: {
      connectorRef: '',
      region: '',
      bucket: '',
      key: '',
      sourcePaths: []
    }
  }

  processFormData<T>(data: T): SaveCacheS3StepData {
    return getFormValuesInCorrectFormat<T, SaveCacheS3StepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SaveCacheS3StepData>): FormikErrors<SaveCacheS3StepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SaveCacheS3StepData>): JSX.Element {
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
        <SaveCacheS3StepInputSet
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
        <SaveCacheS3StepVariables
          {...(customStepProps as SaveCacheS3StepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SaveCacheS3StepBaseWithRef
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

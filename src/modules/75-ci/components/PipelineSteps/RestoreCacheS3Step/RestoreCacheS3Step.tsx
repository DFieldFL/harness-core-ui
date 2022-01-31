/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, MultiTypeInputType } from '@wings-software/uicore'
import { parse } from 'yaml'
import get from 'lodash-es/get'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeConnectorRef,
  Resources,
  MultiTypeArchiveFormatOption,
  MultiTypeSelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import { RestoreCacheS3StepBaseWithRef } from './RestoreCacheS3StepBase'
import { RestoreCacheS3StepInputSet } from './RestoreCacheS3StepInputSet'
import { RestoreCacheS3StepVariables, RestoreCacheS3StepVariablesProps } from './RestoreCacheS3StepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './RestoreCacheS3StepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

export interface RestoreCacheS3StepSpec {
  connectorRef: string
  region: string
  bucket: string
  key: string
  endpoint?: string
  archiveFormat?: MultiTypeArchiveFormatOption
  pathStyle?: boolean
  failIfKeyNotFound?: boolean
  resources?: Resources
  runAsUser?: string
}

export interface RestoreCacheS3StepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: RestoreCacheS3StepSpec
}

export interface RestoreCacheS3StepSpecUI
  extends Omit<RestoreCacheS3StepSpec, 'connectorRef' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  archiveFormat?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RestoreCacheS3StepDataUI extends Omit<RestoreCacheS3StepData, 'spec'> {
  spec: RestoreCacheS3StepSpecUI
}

export interface RestoreCacheS3StepProps {
  initialValues: RestoreCacheS3StepData
  template?: RestoreCacheS3StepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: RestoreCacheS3StepData) => void
  onChange?: (data: RestoreCacheS3StepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class RestoreCacheS3Step extends PipelineStep<RestoreCacheS3StepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(/^.+step\.spec\.connectorRef$/, this.getConnectorList.bind(this))
  }

  protected type = StepType.RestoreCacheS3
  protected stepName = 'Restore Cache from S3'
  protected stepIcon: IconName = 'restore-cache-s3-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.RestoreCacheS3'
  protected stepPaletteVisible = false

  protected defaultValues: RestoreCacheS3StepData = {
    identifier: '',
    type: StepType.RestoreCacheS3 as string,
    spec: {
      connectorRef: '',
      region: '',
      bucket: '',
      key: ''
    }
  }

  /* istanbul ignore next */
  protected async getConnectorList(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj.type === StepType.RestoreCacheS3 || obj.type === StepType.SaveCacheS3 || obj.type === StepType.ECR) {
        return getConnectorSuggestions(params, ['Aws'])
      }
    }
    return []
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): RestoreCacheS3StepData {
    return getFormValuesInCorrectFormat<T, RestoreCacheS3StepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<RestoreCacheS3StepData>): FormikErrors<RestoreCacheS3StepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }
    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<RestoreCacheS3StepData>): JSX.Element {
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
        <RestoreCacheS3StepInputSet
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
        <RestoreCacheS3StepVariables
          {...(customStepProps as RestoreCacheS3StepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RestoreCacheS3StepBaseWithRef
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

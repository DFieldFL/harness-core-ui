/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, MultiTypeInputType } from '@wings-software/uicore'
import { parse } from 'yaml'
import { get } from 'lodash-es'
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
import { RestoreCacheGCSStepBaseWithRef } from './RestoreCacheGCSStepBase'
import { RestoreCacheGCSStepInputSet } from './RestoreCacheGCSStepInputSet'
import { RestoreCacheGCSStepVariables, RestoreCacheGCSStepVariablesProps } from './RestoreCacheGCSStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './RestoreCacheGCSStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

export interface RestoreCacheGCSStepSpec {
  connectorRef: string
  bucket: string
  key: string
  archiveFormat?: MultiTypeArchiveFormatOption
  failIfKeyNotFound?: boolean
  resources?: Resources
  runAsUser?: string
}

export interface RestoreCacheGCSStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: RestoreCacheGCSStepSpec
}

export interface RestoreCacheGCSStepSpecUI
  extends Omit<RestoreCacheGCSStepSpec, 'connectorRef' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  archiveFormat?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RestoreCacheGCSStepDataUI extends Omit<RestoreCacheGCSStepData, 'spec'> {
  spec: RestoreCacheGCSStepSpecUI
}

export interface RestoreCacheGCSStepProps {
  initialValues: RestoreCacheGCSStepData
  template?: RestoreCacheGCSStepData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: RestoreCacheGCSStepData) => void
  onChange?: (data: RestoreCacheGCSStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class RestoreCacheGCSStep extends PipelineStep<RestoreCacheGCSStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(/^.+step\.spec\.connectorRef$/, this.getConnectorList.bind(this))
  }

  protected type = StepType.RestoreCacheGCS
  protected stepName = 'Restore Cache from GCS'
  protected stepIcon: IconName = 'restore-cache-gcs-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.RestoreCacheGCS'
  protected stepPaletteVisible = false

  protected defaultValues: RestoreCacheGCSStepData = {
    identifier: '',
    type: StepType.RestoreCacheGCS as string,
    spec: {
      connectorRef: '',
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
      if (obj.type === StepType.RestoreCacheGCS || obj.type === StepType.SaveCacheGCS || obj.type === StepType.GCR) {
        return getConnectorSuggestions(params, ['Gcp'])
      }
    }
    return []
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): RestoreCacheGCSStepData {
    return getFormValuesInCorrectFormat<T, RestoreCacheGCSStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<RestoreCacheGCSStepData>): FormikErrors<RestoreCacheGCSStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<RestoreCacheGCSStepData>): JSX.Element {
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
        <RestoreCacheGCSStepInputSet
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
        <RestoreCacheGCSStepVariables
          {...(customStepProps as RestoreCacheGCSStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RestoreCacheGCSStepBaseWithRef
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

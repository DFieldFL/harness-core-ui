import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { parse } from 'yaml'
import get from 'lodash-es/get'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { UseStringsReturn } from 'framework/strings/String'
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
import { RestoreCacheGCSStepBaseWithRef } from './RestoreCacheGCSStepBase'
import { RestoreCacheGCSStepInputSet } from './RestoreCacheGCSStepInputSet'
import { RestoreCacheGCSStepVariables, RestoreCacheGCSStepVariablesProps } from './RestoreCacheGCSStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './RestoreCacheGCSStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

export interface RestoreCacheGCSStepSpec {
  connectorRef: string
  bucket: string
  key: string
  archiveFormat?: MultiTypeArchiveFormatOption
  failIfKeyNotFound?: boolean
  resources?: Resources
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
  stepViewType?: StepViewType
  onUpdate?: (data: RestoreCacheGCSStepData) => void
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
  protected stepIcon: IconName = 'restore-cache-gcs'
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

  processFormData<RestoreCacheGCSStepDataUI>(data: RestoreCacheGCSStepDataUI): RestoreCacheGCSStepData {
    return getFormValuesInCorrectFormat<RestoreCacheGCSStepDataUI, RestoreCacheGCSStepData>(
      data,
      transformValuesFieldsConfig
    )
  }

  validateInputSet(
    data: RestoreCacheGCSStepData,
    template?: RestoreCacheGCSStepData,
    getString?: UseStringsReturn['getString']
  ): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<RestoreCacheGCSStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, readonly } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <RestoreCacheGCSStepInputSet
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
        stepViewType={stepViewType}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}

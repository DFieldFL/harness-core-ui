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
import type { MultiTypeConnectorRef, Resources } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import { JFrogArtifactoryStepBaseWithRef } from './JFrogArtifactoryStepBase'
import { JFrogArtifactoryStepInputSet } from './JFrogArtifactoryStepInputSet'
import { JFrogArtifactoryStepVariables, JFrogArtifactoryStepVariablesProps } from './JFrogArtifactoryStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './JFrogArtifactoryStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

export interface JFrogArtifactoryStepSpec {
  connectorRef: string
  target: string
  sourcePath: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
  runAsUser?: string
}

export interface JFrogArtifactoryStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: JFrogArtifactoryStepSpec
}

export interface JFrogArtifactoryStepSpecUI
  extends Omit<JFrogArtifactoryStepSpec, 'connectorRef' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface JFrogArtifactoryStepDataUI extends Omit<JFrogArtifactoryStepData, 'spec'> {
  spec: JFrogArtifactoryStepSpecUI
}

export interface JFrogArtifactoryStepProps {
  initialValues: JFrogArtifactoryStepData
  template?: JFrogArtifactoryStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: JFrogArtifactoryStepData) => void
  onChange?: (data: JFrogArtifactoryStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class JFrogArtifactoryStep extends PipelineStep<JFrogArtifactoryStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(/^.+step\.spec\.connectorRef$/, this.getConnectorList.bind(this))
  }

  protected type = StepType.JFrogArtifactory
  protected stepName = 'Upload Artifacts to JFrog Artifactory'
  protected stepIcon: IconName = 'service-artifactory'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.JFrogArtifactory'
  protected stepPaletteVisible = false

  protected defaultValues: JFrogArtifactoryStepData = {
    identifier: '',
    type: StepType.JFrogArtifactory as string,
    spec: {
      connectorRef: '',
      target: '',
      sourcePath: ''
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
      if (obj.type === StepType.JFrogArtifactory) {
        return getConnectorSuggestions(params, ['Artifactory'])
      }
    }
    return []
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): JFrogArtifactoryStepData {
    return getFormValuesInCorrectFormat<T, JFrogArtifactoryStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<JFrogArtifactoryStepData>): FormikErrors<JFrogArtifactoryStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<JFrogArtifactoryStepData>): JSX.Element {
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
        <JFrogArtifactoryStepInputSet
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
        <JFrogArtifactoryStepVariables
          {...(customStepProps as JFrogArtifactoryStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <JFrogArtifactoryStepBaseWithRef
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

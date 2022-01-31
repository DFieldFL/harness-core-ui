/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import { parse } from 'yaml'
import get from 'lodash-es/get'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type {
  MultiTypeSelectOption,
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeConnectorRef,
  Resources,
  MultiTypeListUIType
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { ModuleName } from 'framework/types/ModuleName'
import { loggerFor } from 'framework/logging/logging'
import { DependencyBaseWithRef } from './DependencyBase'
import { DependencyInputSet } from './DependencyInputSet'
import { DependencyVariables, DependencyVariablesProps } from './DependencyVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './DependencyFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)
// const stepConnectorRegEx = /.connectorRef$/
const stepConnectorRegEx = /stage\.spec\.serviceDependencies\.\d+\.spec\.connectorRef$/

export interface DependencySpec {
  connectorRef: string
  image: string
  privileged?: boolean
  envVariables?: MultiTypeMapType
  entrypoint?: MultiTypeListType
  args?: MultiTypeListType
  imagePullPolicy?: MultiTypeSelectOption
  runAsUser?: string
  resources?: Resources
}

export interface DependencyData {
  identifier: string
  name?: string
  description?: string
  type: string
  spec: DependencySpec
}

export interface DependencySpecUI
  extends Omit<DependencySpec, 'connectorRef' | 'envVariables' | 'entrypoint' | 'args' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  envVariables?: MultiTypeMapUIType
  entrypoint?: MultiTypeListUIType
  args?: MultiTypeListUIType
  imagePullPolicy?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface DependencyDataUI extends Omit<DependencyData, 'spec'> {
  spec: DependencySpecUI
}

export interface DependencyProps {
  initialValues: DependencyData
  template?: DependencyData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: DependencyData) => void
  onChange?: (data: DependencyData) => void
  allowableTypes: MultiTypeInputType[]
}

export class Dependency extends PipelineStep<DependencyData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(stepConnectorRegEx, this.getConnectorList.bind(this, undefined))
  }

  protected type = StepType.Dependency
  protected stepName = 'Configure Service Dependency'
  protected stepIcon: IconName = 'dependency-step'
  protected stepIconColor = '#004BA4'
  protected stepPaletteVisible = false

  protected defaultValues: DependencyData = {
    identifier: '',
    type: StepType.Dependency as string,
    spec: {
      connectorRef: '',
      image: ''
    }
  }

  /* istanbul ignore next */
  protected async getConnectorList(
    connectorTypes: string[] | undefined,
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    if (connectorTypes?.length) {
      return getConnectorSuggestions(params, connectorTypes)
    }
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj.type === StepType.Dependency) {
        return getConnectorSuggestions(params, ['Gcp', 'Aws', 'DockerRegistry'])
      }
    }
    return []
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): DependencyData {
    return getFormValuesInCorrectFormat<T, DependencyData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DependencyData>): FormikErrors<DependencyData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(
        data,
        template,
        getInputSetViewValidateFieldsConfig(isRequired),
        {
          getString,
          type: StepType.Dependency
        },
        viewType
      )
    }

    return {}
  }

  renderStep(props: StepProps<DependencyData>): JSX.Element {
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
        <DependencyInputSet
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
        <DependencyVariables
          {...(customStepProps as DependencyVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <DependencyBaseWithRef
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

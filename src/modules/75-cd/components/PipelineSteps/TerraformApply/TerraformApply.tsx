/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'

import { isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors } from 'formik'
import type { StringNGVariable } from 'services/cd-ng'

import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import type { StringsMap } from 'stringTypes'
import TerraformInputStep from '../Common/Terraform/TerraformInputStep'
import { TerraformVariableStep } from '../Common/Terraform/TerraformVariableView'
import {
  ConfigurationTypes,
  onSubmitTerraformData,
  TerraformData,
  TerraformVariableStepProps,
  TFFormData
} from '../Common/Terraform/TerraformInterfaces'

import TerraformEditView from '../Common/Terraform/Editview/TerraformEditView'

const TerraformApplyWidgetWithRef = React.forwardRef(TerraformEditView)

export class TerraformApply extends PipelineStep<TFFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformApply
  protected defaultValues: TFFormData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerraformApply,
    spec: {
      configuration: {
        type: ConfigurationTypes.Inline,
        spec: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                gitFetchType: 'Branch'
              }
            }
          }
        }
      },
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terraform-apply'
  protected stepName = 'Terraform Apply'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerraformApply'
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TFFormData>): FormikErrors<TFFormData> {
    /* istanbul ignore next */
    const errors = {} as any
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    /* istanbul ignore next */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore next */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })
      /* istanbul ignore next */
      try {
        timeout.validateSync(data)
      } /* istanbul ignore next */ catch (e) {
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore next */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  private getInitialValues(data: TFFormData): TerraformData {
    const envVars = data.spec?.configuration?.spec?.environmentVariables as StringNGVariable[]
    const formData = {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec?.configuration,
          spec: {
            ...data.spec?.configuration?.spec,
            targets: Array.isArray(data.spec?.configuration?.spec?.targets)
              ? data.spec?.configuration?.spec?.targets.map(target => ({
                  value: target,
                  id: uuid()
                }))
              : [{ value: '', id: uuid() }],
            environmentVariables: Array.isArray(envVars)
              ? envVars.map(variable => ({
                  key: variable.name,
                  value: variable.value,
                  id: uuid()
                }))
              : [{ key: '', value: '', id: uuid() }]
          }
        }
      }
    }
    return formData
  }
  /* istanbul ignore next */
  processFormData(data: any): TFFormData {
    return onSubmitTerraformData(data)
  }
  renderStep(props: StepProps<TFFormData, unknown>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      formikRef,
      inputSetData,
      customStepProps,
      isNewStep,
      path,
      readonly
    } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformInputStep
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          onChange={data => onChange?.(this.processFormData(data))}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformVariableStepProps)}
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
        />
      )
    }
    return (
      <TerraformApplyWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        stepType={StepType.TerraformApply}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }
}

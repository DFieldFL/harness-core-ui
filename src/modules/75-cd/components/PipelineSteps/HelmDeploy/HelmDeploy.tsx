/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Formik, Layout, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'

import { isEmpty } from 'lodash-es'

import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StringsMap } from 'stringTypes'

import { useStrings } from 'framework/strings'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface HelmDeployProps {
  initialValues: StepElementConfig
  onUpdate?: (data: StepElementConfig) => void
  onChange?: (data: StepElementConfig) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
  isReadonly?: boolean
}

export interface HelmDeployVariableStepProps {
  initialValues: StepElementConfig
  stageIdentifier: string
  onUpdate?(data: StepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: StepElementConfig
}

const withUpdatedPayload = (values: StepElementConfig) => ({ ...values, spec: { ...values.spec, skipDryRun: false } })

function HelmDeployWidget(
  props: HelmDeployProps,
  formikRef: StepFormikFowardRef<StepElementConfig>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, allowableTypes, isNewStep = true, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<StepElementConfig>
        onSubmit={(values: StepElementConfig) => {
          /* istanbul ignore next */
          onUpdate?.(withUpdatedPayload(values))
        }}
        validate={(values: StepElementConfig) => {
          onChange?.(withUpdatedPayload(values))
        }}
        formName="helmDeploy"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<StepElementConfig>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                {stepViewType !== StepViewType.Template && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    className={stepCss.duration}
                    multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.timeout as string}
                      type="String"
                      variableName="step.timeout"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        /* istanbul ignore next */
                        setFieldValue('timeout', value)
                      }}
                      isReadonly={props.isReadonly}
                    />
                  )}
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const HelmDeployInputStep: React.FC<HelmDeployProps> = ({ inputSetData, allowableTypes }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            disabled={inputSetData?.readonly}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: inputSetData?.readonly
            }}
          />
        </div>
      )}
    </>
  )
}

const HelmDeployVariablesStep: React.FC<HelmDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}

const HelmDeployWithRef = React.forwardRef(HelmDeployWidget)
export class HelmDeploy extends PipelineStep<StepElementConfig> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<StepElementConfig>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <HelmDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <HelmDeployVariablesStep
          {...(customStepProps as HelmDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <HelmDeployWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        onChange={onChange}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        isReadonly={props.readonly}
      />
    )
  }

  protected type = StepType.HelmDeploy
  protected stepName = 'Helm Deploy'
  protected stepIcon: IconName = 'service-helm'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.HelmDeploy'

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors
  }

  protected defaultValues: StepElementConfig = {
    name: '',
    identifier: '',
    timeout: '10m',
    type: StepType.HelmDeploy,
    spec: {
      skipDryRun: false
    }
  }
}

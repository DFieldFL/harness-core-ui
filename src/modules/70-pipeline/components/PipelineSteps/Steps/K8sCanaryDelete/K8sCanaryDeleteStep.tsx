import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Layout,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { K8sCanaryDeleteStepInfo, StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings, UseStringsReturn } from 'framework/exports'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField } from '@common/components'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import stepCss from '../Steps.module.scss'

interface K8sCanaryDeleteStepData extends StepElementConfig {
  spec: K8sCanaryDeleteStepInfo
}
interface K8sCanaryDeployProps {
  initialValues: K8sCanaryDeleteStepData
  onUpdate?: (data: K8sCanaryDeleteStepData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: K8sCanaryDeleteStepData
    path?: string
    readonly?: boolean
  }
}

export interface K8sCanaryDeleteVariableStepProps {
  initialValues: K8sCanaryDeleteStepData
  stageIdentifier: string
  onUpdate?(data: K8sCanaryDeleteStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sCanaryDeleteStepData
}

function K8sCanaryDeleteWidget(
  props: K8sCanaryDeployProps,
  formikRef: StepFormikFowardRef<K8sCanaryDeleteStepData>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sCanaryDeleteStepData>
        onSubmit={(values: K8sCanaryDeleteStepData) => {
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<K8sCanaryDeleteStepData>) => {
          const { values, setFieldValue, submitForm } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={stepCss.formGroup}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isEmpty(initialValues.identifier)}
                  />
                </div>

                <div className={stepCss.formGroup}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    className={stepCss.duration}
                    multiTypeDurationProps={{ enableConfigureOptions: false, expressions }}
                  />
                  {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.timeout as string}
                      type="String"
                      variableName="timeout"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('timeout', value)
                      }}
                    />
                  )}
                </div>
                <div className={stepCss.formGroup}>
                  <FormMultiTypeCheckboxField
                    multiTypeTextbox={{ expressions }}
                    name="spec.skipDryRun"
                    label={getString('pipelineSteps.skipDryRun')}
                  />
                </div>
              </Layout.Vertical>

              <div className={stepCss.actionsPanel}>
                <Button intent="primary" text={getString('submit')} onClick={submitForm} />
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8sCanaryDeleteInputWidget: React.FC<K8sCanaryDeployProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={inputSetData?.readonly}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipDryRun`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipDryRun')}
          disabled={inputSetData?.readonly}
        />
      )}
    </>
  )
}

const K8sCanaryDeleteVariableStep: React.FC<K8sCanaryDeleteVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8sCanaryDeleteWidgetWithRef = React.forwardRef(K8sCanaryDeleteWidget)
export class K8sCanaryDeleteStep extends PipelineStep<K8sCanaryDeleteStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  renderStep(props: StepProps<K8sCanaryDeleteStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8sCanaryDeleteInputWidget
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sCanaryDeleteVariableStep
          {...(customStepProps as K8sCanaryDeleteVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8sCanaryDeleteWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.K8sCanaryDelete
  protected stepName = 'K8s Canary Delete'

  protected stepIcon: IconName = 'delete'
  /* istanbul ignore next */
  validateInputSet(
    data: K8sCanaryDeleteStepData,
    template: K8sCanaryDeleteStepData,
    getString?: UseStringsReturn['getString']
  ): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
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
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  protected defaultValues: K8sCanaryDeleteStepData = {
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      skipDryRun: false
    }
  }
}

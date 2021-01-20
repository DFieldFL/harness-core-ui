import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Accordion
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FormikProps, yupToFormErrors } from 'formik'

import { isEmpty } from 'lodash-es'

import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElement } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings, UseStringsReturn } from 'framework/exports'

import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import stepCss from '../Steps.module.scss'

interface K8sBGSwapProps {
  initialValues: StepElement
  onUpdate?: (data: StepElement) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: StepElement
    path?: string
    readonly?: boolean
  }
}

function K8sBGSwapWidget(props: K8sBGSwapProps, formikRef: StepFormikFowardRef<StepElement>): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<StepElement>
        onSubmit={(values: StepElement) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<StepElement>) => {
          const { values, setFieldValue, submitForm } = formik
          setFormikRef(formikRef, formik)

          return (
            <>
              <Accordion activeId="details" collapseProps={{ transitionDuration: 0 }}>
                <Accordion.Panel
                  id="details"
                  summary={getString('pipelineSteps.k8sBGSwapServices')}
                  details={
                    <>
                      <div className={stepCss.formGroup}>
                        <FormInput.InputWithIdentifier inputLabel={getString('name')} />
                      </div>

                      <div className={stepCss.formGroup}>
                        <FormMultiTypeDurationField
                          name="timeout"
                          label={getString('pipelineSteps.timeoutLabel')}
                          className={stepCss.duration}
                          multiTypeDurationProps={{ enableConfigureOptions: false }}
                        />
                        {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={values.timeout as string}
                            type="String"
                            variableName="step.spec.timeout"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => {
                              /* istanbul ignore next */
                              setFieldValue('timeout', value)
                            }}
                          />
                        )}
                      </div>
                    </>
                  }
                />
              </Accordion>
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

const K8sBGSwapInputStep: React.FC<K8sBGSwapProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}.timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={inputSetData?.readonly}
        />
      )}
    </>
  )
}
const K8sBGSwapWidgetWithRef = React.forwardRef(K8sBGSwapWidget)
export class K8sBGSwapServices extends PipelineStep<StepElement> {
  renderStep(props: StepProps<StepElement>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8sBGSwapInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    }
    return (
      <K8sBGSwapWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.K8sBGSwapServices
  protected stepName = 'K8s Blue Green Swap Services'

  protected stepIcon: IconName = 'service-kubernetes'
  /* istanbul ignore next */

  validateInputSet(data: StepElement, template: StepElement, getString?: UseStringsReturn['getString']): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
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
    return errors
  }

  protected defaultValues: StepElement = {
    name: '',
    identifier: '',
    timeout: '10m'
  }
}

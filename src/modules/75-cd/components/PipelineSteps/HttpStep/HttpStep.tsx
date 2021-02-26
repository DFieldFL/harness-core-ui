import React from 'react'
import {
  IconName,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  Accordion
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { yupToFormErrors } from 'formik'
import { v4 as uuid } from 'uuid'
import { isEmpty } from 'lodash-es'

import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings, UseStringsReturn } from 'framework/exports'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { HttpHeaderConfig, NGVariable } from 'services/cd-ng'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import HttpStepBase, { httpStepType } from './HttpStepBase'
import ResponseMapping from './ResponseMapping'
import HttpInputSetStep from './HttpInputSetStep'
import type { HttpStepData, HttpStepFormData, HttpStepHeaderConfig, HttpStepOutputVariable } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1160446867/Http+Step
 */

interface HttpStepWidgetProps {
  initialValues: HttpStepFormData
  onUpdate?: (data: HttpStepFormData) => void
  stepViewType?: StepViewType
  readonly?: boolean
}

function HttpStepWidget(props: HttpStepWidgetProps, formikRef: StepFormikFowardRef<HttpStepData>): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()

  return (
    <Formik<HttpStepFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          url: Yup.string().required(getString('validation.UrlRequired')),
          method: Yup.mixed().required(getString('pipelineSteps.methodIsRequired'))
        })
      })}
    >
      {(formik: FormikProps<HttpStepFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            <Accordion activeId="step-1" className={stepCss.accordion}>
              <Accordion.Panel id="step-1" summary={getString('basic')} details={<HttpStepBase formik={formik} />} />
              <Accordion.Panel
                id="step-2"
                summary={getString('responseMapping')}
                details={<ResponseMapping formik={formik} />}
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

const HttpStepWidgetWithRef = React.forwardRef(HttpStepWidget)

export class HttpStep extends PipelineStep<HttpStepData> {
  renderStep(this: HttpStep, props: StepProps<HttpStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <HttpInputSetStep
          initialValues={this.processInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    }

    return (
      <HttpStepWidgetWithRef
        initialValues={this.processInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        stepViewType={stepViewType}
        readonly={!!inputSetData?.readonly}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.HTTP
  protected stepName = 'Http Step'
  protected stepIcon: IconName = 'http-step'

  validateInputSet(data: HttpStepData, template: HttpStepData, getString?: UseStringsReturn['getString']): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any

    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.spec?.url) === MultiTypeInputType.RUNTIME && isEmpty(data?.spec?.url)) {
      errors.spec.url = getString?.('fieldRequired', { field: 'URL' })
    }

    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.spec?.method) === MultiTypeInputType.RUNTIME && isEmpty(data?.spec?.method)) {
      errors.spec.method = getString?.('fieldRequired', { field: 'Method' })
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.requestBody) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.requestBody)
    ) {
      errors.spec.requestBody = getString?.('fieldRequired', { field: 'Request Body' })
    }

    /* istanbul ignore else */
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
  protected defaultValues: HttpStepData = {
    identifier: '',
    timeout: '10s',
    spec: {
      url: '',
      method: httpStepType[0].value as string
    }
  }

  protected isHarnessSpecific = true

  private processInitialValues(initialValues: HttpStepData): HttpStepFormData {
    return {
      ...initialValues,
      spec: {
        ...(initialValues.spec as HttpStepFormData),
        method:
          getMultiTypeFromValue(initialValues.spec?.method as string) === MultiTypeInputType.RUNTIME
            ? (initialValues.spec?.method as string)
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              httpStepType.find(step => step.value === (initialValues.spec?.method || 'GET'))!,
        headers:
          getMultiTypeFromValue(initialValues.spec?.headers as string) === MultiTypeInputType.RUNTIME
            ? (initialValues.spec?.headers as string)
            : Array.isArray(initialValues.spec?.headers)
            ? initialValues.spec.headers.map(
                (header: HttpHeaderConfig): HttpStepHeaderConfig => ({
                  ...header,
                  id: uuid()
                })
              )
            : [{ key: '', value: '', id: uuid() }],
        outputVariables:
          getMultiTypeFromValue(initialValues.spec?.outputVariables as string) === MultiTypeInputType.RUNTIME
            ? (initialValues.spec?.outputVariables as string)
            : Array.isArray(initialValues.spec?.outputVariables)
            ? initialValues.spec.outputVariables.map((variable: NGVariable) => ({
                ...variable,
                id: uuid()
              }))
            : [{ name: '', type: 'String', value: '', id: uuid() }]
      }
    }
  }

  private processFormData(data: HttpStepFormData): HttpStepData {
    return {
      ...data,
      spec: {
        ...data.spec,
        method: ((data.spec.method as SelectOption)?.value as string) || data.spec.method?.toString(),
        headers:
          getMultiTypeFromValue(data.spec.headers as string) === MultiTypeInputType.RUNTIME
            ? (data.spec.headers as string)
            : Array.isArray(data.spec.headers)
            ? data.spec.headers
                .filter((variable: HttpStepHeaderConfig) => variable.value)
                .map(({ id, ...header }: HttpStepHeaderConfig) => header)
            : undefined,
        outputVariables:
          getMultiTypeFromValue(data.spec.outputVariables as string) === MultiTypeInputType.RUNTIME
            ? (data.spec.outputVariables as string)
            : Array.isArray(data.spec.outputVariables)
            ? data.spec.outputVariables
                .filter((variable: HttpStepOutputVariable) => variable.value)
                .map(({ id, ...variable }: HttpStepOutputVariable) => variable)
            : undefined
      }
    }
  }
}

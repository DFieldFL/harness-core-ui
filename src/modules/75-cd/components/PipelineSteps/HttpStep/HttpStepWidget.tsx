import React from 'react'
import { Formik, Accordion, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import OptionalConfiguration from './OptionalConfiguration'
import type { HttpStepData, HttpStepFormData } from './types'
import HttpStepBase from './HttpStepBase'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1160446867/Http+Step
 */

export interface HttpStepWidgetProps {
  initialValues: HttpStepFormData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: HttpStepFormData) => void
  stepViewType?: StepViewType
  readonly: boolean
}

export function HttpStepWidget(
  props: HttpStepWidgetProps,
  formikRef: StepFormikFowardRef<HttpStepData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, isDisabled } = props
  const { getString } = useStrings()

  return (
    <Formik<HttpStepFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
      formName="httpWidget"
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          url: Yup.lazy(
            (value): Yup.Schema<unknown> => {
              if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                return Yup.string()
                  .required(getString('common.validation.urlIsRequired'))
                  .url(getString('validation.urlIsNotValid'))
              }
              return Yup.string().required(getString('common.validation.urlIsRequired'))
            }
          ),
          method: Yup.mixed().required(getString('pipelineSteps.methodIsRequired')),
          headers: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required(getString('common.validation.keyIsRequired')),
              value: Yup.string().required(getString('common.validation.valueIsRequired'))
            })
          ),
          outputVariables: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required(getString('common.validation.nameIsRequired')),
              value: Yup.string().required(getString('common.validation.valueIsRequired'))
            })
          )
        }),
        identifier: IdentifierSchema()
      })}
    >
      {(formik: FormikProps<HttpStepFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            <HttpStepBase formik={formik} isNewStep={isNewStep} readonly={isDisabled} />
            <Accordion activeId="step-1" className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={<OptionalConfiguration formik={formik} readonly={isDisabled} />}
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const HttpStepWidgetWithRef = React.forwardRef(HttpStepWidget)

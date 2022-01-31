/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Color,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  MultiTypeInputType,
  Heading,
  PageError
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { defaultTo, get, isEmpty, merge, noop, set } from 'lodash-es'
import produce from 'immer'
import { NameSchema } from '@common/utils/Validation'
import { setFormikRef, StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { Error, StepElementConfig } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import { useToaster } from '@common/exports'
import { PageSpinner } from '@common/components'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { validateStep } from '@pipeline/components/PipelineStudio/StepUtil'
import { StepForm } from '@pipeline/components/PipelineInputSetForm/StageInputSetForm'
import { setTemplateInputs, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TemplateStepWidget.module.scss'

export interface TemplateStepWidgetProps {
  initialValues: TemplateStepNode
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: TemplateStepNode) => void
  stepViewType?: StepViewType
  readonly?: boolean
  factory: AbstractStepFactory
  allowableTypes: MultiTypeInputType[]
}

export interface TemplateStepValues extends TemplateStepNode {
  inputsTemplate?: StepElementConfig
  allValues?: StepElementConfig
}

export function TemplateStepWidget(
  props: TemplateStepWidgetProps,
  formikRef: StepFormikFowardRef<TemplateStepNode>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes } = props
  const [formValues, setFormValues] = React.useState<TemplateStepValues>(initialValues)
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showError } = useToaster()
  const templateRef = getIdentifierFromValue(initialValues.template.templateRef)
  const scope = getScopeFromValue(initialValues.template.templateRef)

  const {
    data: templateResponse,
    error: templateError,
    refetch: refetchTemplate,
    loading: templateLoading
  } = useGetTemplate({
    templateIdentifier: templateRef,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      versionLabel: defaultTo(initialValues.template.versionLabel, '')
    }
  })

  const {
    data: templateInputSetYaml,
    error: templateInputSetError,
    refetch: refetchTemplateInputSet,
    loading: templateInputSetLoading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: templateRef,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      versionLabel: defaultTo(initialValues.template.versionLabel, '')
    }
  })

  React.useEffect(() => {
    if (!templateLoading && !templateInputSetLoading && templateResponse?.data?.yaml) {
      try {
        const templateInputs = parse(defaultTo(templateInputSetYaml?.data, ''))
        const mergedTemplateInputs = merge({}, templateInputs, initialValues.template?.templateInputs)
        setFormValues(
          produce(initialValues as TemplateStepValues, draft => {
            setTemplateInputs(draft, mergedTemplateInputs)
            draft.inputsTemplate = templateInputs
            draft.allValues = parse(defaultTo(templateResponse?.data?.yaml, '')).template.spec
          })
        )
        setTemplateInputs(initialValues, mergedTemplateInputs)
        onUpdate?.(initialValues)
      } catch (error) {
        showError(error.message, undefined, 'template.parse.inputSet.error')
      }
    }
  }, [templateLoading, templateResponse?.data && templateInputSetLoading && templateInputSetYaml?.data])

  const validateForm = (values: TemplateStepValues) => {
    const errorsResponse = validateStep({
      step: values.template?.templateInputs as StepElementConfig,
      template: values.inputsTemplate,
      originalStep: { step: formValues?.template?.templateInputs as StepElementConfig },
      getString,
      viewType: StepViewType.DeploymentForm
    })
    if (!isEmpty(errorsResponse)) {
      return set({}, TEMPLATE_INPUT_PATH, get(errorsResponse, 'step'))
    } else {
      return errorsResponse
    }
  }

  const refetch = () => {
    refetchTemplate()
    refetchTemplateInputSet()
  }

  return (
    <div className={stepCss.stepPanel}>
      <Formik<TemplateStepValues>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        initialValues={formValues}
        formName="templateStepWidget"
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') })
        })}
        validate={validateForm}
        enableReinitialize={true}
      >
        {(formik: FormikProps<TemplateStepValues>) => {
          setFormikRef(formikRef, formik)
          return (
            <FormikForm>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  isIdentifierEditable={isNewStep && !readonly}
                  inputLabel={getString('name')}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <Container className={css.inputsContainer}>
                {(templateLoading || templateInputSetLoading) && <PageSpinner />}
                {!templateLoading && !templateInputSetLoading && (templateError || templateInputSetError) && (
                  <Container height={300}>
                    <PageError
                      message={
                        defaultTo((templateError?.data as Error)?.message, templateError?.message) ||
                        defaultTo((templateInputSetError?.data as Error)?.message, templateInputSetError?.message)
                      }
                      onClick={() => refetch()}
                    />
                  </Container>
                )}
                {!templateLoading &&
                  !templateInputSetLoading &&
                  !templateError &&
                  !templateInputSetError &&
                  formik.values.inputsTemplate &&
                  formik.values.allValues && (
                    <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} spacing={'large'}>
                      <Heading level={5} color={Color.BLACK}>
                        {getString('templatesLibrary.templateInputs')}
                      </Heading>
                      <StepForm
                        key={`${formik.values.template.templateRef}-${defaultTo(
                          formik.values.template.versionLabel,
                          ''
                        )}`}
                        template={{ step: formik.values.inputsTemplate }}
                        values={{ step: formik.values.template?.templateInputs as StepElementConfig }}
                        allValues={{ step: formik.values.allValues }}
                        readonly={readonly}
                        viewType={StepViewType.InputSet}
                        path={TEMPLATE_INPUT_PATH}
                        allowableTypes={allowableTypes}
                        onUpdate={noop}
                        hideTitle={true}
                      />
                    </Layout.Vertical>
                  )}
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </div>
  )
}

export const TemplateStepWidgetWithRef = React.forwardRef(TemplateStepWidget)

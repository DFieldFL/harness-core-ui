/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Accordion,
  Color,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  Label,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Button,
  Text
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { cloneDeep, set } from 'lodash-es'

import type { FormikProps } from 'formik'

import { Classes, Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useQueryParams } from '@common/hooks'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { TFMonaco } from './TFMonacoEditor'

import TfVarFileList from './TFVarFileList'
import { ConfigurationTypes, TerraformProps, TFFormData } from '../TerraformInterfaces'
import ConfigForm from './ConfigForm'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

const setInitialValues = (data: TFFormData): TFFormData => {
  return data
}

export default function TerraformEditView(
  props: TerraformProps,
  formikRef: StepFormikFowardRef<TFFormData>
): React.ReactElement {
  const { stepType, isNewStep = true } = props
  const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, readonly = false } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const planValidationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      provisionerIdentifier: IdentifierSchemaWithOutName(getString, {
        requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
        regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
      }),
      configuration: Yup.object().shape({
        command: Yup.string().required(getString('pipelineSteps.commandRequired'))
      })
    })
  })
  const regularValidationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      provisionerIdentifier: IdentifierSchemaWithOutName(getString, {
        requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
        regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
      }),
      configuration: Yup.object().shape({
        type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
      })
    })
  })
  let configurationTypes: SelectOption[]
  if (stepType === StepType.TerraformApply) {
    configurationTypes = [
      { label: getString('inline'), value: ConfigurationTypes.Inline },
      { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan }
    ]
  } else {
    configurationTypes = [
      { label: getString('inline'), value: ConfigurationTypes.Inline },
      { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan },
      { label: getString('pipelineSteps.configTypes.fromApply'), value: ConfigurationTypes.InheritFromApply }
    ]
  }

  const [showModal, setShowModal] = React.useState(false)

  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''

  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true
  }
  return (
    <>
      <Formik<TFFormData>
        onSubmit={values => {
          const payload = {
            ...values
          }
          onUpdate?.(payload as any)
        }}
        validate={values => {
          const payload = {
            ...values
          }
          onChange?.(payload as any)
        }}
        formName={`terraformEdit-${stepType}-${sectionId}`}
        initialValues={setInitialValues(initialValues as any)}
        validationSchema={stepType === StepType.TerraformPlan ? planValidationSchema : regularValidationSchema}
      >
        {(formik: FormikProps<TFFormData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{
                    disabled: readonly
                  }}
                />
              </div>

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                  disabled={readonly}
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
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={css.divider} />

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.Select
                  items={configurationTypes}
                  name="spec.configuration.type"
                  label={getString('pipelineSteps.configurationType')}
                  placeholder={getString('pipelineSteps.configurationType')}
                  disabled={readonly}
                />
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec?.provisionerIdentifier as string}
                    type="String"
                    variableName="spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('spec.provisionerIdentifier', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>

              {formik.values?.spec?.configuration?.type === ConfigurationTypes.Inline && (
                <>
                  <Layout.Vertical>
                    <Label
                      style={{ color: Color.GREY_900 }}
                      className={css.configLabel}
                      data-tooltip-id="tfConfigurationFile"
                    >
                      {getString('cd.configurationFile')}
                      <HarnessDocTooltip useStandAlone={true} tooltipId="tfConfigurationFile" />
                    </Label>
                    <div className={cx(css.configFile, css.addMarginBottom)}>
                      <div className={css.configField}>
                        {!formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath && (
                          <a
                            className={css.configPlaceHolder}
                            data-name="config-edit"
                            onClick={() => setShowModal(true)}
                          >
                            {getString('cd.configFilePlaceHolder')}
                          </a>
                        )}
                        {formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath && (
                          <Text font="normal" lineClamp={1} width={200}>
                            /{formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath}
                          </Text>
                        )}
                        {formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath ? (
                          <Button
                            minimal
                            icon="Edit"
                            withoutBoxShadow
                            iconProps={{ size: 16 }}
                            onClick={() => setShowModal(true)}
                            data-name="config-edit"
                            withoutCurrentColor={true}
                            className={css.editBtn}
                          />
                        ) : null}
                      </div>
                    </div>
                  </Layout.Vertical>

                  <Accordion className={stepCss.accordion}>
                    <Accordion.Panel
                      id="step-1"
                      summary={getString('common.optionalConfig')}
                      details={
                        <div className={css.optionalConfigDetails}>
                          {formik.values?.spec?.configuration?.type === ConfigurationTypes.Inline && (
                            <div className={cx(stepCss.formGroup, stepCss.md)}>
                              <FormInput.MultiTextInput
                                name="spec.configuration.spec.workspace"
                                label={getString('pipelineSteps.workspace')}
                                multiTextInputProps={{ expressions, allowableTypes }}
                                isOptional={true}
                                disabled={readonly}
                              />
                              {getMultiTypeFromValue(formik.values.spec?.configuration?.spec?.workspace) ===
                                MultiTypeInputType.RUNTIME && (
                                <ConfigureOptions
                                  value={formik.values?.spec?.configuration?.spec?.workspace as string}
                                  type="String"
                                  variableName="configuration.spec.workspace"
                                  showRequiredField={false}
                                  showDefaultField={false}
                                  showAdvanced={true}
                                  onChange={value => {
                                    formik.setFieldValue('values.spec.configuration.spec.workspace', value)
                                  }}
                                  isReadonly={readonly}
                                />
                              )}
                            </div>
                          )}
                          <div className={css.divider} />
                          <TfVarFileList formik={formik} isReadonly={readonly} allowableTypes={allowableTypes} />
                          <div className={css.divider} />
                          <div
                            className={cx(stepCss.formGroup, stepCss.alignStart, css.addMarginTop, css.addMarginBottom)}
                          >
                            <MultiTypeFieldSelector
                              name="spec.configuration.spec.backendConfig.spec.content"
                              label={
                                <Text style={{ color: 'rgb(11, 11, 13)' }}>
                                  {getString('optionalField', { name: getString('cd.backEndConfig') })}
                                </Text>
                              }
                              defaultValueToReset=""
                              allowedTypes={allowableTypes}
                              skipRenderValueInExpressionLabel
                              disabled={readonly}
                              expressionRender={() => {
                                return (
                                  <TFMonaco
                                    name="spec.configuration.spec.backendConfig.spec.content"
                                    formik={formik}
                                    expressions={expressions}
                                    title={getString('cd.backEndConfig')}
                                  />
                                )
                              }}
                            >
                              <TFMonaco
                                name="spec.configuration.spec.backendConfig.spec.content"
                                formik={formik}
                                expressions={expressions}
                                title={getString('cd.backEndConfig')}
                              />
                            </MultiTypeFieldSelector>
                            {getMultiTypeFromValue(
                              formik.values.spec?.configuration?.spec?.backendConfig?.spec?.content
                            ) === MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                value={formik.values.spec?.configuration?.spec?.backendConfig?.spec?.content as string}
                                type="String"
                                variableName="spec.configuration.spec.backendConfig.spec.content"
                                showRequiredField={false}
                                showDefaultField={false}
                                showAdvanced={true}
                                onChange={value =>
                                  setFieldValue('spec.configuration.spec.backendConfig.spec.content', value)
                                }
                                isReadonly={readonly}
                              />
                            )}
                          </div>
                          <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                            <MultiTypeList
                              multiTextInputProps={{
                                expressions,
                                allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                              }}
                              name="spec.configuration.spec.targets"
                              disabled={readonly}
                              multiTypeFieldSelectorProps={{
                                label: (
                                  <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                    {getString('optionalField', { name: getString('pipeline.targets.title') })}
                                  </Text>
                                )
                              }}
                              style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                            />
                          </div>
                          <div className={css.divider} />
                          <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                            <MultiTypeMap
                              valueMultiTextInputProps={{
                                expressions,
                                allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                              }}
                              name="spec.configuration.spec.environmentVariables"
                              multiTypeFieldSelectorProps={{
                                disableTypeSelection: true,
                                label: (
                                  <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                    {getString('optionalField', { name: getString('environmentVariables') })}
                                  </Text>
                                )
                              }}
                              disabled={readonly}
                            />
                          </div>
                        </div>
                      }
                    />
                  </Accordion>

                  {showModal && (
                    <Dialog
                      onClose={() => setShowModal(false)}
                      enforceFocus={false}
                      className={cx(Classes.DIALOG, 'padded-dialog')}
                      {...modalProps}
                      title={getString('pipelineSteps.configFiles')}
                      isCloseButtonShown
                      style={{ padding: '24px' }}
                    >
                      <ConfigForm
                        onClick={data => {
                          const configObject = {
                            ...data.spec?.configuration?.spec?.configFiles
                          }

                          if (configObject?.store.spec.gitFetchType === 'Branch') {
                            delete configObject.store.spec.commitId
                          } else if (configObject?.store.spec.gitFetchType === 'Commit') {
                            delete configObject.store.spec.branch
                          }
                          const valObj = cloneDeep(formik.values)
                          set(valObj, 'spec.configuration.spec.configFiles', { ...configObject })

                          formik.setValues(valObj)

                          setShowModal(false)
                        }}
                        data={formik.values}
                        onHide={() => setShowModal(false)}
                        isReadonly={readonly}
                        allowableTypes={allowableTypes}
                      />
                    </Dialog>
                  )}
                </>
              )}
            </>
          )
        }}
      </Formik>
    </>
  )
}

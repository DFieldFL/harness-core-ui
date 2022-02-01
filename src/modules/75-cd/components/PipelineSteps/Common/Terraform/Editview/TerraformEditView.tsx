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
  Text,
  StepWizard,
  ButtonVariation,
  Icon
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'
import { cloneDeep, set } from 'lodash-es'

import type { FormikProps } from 'formik'

import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
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
import type { ConnectorInfoDTO } from 'services/cd-ng'

import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'

import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { TFMonaco } from './TFMonacoEditor'

import TfVarFileList from './TFVarFileList'
import { ConfigurationTypes, TerraformProps, TFFormData } from '../TerraformInterfaces'
import { TerraformConfigStepOne, TerraformConfigStepTwo } from './TerraformConfigForm'
import { ConnectorTypes, ConnectorMap } from './TerraformConfigFormHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

const setInitialValues = (data: TFFormData): TFFormData => {
  return data
}

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export default function TerraformEditView(
  props: TerraformProps,
  formikRef: StepFormikFowardRef<TFFormData>
): React.ReactElement {
  const { stepType, isNewStep = true } = props
  const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, readonly = false } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

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

  const [isEditMode, setIsEditMode] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [connectorView, setConnectorView] = React.useState(false)
  const [selectedConnector, setSelectedConnector] = React.useState<ConnectorTypes | ''>('')

  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
    if (type === Connectors.GIT) {
      return buildGitPayload
    }
    if (type === Connectors.GITHUB) {
      return buildGithubPayload
    }
    if (type === Connectors.BITBUCKET) {
      return buildBitbucketPayload
    }
    if (type === Connectors.GITLAB) {
      return buildGitlabPayload
    }
    return () => ({})
  }

  const getNewConnectorSteps = () => {
    const connectorType = ConnectorMap[selectedConnector]
    const buildPayload = getBuildPayload(ConnectorMap[selectedConnector])
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        <GitDetailsStep
          type={connectorType}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {connectorType === Connectors.GIT ? (
          <StepGitAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.GITHUB ? (
          <StepGithubAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.BITBUCKET ? (
          <StepBitbucketAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.GITLAB ? (
          <StepGitlabAuthentication
            name={getString('credentials')}
            identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildPayload}
          connectorInfo={undefined}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={false}
          type={connectorType}
        />
      </StepWizard>
    )
  }

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      setConnectorView(false)
    }
  }

  const getTitle = () => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }} margin={{ bottom: 'xlarge' }}>
      <Icon name="service-terraform" className={css.remoteIcon} size={50} padding={{ bottom: 'large' }} />
      <Text color={Color.WHITE}>{getString('cd.configFileStoreTitle')}</Text>
    </Layout.Vertical>
  )

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
                            data-testid="editConfigButton"
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
                          <TfVarFileList
                            formik={formik}
                            isReadonly={readonly}
                            allowableTypes={allowableTypes}
                            setSelectedConnector={setSelectedConnector}
                            getNewConnectorSteps={getNewConnectorSteps}
                          />
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
                      {...DIALOG_PROPS}
                      isCloseButtonShown
                      onClose={() => {
                        setShowModal(false)
                      }}
                      className={cx(css.modal, Classes.DIALOG)}
                    >
                      <div className={css.createTfWizard}>
                        <StepWizard title={getTitle()} className={css.configWizard} onStepChange={onStepChange}>
                          <TerraformConfigStepOne
                            name={getString('cd.configFileStepOne')}
                            data={values}
                            isReadonly={readonly}
                            isEditMode={isEditMode}
                            allowableTypes={allowableTypes}
                            setConnectorView={setConnectorView}
                            selectedConnector={selectedConnector}
                            setSelectedConnector={setSelectedConnector}
                          />
                          {connectorView ? getNewConnectorSteps() : null}
                          <TerraformConfigStepTwo
                            name={getString('cd.configFileDetails')}
                            isReadonly={readonly}
                            allowableTypes={allowableTypes}
                            onSubmitCallBack={(data: any) => {
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
                          />
                        </StepWizard>
                      </div>
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="cross"
                        iconProps={{ size: 18 }}
                        onClick={() => setShowModal(false)}
                        className={css.crossIcon}
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

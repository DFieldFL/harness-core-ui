/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Accordion,
  Button,
  ButtonVariation,
  Color,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  IconName,
  Icon,
  Label,
  Layout,
  MultiTypeInputType,
  Text,
  StepWizard
} from '@wings-software/uicore'
import { Classes, Dialog, IOptionProps, IDialogProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'

import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { cloneDeep, isEmpty, set } from 'lodash-es'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
// import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  setFormikRef,
  StepFormikFowardRef,
  StepViewType,
  ValidateInputSetProps
} from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { StringNGVariable, ConnectorInfoDTO } from 'services/cd-ng'

import type { StringsMap } from 'stringTypes'
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

import {
  CommandTypes,
  onSubmitTFPlanData,
  TerraformPlanProps,
  TerraformPlanVariableStepProps,
  TFPlanFormData
} from '../Common/Terraform/TerraformInterfaces'
import TfVarFileList from './TfPlanVarFileList'

import TerraformInputStep from './TfPlanInputStep'
import { TerraformVariableStep } from './TfPlanVariableView'
import { TerraformConfigStepOne, TerraformConfigStepTwo } from '../Common/Terraform/Editview/TerraformConfigForm'
import { ConnectorMap, ConnectorTypes } from '../Common/Terraform/Editview/TerraformConfigFormHelper'

import { TFMonaco } from '../Common/Terraform/Editview/TFMonacoEditor'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/Terraform/Editview/TerraformVarfile.module.scss'

const setInitialValues = (data: TFPlanFormData): TFPlanFormData => {
  return data
}
interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

function TerraformPlanWidget(
  props: TerraformPlanProps,
  formikRef: StepFormikFowardRef<TFPlanFormData>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, allowableTypes, isNewStep, readonly = false, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [connectorView, setConnectorView] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<ConnectorTypes | ''>('')

  const commandTypeOptions: IOptionProps[] = [
    { label: getString('filters.apply'), value: CommandTypes.Apply },
    { label: getString('pipelineSteps.destroy'), value: CommandTypes.Destroy }
  ]

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''

  const [showRemoteWizard, setShowRemoteWizard] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const onCloseOfRemoteWizard = () => {
    setShowRemoteWizard(false)
    setIsEditMode(false)
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
    const buildPayload = getBuildPayload(ConnectorMap[selectedConnector])
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={ConnectorMap[selectedConnector]}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        <GitDetailsStep
          type={ConnectorMap[selectedConnector]}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {ConnectorMap[selectedConnector] === Connectors.GIT ? (
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
        {ConnectorMap[selectedConnector] === Connectors.GITHUB ? (
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
        {ConnectorMap[selectedConnector] === Connectors.BITBUCKET ? (
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
        {ConnectorMap[selectedConnector] === Connectors.GITLAB ? (
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
          type={ConnectorMap[selectedConnector]}
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
    <Formik<TFPlanFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      validate={values => {
        onChange?.(values)
      }}
      initialValues={setInitialValues(initialValues)}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          provisionerIdentifier: Yup.string()
            .required(getString('pipelineSteps.provisionerIdentifierRequired'))
            .nullable(),
          configuration: Yup.object().shape({
            command: Yup.string().required(getString('pipelineSteps.commandRequired')),
            secretManagerRef: Yup.string().required(getString('cd.secretManagerRequired')).nullable()
          })
        })
      })}
      formName={`terraformPlanEditView-tfPlan-${sectionId}`}
    >
      {(formik: FormikProps<TFPlanFormData>) => {
        const { values, setFieldValue } = formik
        setFormikRef(formikRef, formik)
        return (
          <>
            <>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{
                      disabled: readonly
                    }}
                  />
                </div>
              )}

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
                <FormInput.RadioGroup
                  name="spec.configuration.command"
                  label={getString('commandLabel')}
                  radioGroup={{ inline: true }}
                  items={commandTypeOptions}
                  className={css.radioBtns}
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

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeConnectorField
                  label={getString('connectors.title.secretManager')}
                  category={'SECRET_MANAGER'}
                  setRefValue
                  width={280}
                  name="spec.configuration.secretManagerRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  disabled={readonly}
                />
              </div>

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
                    {!formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath && (
                      <a className={css.configPlaceHolder} onClick={() => setShowRemoteWizard(true)}>
                        {getString('cd.configFilePlaceHolder')}
                      </a>
                    )}
                    {formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath && (
                      <Text
                        font="normal"
                        lineClamp={1}
                        width={200}
                        data-testid={formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath}
                      >
                        /{formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath}
                      </Text>
                    )}
                    {formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath ? (
                      <Button
                        minimal
                        icon="Edit"
                        withoutBoxShadow
                        iconProps={{ size: 16 }}
                        onClick={() => setShowRemoteWizard(true)}
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
                    <>
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormInput.MultiTextInput
                          name="spec.configuration.workspace"
                          label={getString('pipelineSteps.workspace')}
                          multiTextInputProps={{ expressions, allowableTypes }}
                          isOptional={true}
                          disabled={readonly}
                        />
                        {getMultiTypeFromValue(formik.values.spec?.configuration?.workspace) ===
                          MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formik.values?.spec?.configuration?.workspace as string}
                            type="String"
                            variableName="spec.configuration.workspace"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => {
                              /* istanbul ignore else */
                              formik.setFieldValue('spec.configuration.workspace', value)
                            }}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                      <div className={css.divider} />
                      <TfVarFileList
                        formik={formik}
                        isReadonly={readonly}
                        allowableTypes={allowableTypes}
                        setSelectedConnector={setSelectedConnector}
                        getNewConnectorSteps={getNewConnectorSteps}
                      />
                      <div className={css.divider} />
                      <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                        <MultiTypeFieldSelector
                          name="spec.configuration.backendConfig.spec.content"
                          label={
                            <Text style={{ color: 'rgb(11, 11, 13)' }}>
                              {' '}
                              {getString('optionalField', { name: getString('cd.backEndConfig') })}
                            </Text>
                          }
                          defaultValueToReset=""
                          allowedTypes={allowableTypes}
                          disabled={readonly}
                          expressionRender={() => {
                            return (
                              <TFMonaco
                                name="spec.configuration.backendConfig.spec.content"
                                formik={formik}
                                expressions={expressions}
                                title={getString('cd.backEndConfig')}
                              />
                            )
                          }}
                          skipRenderValueInExpressionLabel
                        >
                          <TFMonaco
                            name="spec.configuration.backendConfig.spec.content"
                            formik={formik}
                            expressions={expressions}
                            title={getString('cd.backEndConfig')}
                          />
                        </MultiTypeFieldSelector>
                        {getMultiTypeFromValue(formik.values.spec?.configuration?.backendConfig?.spec?.content) ===
                          MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ marginTop: 3 }}
                            value={formik.values.spec?.configuration?.backendConfig?.spec?.content as string}
                            type="String"
                            variableName="spec.configuration.backendConfig.spec.content"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => setFieldValue('spec.configuration.backendConfig.spec.content', value)}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                      <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                        <MultiTypeList
                          name="spec.configuration.targets"
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                          }}
                          multiTypeFieldSelectorProps={{
                            label: (
                              <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                {getString('optionalField', { name: getString('pipeline.targets.title') })}
                              </Text>
                            )
                          }}
                          style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                          disabled={readonly}
                        />
                      </div>
                      <div className={css.divider} />
                      <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                        <MultiTypeMap
                          name="spec.configuration.environmentVariables"
                          valueMultiTextInputProps={{
                            expressions,
                            allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME)
                          }}
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
                    </>
                  }
                />
              </Accordion>
            </>
            {showRemoteWizard && (
              <Dialog
                {...DIALOG_PROPS}
                isOpen={true}
                isCloseButtonShown
                onClose={() => {
                  setShowRemoteWizard(false)
                }}
                className={cx(css.modal, Classes.DIALOG)}
              >
                <div className={css.createTfWizard}>
                  <StepWizard title={getTitle()} className={css.configWizard} onStepChange={onStepChange}>
                    <TerraformConfigStepOne
                      name={getString('cd.configFileStepOne')}
                      data={formik.values}
                      isTerraformPlan
                      isReadonly={readonly}
                      isEditMode={isEditMode}
                      allowableTypes={allowableTypes}
                      setConnectorView={setConnectorView}
                      setSelectedConnector={setSelectedConnector}
                    />
                    {connectorView ? getNewConnectorSteps() : null}
                    <TerraformConfigStepTwo
                      name={getString('cd.configFileDetails')}
                      isTerraformPlan
                      isReadonly={readonly}
                      allowableTypes={allowableTypes}
                      onSubmitCallBack={(data: any) => {
                        const configObject = {
                          ...data.spec?.configuration?.configFiles
                        }

                        if (configObject?.store.spec.gitFetchType === 'Branch') {
                          delete configObject.store.spec.commitId
                        } else if (configObject?.store.spec.gitFetchType === 'Commit') {
                          delete configObject.store.spec.branch
                        }

                        const valObj = cloneDeep(formik.values)
                        configObject.store.type = configObject?.store?.spec?.connectorRef?.connector?.type || 'Git'
                        set(valObj, 'spec.configuration.configFiles', { ...configObject })

                        formik.setValues(valObj)

                        setShowRemoteWizard(false)
                      }}
                    />
                  </StepWizard>
                </div>
                <Button
                  variation={ButtonVariation.ICON}
                  icon="cross"
                  iconProps={{ size: 18 }}
                  onClick={onCloseOfRemoteWizard}
                  className={css.crossIcon}
                />
              </Dialog>
            )}
          </>
        )
      }}
    </Formik>
  )
}
const TerraformPlanWidgetWithRef = React.forwardRef(TerraformPlanWidget)
export class TerraformPlan extends PipelineStep<TFPlanFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformPlan
  protected defaultValues: TFPlanFormData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerraformPlan,
    spec: {
      configuration: {
        command: 'Apply',
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: 'Branch'
            }
          }
        },
        secretManagerRef: ''
      },
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terraform-plan'
  protected stepName = 'Terraform Plan'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerraformPlan'
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TFPlanFormData>): FormikErrors<TFPlanFormData> {
    /* istanbul ignore next */
    const errors = {} as any
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm
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

  private getInitialValues(data: TFPlanFormData): TFPlanFormData {
    const envVars = data.spec?.configuration?.environmentVariables as StringNGVariable[]
    const isEnvRunTime =
      getMultiTypeFromValue(data.spec?.configuration?.environmentVariables as any) === MultiTypeInputType.RUNTIME
    const isTargetRunTime =
      getMultiTypeFromValue(data.spec?.configuration?.targets as any) === MultiTypeInputType.RUNTIME
    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec?.configuration,
          secretManagerRef: data.spec?.configuration?.secretManagerRef || '',
          configFiles: data.spec?.configuration?.configFiles || ({} as any),
          command: data.spec?.configuration?.command || 'Apply',
          targets: !isTargetRunTime
            ? Array.isArray(data.spec?.configuration?.targets)
              ? (data.spec?.configuration?.targets as string[]).map((target: string) => ({
                  value: target,
                  id: uuid()
                }))
              : [{ value: '', id: uuid() }]
            : data?.spec?.configuration?.targets,
          environmentVariables: !isEnvRunTime
            ? Array.isArray(envVars)
              ? envVars.map(variable => ({
                  key: variable.name || '',
                  value: variable?.value,
                  id: uuid()
                }))
              : [{ key: '', value: '', id: uuid() }]
            : data?.spec?.configuration?.environmentVariables
        }
      }
    }
  }

  processFormData(data: any): TFPlanFormData {
    return onSubmitTFPlanData(data)
  }

  renderStep(props: StepProps<TFPlanFormData, TerraformPlanVariableStepProps>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      customStepProps,
      formikRef,
      isNewStep
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformInputStep
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          onChange={data => onChange?.(this.processFormData(data))}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={inputSetData?.path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformPlanVariableStepProps)}
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
        />
      )
    }
    return (
      <TerraformPlanWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformPlan}
        readonly={props.readonly}
      />
    )
  }
}

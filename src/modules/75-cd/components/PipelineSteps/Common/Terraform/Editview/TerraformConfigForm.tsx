/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Button,
  Color,
  Formik,
  Layout,
  Text,
  Heading,
  Card,
  Icon,
  ButtonVariation,
  ButtonSize,
  FormInput,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { AllowedTypes, tfVarIcons, ConnectorMap, ConnectorLabelMap, ConnectorTypes } from './TerraformConfigFormHelper'

import type { Connector } from '../TerraformInterfaces'

import css from './TerraformConfigForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TerraformConfigStepOneProps {
  data: any
  isReadonly: boolean
  allowableTypes: MultiTypeInputType[]
  isEditMode: boolean
  setConnectorView: (val: boolean) => void
  setSelectedConnector: (val: ConnectorTypes) => void
  isTerraformPlan?: boolean
}

export const TerraformConfigStepOne: React.FC<StepProps<any> & TerraformConfigStepOneProps> = ({
  data,
  isReadonly,
  allowableTypes,
  nextStep,
  isEditMode,
  setConnectorView,
  setSelectedConnector,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [selectedType, setSelectedType] = useState('')

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  useEffect(() => {
    setSelectedType(data?.spec?.configuration?.configFiles?.store?.type)
  }, [isEditMode])

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedType && getString(ConnectorLabelMap[selectedType as ConnectorTypes])
  } ${getString('connector')}`

  const validationSchema = isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            configFiles: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError'))
                })
              })
            })
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              configFiles: Yup.object().shape({
                store: Yup.object().shape({
                  spec: Yup.object().shape({
                    connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError'))
                  })
                })
              })
            })
          })
        })
      })

  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileStore')}
      </Heading>

      <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
        {AllowedTypes.map(item => (
          <div key={item} className={css.squareCardContainer}>
            <Card
              className={css.connectorIcon}
              selected={item === selectedType}
              data-testid={`varStore-${item}`}
              onClick={() => {
                setSelectedType(item)
                setSelectedConnector(item as ConnectorTypes)
              }}
            >
              <Icon name={tfVarIcons[item]} size={26} />
            </Card>
            <Text color={Color.BLACK_100}>{item}</Text>
          </div>
        ))}
      </Layout.Horizontal>

      <Formik
        formName="tfPlanConfigForm"
        enableReinitialize={true}
        onSubmit={() => {
          /* istanbul ignore next */
          setSelectedType('')
        }}
        initialValues={data}
        validationSchema={validationSchema}
      >
        {formik => {
          const disabled = isTerraformPlan
            ? formik?.values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
            : formik?.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
          return (
            <Form className={css.formComponent}>
              <div className={css.formContainerStepOne}>
                {selectedType && (
                  <Layout.Horizontal className={css.horizontalFlex} spacing={'medium'}>
                    <FormMultiTypeConnectorField
                      label={`${selectedType} ${getString('connector')}`}
                      type={ConnectorMap[selectedType]}
                      width={400}
                      name={
                        isTerraformPlan
                          ? 'spec.configuration.configFiles.store.spec.connectorRef'
                          : 'spec.configuration.spec.configFiles.store.spec.connectorRef'
                      }
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      style={{ marginBottom: 10 }}
                      multiTypeProps={{ expressions, allowableTypes }}
                    />
                    <Button
                      className={css.newConnectorButton}
                      variation={ButtonVariation.LINK}
                      size={ButtonSize.SMALL}
                      disabled={isReadonly}
                      id="new-config-connector"
                      text={newConnectorLabel}
                      icon="plus"
                      iconProps={{ size: 12 }}
                      onClick={() => {
                        setConnectorView(true)
                        nextStep?.({ ...data, selectedType })
                      }}
                    />
                  </Layout.Horizontal>
                )}
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  onClick={() => nextStep?.({ ...formik.values, selectedType })}
                  disabled={!disabled}
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

interface TerraformConfigStepTwoProps {
  allowableTypes: MultiTypeInputType[]
  isReadonly: boolean
  onSubmitCallBack: any
  isTerraformPlan?: boolean
}

export const TerraformConfigStepTwo: React.FC<StepProps<any> & TerraformConfigStepTwoProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isReadonly = false,
  allowableTypes,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]

  const validationSchema = isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            configFiles: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
                  branch: Yup.string().when('gitFetchType', {
                    is: 'Branch',
                    then: Yup.string().trim().required(getString('validation.branchName'))
                  }),
                  commitId: Yup.string().when('gitFetchType', {
                    is: 'CommitId',
                    then: Yup.string().trim().required(getString('validation.commitId'))
                  }),
                  folderPath: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
                })
              })
            })
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              configFiles: Yup.object().shape({
                store: Yup.object().shape({
                  spec: Yup.object().shape({
                    connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError')),
                    gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
                    branch: Yup.string().when('gitFetchType', {
                      is: 'Branch',
                      then: Yup.string().trim().required(getString('validation.branchName'))
                    }),
                    commitId: Yup.string().when('gitFetchType', {
                      is: 'Commit',
                      then: Yup.string().trim().required(getString('validation.commitId'))
                    }),
                    folderPath: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
                  })
                })
              })
            })
          })
        })
      })

  const formInputNames = {
    repoName: isTerraformPlan
      ? 'spec.configuration.configFiles.store.spec.repoName'
      : 'spec.configuration.spec.configFiles.store.spec.repoName',
    gitFetchType: isTerraformPlan
      ? 'spec.configuration.configFiles.store.spec.gitFetchType'
      : 'spec.configuration.spec.configFiles.store.spec.gitFetchType',
    branch: isTerraformPlan
      ? 'spec.configuration.configFiles.store.spec.branch'
      : 'spec.configuration.spec.configFiles.store.spec.branch',
    commitId: isTerraformPlan
      ? 'spec.configuration.configFiles.store.spec.commitId'
      : 'spec.configuration.spec.configFiles.store.spec.commitId',
    folderPath: isTerraformPlan
      ? 'spec.configuration.configFiles.store.spec.folderPath'
      : 'spec.configuration.spec.configFiles.store.spec.folderPath'
  }

  const formikOnChangeNames = {
    repoName: isTerraformPlan
      ? 'configuration.configFiles.store.spec.repoName'
      : 'configuration.spec.configFiles.store.spec.repoName',
    branch: isTerraformPlan
      ? 'configuration.configFiles.store.spec.branch'
      : 'configuration.spec.configFiles.store.spec.branch',
    commitId: isTerraformPlan
      ? 'spec.configuration.configFiles.spec.store.spec.commitId'
      : 'spec.configuration.spec.configFiles.spec.store.spec.commitId',
    folderPath: isTerraformPlan
      ? 'formik.values.spec?.configuration?.configFiles?.store.spec?.folderPath'
      : 'formik.values.spec?.configuration?.spec?.store.spec?.folderPath'
  }
  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileDetails')}
      </Heading>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={prevStepData}
        onSubmit={onSubmitCallBack}
        validationSchema={validationSchema}
      >
        {formik => {
          const connectorValue = (
            isTerraformPlan
              ? formik.values.spec?.configuration?.configFiles?.store?.spec?.connectorRef
              : formik.values.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
          ) as Connector
          const store = isTerraformPlan
            ? formik.values?.spec?.configuration?.configFiles?.store?.spec
            : formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec
          return (
            <Form className={css.formComponent}>
              <div className={css.tfRemoteForm}>
                {(connectorValue?.connector?.spec?.connectionType === 'Account' ||
                  connectorValue?.connector?.spec?.type === 'Account') && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.repoName')}
                      name={formInputNames.repoName}
                      placeholder={getString('pipelineSteps.repoName')}
                      multiTextInputProps={{ expressions, allowableTypes: allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.repoName) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.repoName as string}
                        type="String"
                        variableName="configuration.configFiles.store.spec.repoName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames.repoName, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name={formInputNames.gitFetchType}
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>
                {store?.gitFetchType === gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name={formInputNames.branch}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.branch) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.branch as string}
                        type="String"
                        variableName="configuration.spec.configFiles.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames.branch, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                {store?.gitFetchType === gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name={formInputNames.commitId}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.commitId) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.commitId as string}
                        type="String"
                        variableName={formInputNames.commitId}
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames.commitId, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('cd.folderPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name={formInputNames.folderPath}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(store?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginTop: 1 }}
                      value={store?.folderPath as string}
                      type="String"
                      variableName="formik.values.spec?.configuration?.configFiles?.store.spec?.folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue(formikOnChangeNames.folderPath, value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

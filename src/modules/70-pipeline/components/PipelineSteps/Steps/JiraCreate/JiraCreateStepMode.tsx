/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import {
  Accordion,
  Button,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  useModalHook
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { String, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  JiraFieldNG,
  JiraProjectBasicNG,
  JiraProjectNG,
  useGetJiraIssueCreateMetadata,
  useGetJiraProjects
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeTextAreaField } from '@common/components'
import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { getGenuineValue, setIssueTypeOptions } from '../JiraApproval/helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { JiraDynamicFieldsSelector } from './JiraDynamicFieldsSelector'
import type {
  JiraCreateData,
  JiraCreateFieldType,
  JiraCreateFormContentInterface,
  JiraCreateStepModeProps,
  JiraFieldNGWithValue
} from './types'
import {
  getInitialValueForSelectedField,
  getKVFieldsToBeAddedInForm,
  getSelectedFieldsToBeAddedInForm,
  processFormData,
  resetForm
} from './helper'
import { JiraFieldsRenderer } from './JiraFieldsRenderer'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './JiraCreate.module.scss'

const FormContent = ({
  formik,
  refetchProjects,
  refetchProjectMetadata,
  projectsResponse,
  projectMetadataFetchError,
  projectsFetchError,
  projectMetaResponse,
  fetchingProjects,
  fetchingProjectMetadata,
  isNewStep,
  allowableTypes,
  stepViewType,
  readonly
}: JiraCreateFormContentInterface): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()

  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const projectKeyFixedValue =
    typeof formik.values.spec.projectKey === 'object'
      ? (formik.values.spec.projectKey as JiraProjectSelectOption).key
      : undefined
  const issueTypeFixedValue =
    typeof formik.values.spec.issueType === 'object'
      ? (formik.values.spec.issueType as JiraProjectSelectOption).key
      : undefined

  useEffect(() => {
    // If connector value changes in form, fetch projects
    // second block is needed so that we don't fetch projects if type is expression
    // CDC-15633
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      refetchProjects({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedFields', [])
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && projectKeyFixedValue) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined && projectKeyFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedFields', [])
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (issueTypeFixedValue) {
      const issueTypeData = projectMetadata?.issuetypes[issueTypeFixedValue]
      const fieldKeys = Object.keys(issueTypeData?.fields || {})
      const formikSelectedFields: JiraFieldNGWithValue[] = []
      fieldKeys.forEach(keyy => {
        const field = issueTypeData?.fields[keyy]
        if (field && keyy !== 'Summary' && keyy !== 'Description') {
          const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
          if (savedValueForThisField) {
            formikSelectedFields.push({ ...field, value: savedValueForThisField })
          } else if (field.required) {
            formikSelectedFields.push({ ...field, value: '' })
          }
        }
      })
      formik.setFieldValue('spec.selectedFields', formikSelectedFields)
      const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(formik.values.spec.fields, [], formikSelectedFields)
      formik.setFieldValue('spec.fields', toBeUpdatedKVFields)
    } else if (issueTypeFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedFields', [])
    }
  }, [issueTypeFixedValue, projectMetadata])

  useEffect(() => {
    let options: JiraProjectSelectOption[] = []
    const projectResponseList: JiraProjectBasicNG[] = projectsResponse?.data || []
    options =
      projectResponseList.map((project: JiraProjectBasicNG) => ({
        label: project.name || '',
        value: project.id || '',
        key: project.key || ''
      })) || []

    setProjectOptions(options)
  }, [projectsResponse?.data])

  useEffect(() => {
    if (projectKeyFixedValue && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[projectKeyFixedValue]
      setProjectMetadata(projectMD)
    }
  }, [projectMetaResponse?.data])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        enforceFocus={false}
        isOpen
        onClose={hideDynamicFieldsModal}
        title={getString('pipeline.jiraCreateStep.addFields')}
      >
        <JiraDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedProjectKey={projectKeyFixedValue || ''}
          selectedIssueTypeKey={issueTypeFixedValue || ''}
          projectOptions={projectOptions}
          addSelectedFields={(fieldsToBeAdded: JiraFieldNG[]) => {
            formik.setFieldValue(
              'spec.selectedFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedFields,
                formik.values.spec.fields
              )
            )
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: JiraCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [projectOptions, connectorRefFixedValue, formik.values.spec.selectedFields, formik.values.spec.fields])

  const AddFieldsButton = () => (
    <Text
      onClick={() => {
        if (!isApprovalStepFieldDisabled(readonly)) {
          showDynamicFieldsModal()
        }
      }}
      style={{
        cursor: isApprovalStepFieldDisabled(readonly) ? 'not-allowed' : 'pointer'
      }}
      tooltipProps={{ dataTooltipId: 'jiraCreateAddFields' }}
      intent="primary"
    >
      {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
    </Text>
  )

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{ disabled: isApprovalStepFieldDisabled(readonly) }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            allowableTypes,
            enableConfigureOptions: false
          }}
        />
        {getMultiTypeFromValue(formik.values.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('timeout', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          width={390}
          placeholder={getString('connectors.selectConnector')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="Jira"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              if (multiType !== MultiTypeInputType.FIXED) {
                setProjectOptions([])
                setProjectMetadata(undefined)
              }
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTypeInput
          selectItems={
            fetchingProjects
              ? [{ label: getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder'), value: '' }]
              : projectOptions
          }
          label={getString('pipeline.jiraApprovalStep.project')}
          name="spec.projectKey"
          placeholder={
            fetchingProjects
              ? getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder')
              : projectsFetchError?.message
              ? projectsFetchError?.message
              : getString('pipeline.jiraCreateStep.selectProject')
          }
          disabled={isApprovalStepFieldDisabled(readonly, fetchingProjects)}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            onChange: (value: unknown) => {
              // Clear dependent fields
              if ((value as JiraProjectSelectOption)?.key !== projectKeyFixedValue) {
                resetForm(formik, 'projectKey')
                setProjectMetadata(undefined)
              }
            }
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.projectKey) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.projectKey as string}
            type="String"
            variableName="spec.projectKey"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.projectKey', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTypeInput
          selectItems={
            fetchingProjectMetadata
              ? [{ label: getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder'), value: '' }]
              : setIssueTypeOptions(projectMetadata?.issuetypes)
          }
          label={getString('pipeline.jiraApprovalStep.issueType')}
          name="spec.issueType"
          placeholder={
            fetchingProjectMetadata
              ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
              : projectMetadataFetchError?.message
              ? projectMetadataFetchError?.message
              : getString('pipeline.jiraApprovalStep.issueTypePlaceholder')
          }
          disabled={isApprovalStepFieldDisabled(readonly, fetchingProjectMetadata)}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            onChange: (value: unknown) => {
              // Clear dependent fields
              if ((value as JiraProjectSelectOption)?.key !== issueTypeFixedValue) {
                resetForm(formik, 'issueType')
              }
            }
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.issueType) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.issueType as string}
            type="String"
            variableName="spec.issueType"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.issueType', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          label={getString('summary')}
          name="spec.summary"
          placeholder={getString('pipeline.jiraCreateStep.summaryPlaceholder')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.summary) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.summary || ''}
            type="String"
            variableName="spec.summary"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.summary', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.noLookDivider} />

      <Accordion activeId="" className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <div>
              <div className={cx(stepCss.formGroup)}>
                <FormMultiTypeTextAreaField
                  name="spec.description"
                  label={getString('description')}
                  className={cx(css.descriptionField)}
                  multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
                  placeholder={getString('common.descriptionPlaceholder')}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.description) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.description || ''}
                    type="String"
                    variableName="spec.description"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.description', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <JiraFieldsRenderer
                selectedFields={formik.values.spec.selectedFields}
                readonly={readonly}
                onDelete={(index, selectedField) => {
                  const selectedFieldsAfterRemoval = formik.values.spec.selectedFields?.filter(
                    (_unused, i) => i !== index
                  )
                  formik.setFieldValue('spec.selectedFields', selectedFieldsAfterRemoval)
                  const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                  formik.setFieldValue('spec.fields', customFields)
                }}
              />

              {!isEmpty(formik.values.spec.fields) ? (
                <FieldArray
                  name="spec.fields"
                  render={({ remove }) => {
                    return (
                      <div>
                        <div className={css.headerRow}>
                          <String className={css.label} stringID="keyLabel" />
                          <String className={css.label} stringID="valueLabel" />
                        </div>
                        {formik.values.spec.fields?.map((_unused: JiraCreateFieldType, i: number) => (
                          <div className={css.headerRow} key={i}>
                            <FormInput.Text
                              name={`spec.fields[${i}].name`}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                              placeholder={getString('pipeline.keyPlaceholder')}
                            />
                            <FormInput.MultiTextInput
                              name={`spec.fields[${i}].value`}
                              label=""
                              placeholder={getString('common.valuePlaceholder')}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                              multiTextInputProps={{
                                allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME),
                                expressions
                              }}
                            />
                            <Button
                              minimal
                              icon="main-trash"
                              disabled={isApprovalStepFieldDisabled(readonly)}
                              data-testid={`remove-fieldList-${i}`}
                              onClick={() => remove(i)}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
              ) : null}

              <AddFieldsButton />
            </div>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

function JiraCreateStepMode(props: JiraCreateStepModeProps, formikRef: StepFormikFowardRef<JiraCreateData>) {
  const { onUpdate, isNewStep, readonly, onChange, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    refetch: refetchProjects,
    data: projectsResponse,
    error: projectsFetchError,
    loading: fetchingProjects
  } = useGetJiraProjects({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchProjectMetadata,
    data: projectMetaResponse,
    error: projectMetadataFetchError,
    loading: fetchingProjectMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      projectKey: ''
    }
  })

  return (
    <Formik<JiraCreateData>
      onSubmit={values => {
        onUpdate?.(processFormData(values))
      }}
      formName="jiraCreate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          projectKey: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.project')),
          issueType: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.issueType')),
          summary: Yup.string().trim().required(getString('pipeline.jiraCreateStep.validations.summary'))
        })
      })}
    >
      {(formik: FormikProps<JiraCreateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              refetchProjects={refetchProjects}
              refetchProjectMetadata={refetchProjectMetadata}
              fetchingProjects={fetchingProjects}
              fetchingProjectMetadata={fetchingProjectMetadata}
              projectMetaResponse={projectMetaResponse}
              projectsResponse={projectsResponse}
              projectsFetchError={projectsFetchError}
              projectMetadataFetchError={projectMetadataFetchError}
              isNewStep={isNewStep}
              readonly={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const JiraCreateStepModeWithRef = React.forwardRef(JiraCreateStepMode)
export default JiraCreateStepModeWithRef

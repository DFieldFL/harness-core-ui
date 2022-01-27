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
  SelectOption,
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
import { JiraFieldNG, JiraProjectBasicNG, JiraStatusNG, useGetJiraProjects, useGetJiraStatuses } from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraCreateFieldType } from '../JiraCreate/types'
import { getKVFieldsToBeAddedInForm, getSelectedFieldsToBeAddedInForm } from '../JiraCreate/helper'
import { JiraDynamicFieldsSelector } from '../JiraCreate/JiraDynamicFieldsSelector'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { JiraFieldsRenderer } from '../JiraCreate/JiraFieldsRenderer'
import type { JiraUpdateData, JiraUpdateFormContentInterface, JiraUpdateStepModeProps } from './types'
import { processFormData } from './helper'

import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../JiraCreate/JiraCreate.module.scss'

const FormContent = ({
  formik,
  refetchProjects,
  projectsResponse,
  refetchStatuses,
  fetchingStatuses,
  statusResponse,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: JiraUpdateFormContentInterface): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('')
  const [selectedIssueTypeKey, setSelectedIssueTypeKey] = useState<string>('')
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

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

      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      formik.setFieldValue('spec.selectedFields', [])
    }
  }, [connectorRefFixedValue])

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
    // get status by connector ref response
    let options: SelectOption[] = []
    const statusResponseList: JiraStatusNG[] = statusResponse?.data || []
    options =
      statusResponseList.map((status: JiraStatusNG) => ({
        label: status.name || '',
        value: status.name || ''
      })) || []

    setStatusOptions(options)
  }, [statusResponse?.data])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        isOpen
        onClose={hideDynamicFieldsModal}
        enforceFocus={false}
        title={getString('pipeline.jiraCreateStep.addFields')}
      >
        <JiraDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedProjectKey={selectedProjectKey}
          selectedIssueTypeKey={selectedIssueTypeKey}
          projectOptions={projectOptions}
          addSelectedFields={(fieldsToBeAdded: JiraFieldNG[], selectedProjectKeyInForm, selectedIssueTypeKeyInForm) => {
            setSelectedProjectKey(selectedProjectKeyInForm)
            setSelectedIssueTypeKey(selectedIssueTypeKeyInForm)
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
          showProjectDisclaimer={true}
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
      tooltipProps={{ dataTooltipId: 'jiraUpdateAddFields' }}
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
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              if (multiType !== MultiTypeInputType.FIXED) {
                setProjectOptions([])
              }
            }
          }}
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
        <FormInput.MultiTextInput
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          name="spec.issueKey"
          multiTextInputProps={{ expressions, allowableTypes }}
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.issueKey) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.issueKey as string}
            type="String"
            variableName="spec.issueKey"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.issueKey', value)}
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
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  selectItems={statusOptions}
                  label={getString('status')}
                  name="spec.transitionTo.status"
                  placeholder={
                    fetchingStatuses
                      ? getString('pipeline.jiraUpdateStep.fetchingStatus')
                      : getString('pipeline.jiraUpdateStep.selectStatus')
                  }
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.status) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.transitionTo?.status as string}
                    type="String"
                    variableName="spec.transitionTo.status"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.transitionTo.status', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  label={getString('pipeline.jiraUpdateStep.transitionLabel')}
                  name="spec.transitionTo.transitionName"
                  placeholder={getString('pipeline.jiraUpdateStep.transitionPlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.transitionName) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.transitionTo?.transitionName as string}
                    type="String"
                    variableName="spec.transitionTo.transitionName"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('spec.transitionTo.transitionName', value)}
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
                              placeholder={getString('pipeline.keyPlaceholder')}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                            />
                            <FormInput.MultiTextInput
                              name={`spec.fields[${i}].value`}
                              label=""
                              placeholder={getString('common.valuePlaceholder')}
                              multiTextInputProps={{
                                allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME),
                                expressions
                              }}
                              disabled={isApprovalStepFieldDisabled(readonly)}
                            />
                            <Button
                              minimal
                              icon="main-trash"
                              data-testid={`remove-fieldList-${i}`}
                              onClick={() => remove(i)}
                              disabled={isApprovalStepFieldDisabled(readonly)}
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

function JiraUpdateStepMode(
  props: JiraUpdateStepModeProps,
  formikRef: StepFormikFowardRef<JiraUpdateData>
): JSX.Element {
  const { onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
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
    refetch: refetchStatuses,
    data: statusResponse,
    error: statusFetchError,
    loading: fetchingStatuses
  } = useGetJiraStatuses({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  return (
    <Formik<JiraUpdateData>
      onSubmit={values => onUpdate?.(processFormData(values))}
      formName="jiraUpdate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          issueKey: Yup.string().trim().required(getString('pipeline.jiraApprovalStep.validations.issueKey')),
          transitionTo: Yup.object().shape({
            status: Yup.string().when('transitionName', {
              is: val => val?.trim()?.length,
              then: Yup.string().required(getString('pipeline.jiraUpdateStep.validations.status'))
            })
          })
        })
      })}
    >
      {(formik: FormikProps<JiraUpdateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              refetchProjects={refetchProjects}
              refetchStatuses={refetchStatuses}
              fetchingProjects={fetchingProjects}
              fetchingStatuses={fetchingStatuses}
              statusResponse={statusResponse}
              projectsResponse={projectsResponse}
              projectsFetchError={projectsFetchError}
              statusFetchError={statusFetchError}
              isNewStep={isNewStep}
              readonly={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const JiraUpdateStepModeWithRef = React.forwardRef(JiraUpdateStepMode)
export default JiraUpdateStepModeWithRef

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  JiraFieldNG,
  JiraProjectBasicNG,
  JiraProjectNG,
  JiraStatusNG,
  useGetJiraIssueCreateMetadata,
  useGetJiraProjects
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { ApprovalRejectionCriteriaType } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type {
  JiraApprovalData,
  JiraApprovalStepModeProps,
  JiraFormContentInterface,
  JiraProjectSelectOption
} from './types'
import { getApprovalRejectionCriteriaForInitialValues, getGenuineValue, resetForm, setIssueTypeOptions } from './helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { ApprovalRejectionCriteria } from '../Common/ApprovalRejectionCriteria'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './JiraApproval.module.scss'

const FormContent = ({
  formik,
  refetchProjects,
  refetchProjectMetadata,
  projectsResponse,
  projectsFetchError,
  projectMetadataFetchError,
  projectMetaResponse,
  fetchingProjects,
  fetchingProjectMetadata,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: JiraFormContentInterface): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [statusList, setStatusList] = useState<JiraStatusNG[]>([])
  const [fieldList, setFieldList] = useState<JiraFieldNG[]>([])
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
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && projectKeyFixedValue) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString(),
          fetchStatus: true
        }
      })
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (issueTypeFixedValue && projectMetadata) {
      const issueTypeData = projectMetadata?.issuetypes[issueTypeFixedValue]
      const statusListFromType = issueTypeData?.statuses || []
      setStatusList(statusListFromType)
      const fieldListToSet: JiraFieldNG[] = []
      const fieldKeys = Object.keys(issueTypeData?.fields || {})
      fieldKeys.forEach(keyy => {
        if (issueTypeData?.fields[keyy]) {
          fieldListToSet.push(issueTypeData?.fields[keyy])
        }
      })
      setFieldList(fieldListToSet)
      const approvalCriteria = getApprovalRejectionCriteriaForInitialValues(
        formik.values.spec.approvalCriteria,
        statusListFromType,
        fieldListToSet
      )
      formik.setFieldValue('spec.approvalCriteria', approvalCriteria)
      const rejectionCriteria = getApprovalRejectionCriteriaForInitialValues(
        formik.values.spec.rejectionCriteria,
        statusListFromType,
        fieldListToSet
      )
      formik.setFieldValue('spec.rejectionCriteria', rejectionCriteria)
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
            enableConfigureOptions: false,
            allowableTypes
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
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
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
          tooltipProps={{
            dataTooltipId: 'jiraApprovalProject'
          }}
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
              : getString('select')
          }
          disabled={isApprovalStepFieldDisabled(readonly, fetchingProjects)}
          isOptional={true}
          multiTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED],
            selectProps: {
              items: fetchingProjects
                ? [{ label: getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder'), value: '' }]
                : projectOptions,
              addClearBtn: true
            },
            onChange: (value: unknown) => {
              // Clear dependent fields
              if ((value as JiraProjectSelectOption)?.key !== projectKeyFixedValue) {
                resetForm(formik, 'projectKey')
                setProjectMetadata(undefined)
              }
            }
          }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTypeInput
          tooltipProps={{
            dataTooltipId: 'jiraApprovalIssueType'
          }}
          selectItems={
            fetchingProjectMetadata
              ? [{ label: getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder'), value: '' }]
              : setIssueTypeOptions(projectMetadata?.issuetypes)
          }
          label={getString('pipeline.jiraApprovalStep.issueType')}
          name="spec.issueType"
          isOptional={true}
          placeholder={
            fetchingProjectMetadata
              ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
              : projectMetadataFetchError?.message
              ? projectMetadataFetchError?.message
              : getString('select')
          }
          disabled={isApprovalStepFieldDisabled(readonly, fetchingProjectMetadata)}
          multiTypeInputProps={{
            selectProps: {
              addClearBtn: true,
              items: fetchingProjectMetadata
                ? [{ label: getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder'), value: '' }]
                : setIssueTypeOptions(projectMetadata?.issuetypes)
            },
            allowableTypes: [MultiTypeInputType.FIXED],
            onChange: (value: unknown) => {
              // Clear dependent fields
              if ((value as JiraProjectSelectOption)?.key !== issueTypeFixedValue) {
                resetForm(formik, 'issueType')
              }
            }
          }}
        />
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          tooltipProps={{
            dataTooltipId: 'jiraApprovalIssueKey'
          }}
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          name="spec.issueKey"
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.issueKey) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.issueKey}
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

      <ApprovalRejectionCriteria
        statusList={statusList}
        fieldList={fieldList}
        title={getString('pipeline.approvalCriteria.approvalCriteria')}
        isFetchingFields={fetchingProjectMetadata}
        mode="approvalCriteria"
        values={formik.values.spec.approvalCriteria}
        onChange={values => formik.setFieldValue('spec.approvalCriteria', values)}
        formik={formik}
        readonly={readonly}
        stepType={StepType.JiraApproval}
      />

      <div className={stepCss.noLookDivider} />

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <ApprovalRejectionCriteria
              statusList={statusList}
              fieldList={fieldList}
              title={getString('pipeline.approvalCriteria.rejectionCriteria')}
              isFetchingFields={fetchingProjectMetadata}
              mode="rejectionCriteria"
              values={formik.values.spec.rejectionCriteria}
              onChange={values => formik.setFieldValue('spec.rejectionCriteria', values)}
              formik={formik}
              readonly={readonly}
              stepType={StepType.JiraApproval}
            />
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

/*
functional component as this component doesn't need a state of it's own.
everything is governed from the parent
*/
function JiraApprovalStepMode(props: JiraApprovalStepModeProps, formikRef: StepFormikFowardRef<JiraApprovalData>) {
  const { onUpdate, readonly, isNewStep, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    branch,
    repoIdentifier
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
      projectKey: '',
      fetchStatus: true
    }
  })

  return (
    <Formik<JiraApprovalData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      formName="jiraApproval"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          issueKey: Yup.string().trim().required(getString('pipeline.jiraApprovalStep.validations.issueKey')),
          approvalCriteria: Yup.object().shape({
            spec: Yup.object().when('type', {
              is: ApprovalRejectionCriteriaType.KeyValues,
              then: Yup.object().shape({
                conditions: Yup.array().required(
                  getString('pipeline.approvalCriteria.validations.approvalCriteriaCondition')
                )
              }),
              otherwise: Yup.object().shape({
                expression: Yup.string().trim().required(getString('pipeline.approvalCriteria.validations.expression'))
              })
            })
          })
        })
      })}
    >
      {(formik: FormikProps<JiraApprovalData>) => {
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
              readonly={readonly}
              isNewStep={isNewStep}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const JiraApprovalStepModeWithRef = React.forwardRef(JiraApprovalStepMode)
export default JiraApprovalStepModeWithRef

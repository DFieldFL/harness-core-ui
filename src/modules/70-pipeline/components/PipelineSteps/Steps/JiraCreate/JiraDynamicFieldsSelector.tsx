import React, { useEffect, useState } from 'react'
import { FieldArray, FormikProps } from 'formik'
import { useParams } from 'react-router'
import { Button, Formik, FormInput, MultiTypeInputType, Radio, Select, Text } from '@wings-software/uicore'
import { String, useStrings } from 'framework/exports'

import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { JiraFieldNG, JiraProjectNG, useGetJiraIssueCreateMetadata } from 'services/cd-ng'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { setIssueTypeOptions } from '../JiraApproval/helper'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { JiraFieldSelector } from './JiraFieldSelector'
import {
  JiraCreateFieldType,
  JiraCreateFormFieldSelector,
  JiraDynamicFieldsSelectorContentInterface,
  JiraDynamicFieldsSelectorInterface
} from './types'
import css from './JiraDynamicFieldsSelector.module.scss'

const SelectFieldList = (props: JiraDynamicFieldsSelectorContentInterface) => {
  const { getString } = useStrings()
  const { connectorRef, refetchProjectMetadata, projectMetaResponse, fetchingProjectMetadata } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const [projectValue, setProjectValue] = useState<JiraProjectSelectOption>()
  const [issueTypeValue, setIssueTypeValue] = useState<JiraProjectSelectOption>()
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()
  const [fieldList, setFieldList] = useState<JiraFieldNG[]>([])

  const selectedProjectKey = projectValue?.key?.toString()
  const selectedIssueTypeKey = issueTypeValue?.key?.toString()

  useEffect(() => {
    if (connectorRef && selectedProjectKey) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          connectorRef,
          projectKey: selectedProjectKey,
          fetchStatus: true
        }
      })
    }
  }, [selectedProjectKey])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (selectedIssueTypeKey) {
      const issueTypeData = projectMetadata?.issuetypes[selectedIssueTypeKey || '']
      const fieldListToSet: JiraFieldNG[] = []
      const fieldKeys = Object.keys(issueTypeData?.fields || {})
      fieldKeys.forEach(keyy => {
        if (issueTypeData?.fields[keyy] && keyy !== 'Summary' && keyy !== 'Description') {
          fieldListToSet.push(issueTypeData?.fields[keyy])
        }
      })
      setFieldList(fieldListToSet)
    }
  }, [selectedIssueTypeKey, projectMetadata])

  useEffect(() => {
    if (selectedProjectKey && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[selectedProjectKey]
      setProjectMetadata(projectMD)
    }
  }, [projectMetaResponse?.data, selectedProjectKey])

  return (
    <div>
      <Text className={css.selectFieldListHelp}>{getString('pipeline.jiraCreateStep.selectFieldListHelp')}</Text>
      <div className={css.select}>
        <Text className={css.selectLabel}>{getString('pipeline.jiraApprovalStep.project')}</Text>
        <Select
          items={props.projectOptions}
          onChange={value => {
            setProjectValue(value as JiraProjectSelectOption)
          }}
          inputProps={{
            placeholder: 'Select Project'
          }}
        />
      </div>

      <div className={css.select}>
        <Text className={css.selectLabel}>{getString('pipeline.jiraApprovalStep.issueType')}</Text>
        <Select
          items={
            fetchingProjectMetadata
              ? [{ label: 'Fetching Issue Types...', value: '' }]
              : setIssueTypeOptions(projectMetadata?.issuetypes)
          }
          inputProps={{
            placeholder: fetchingProjectMetadata ? 'Fetching Issue Types...' : 'Select Issue Type'
          }}
          onChange={value => {
            setIssueTypeValue(value as JiraProjectSelectOption)
          }}
        />
      </div>

      {!selectedIssueTypeKey ? (
        <div className={css.fieldsSelectorPlaceholder}>
          <Text>{getString('pipeline.jiraCreateStep.fieldsSelectorPlaceholder')}</Text>
        </div>
      ) : (
        <JiraFieldSelector
          fields={fieldList}
          selectedFields={[]}
          onCancel={props.onCancel}
          addSelectedFields={props.addSelectedFields}
        />
      )}
    </div>
  )
}

const ProvideFieldList = (props: JiraDynamicFieldsSelectorContentInterface) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<JiraCreateFieldType[]>
      onSubmit={values => {
        props.provideFieldList(values)
      }}
      initialValues={[]}
    >
      {(formik: FormikProps<{ fieldList: JiraCreateFieldType[] }>) => {
        return (
          <div>
            <FieldArray
              name="fieldList"
              render={({ push, remove }) => {
                return (
                  <div>
                    <div className={css.headerRow}>
                      <String className={css.label} stringID="pipeline.jiraCreateStep.issueKey" />
                      <String className={css.label} stringID="valueLabel" />
                    </div>
                    {formik.values.fieldList?.map((_unused: JiraCreateFieldType, i: number) => (
                      <div className={css.headerRow} key={i}>
                        <FormInput.Text
                          name={`fieldList[${i}].name`}
                          placeholder={getString('pipeline.jiraCreateStep.issueKey')}
                        />
                        <FormInput.MultiTextInput
                          name={`fieldList[${i}].value`}
                          label=""
                          placeholder={getString('valueLabel')}
                          multiTextInputProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            expressions
                          }}
                        />
                        <Button minimal icon="trash" data-testid={`remove-fieldList-${i}`} onClick={() => remove(i)} />
                      </div>
                    ))}
                    <Button
                      icon="plus"
                      minimal
                      intent="primary"
                      data-testid="add-fieldList"
                      onClick={() => push({ name: '', value: '' })}
                    >
                      Field
                    </Button>
                  </div>
                )
              }}
            />
            <div className={css.buttons}>
              <Button intent="primary" type="submit" onClick={() => props.provideFieldList(formik.values.fieldList)}>
                {getString('add')}
              </Button>
              <Button className={css.secondButton} onClick={props.onCancel}>
                {getString('cancel')}
              </Button>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

const Content = (props: JiraDynamicFieldsSelectorContentInterface) => {
  const { getString } = useStrings()
  const { connectorRef } = props
  const [type, setType] = useState<JiraCreateFormFieldSelector>(
    connectorRef ? JiraCreateFormFieldSelector.FIXED : JiraCreateFormFieldSelector.EXPRESSION
  )
  return (
    <div>
      <div className={css.radioGroup}>
        <Radio
          onClick={() => setType(JiraCreateFormFieldSelector.FIXED)}
          checked={type === JiraCreateFormFieldSelector.FIXED}
          disabled={!connectorRef}
        >
          {getString('pipeline.jiraCreateStep.selectFromFieldList')}{' '}
        </Radio>
        <Radio
          onClick={() => setType(JiraCreateFormFieldSelector.EXPRESSION)}
          checked={type === JiraCreateFormFieldSelector.EXPRESSION}
        >
          {getString('pipeline.jiraCreateStep.provideFieldList')}{' '}
        </Radio>
      </div>
      {type === JiraCreateFormFieldSelector.FIXED ? <SelectFieldList {...props} /> : <ProvideFieldList {...props} />}
    </div>
  )
}

export const JiraDynamicFieldsSelector = (props: JiraDynamicFieldsSelectorInterface) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
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
    <Content
      {...props}
      refetchProjectMetadata={refetchProjectMetadata}
      projectMetaResponse={projectMetaResponse}
      projectMetadataFetchError={projectMetadataFetchError}
      fetchingProjectMetadata={fetchingProjectMetadata}
    />
  )
}

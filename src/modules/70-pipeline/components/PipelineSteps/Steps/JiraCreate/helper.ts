/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import type { JiraFieldNG } from 'services/cd-ng'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import type { JiraCreateData, JiraCreateFieldType, JiraFieldNGWithValue } from './types'

export const resetForm = (formik: FormikProps<JiraCreateData>, parent: string) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.projectKey', '')
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.fields', [])
  }
  if (parent === 'projectKey') {
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.fields', [])
  }
  if (parent === 'issueType') {
    formik.setFieldValue('spec.fields', [])
  }
}

export const omitSummaryDescription = (fields: JiraCreateFieldType[]): JiraCreateFieldType[] =>
  fields?.filter(field => field.name !== 'Summary' && field.name !== 'Description')

export const processFieldsForSubmit = (values: JiraCreateData): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = [
    {
      name: 'Summary',
      value: values.spec.summary || ''
    },
    {
      name: 'Description',
      value: values.spec.description || ''
    }
  ]
  values.spec.selectedFields?.forEach((field: JiraFieldNGWithValue) => {
    const name = field.name
    const value =
      typeof field.value === 'string' || typeof field.value === 'number'
        ? field.value
        : Array.isArray(field.value)
        ? (field.value as MultiSelectOption[]).map(opt => opt.value.toString()).join(',')
        : typeof field.value === 'object'
        ? (field.value as SelectOption).value?.toString()
        : ''
    // The return value should be comma separated string or a number
    toReturn.push({ name, value })
  })
  values.spec.fields?.forEach((kvField: JiraCreateFieldType) => {
    const alreadyExists = toReturn.find(ff => ff.name === kvField.name)
    if (!alreadyExists) {
      toReturn.push(kvField)
    }
  })
  return toReturn
}

export const getInitialValueForSelectedField = (
  savedFields: JiraCreateFieldType[],
  field: JiraFieldNG
): string | number | SelectOption | MultiSelectOption[] => {
  const savedValue = savedFields.find(sf => sf.name === field.name)?.value
  if (typeof savedValue === 'number') {
    return savedValue as number
  } else if (typeof savedValue === 'string') {
    if (field.allowedValues && field.schema.type === 'option' && field.schema.array) {
      // multiselect
      // return multiselectoption[]
      const splitValues = (savedValue as string).split(',')
      return splitValues.map(splitvalue => ({ label: splitvalue, value: splitvalue })) as MultiSelectOption[]
    } else if (field.allowedValues && field.schema.type === 'option') {
      // singleselect
      // return selectoption
      return { label: savedValue, value: savedValue } as SelectOption
    }
    return savedValue as string
  }
  return ''
}

export const processFormData = (values: JiraCreateData): JiraCreateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef:
        getMultiTypeFromValue(values.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.connectorRef as SelectOption)?.value?.toString()
          : values.spec.connectorRef,
      projectKey:
        getMultiTypeFromValue(values.spec.projectKey as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.projectKey as JiraProjectSelectOption)?.key?.toString()
          : values.spec.projectKey,
      issueType:
        getMultiTypeFromValue(values.spec.issueType as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.issueType as JiraProjectSelectOption)?.key?.toString()
          : values.spec.issueType,
      fields: processFieldsForSubmit(values)
    }
  }
}

export const getKVFields = (values: JiraCreateData): JiraCreateFieldType[] => {
  return omitSummaryDescription(processFieldsForSubmit(values))
}

export const processInitialValues = (values: JiraCreateData): JiraCreateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef: values.spec.connectorRef,
      projectKey:
        values.spec.projectKey && getMultiTypeFromValue(values.spec.projectKey) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.projectKey.toString(),
              value: values.spec.projectKey.toString(),
              key: values.spec.projectKey.toString()
            }
          : values.spec.projectKey,
      issueType:
        values.spec.issueType && getMultiTypeFromValue(values.spec.issueType) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.issueType.toString(),
              value: values.spec.issueType.toString(),
              key: values.spec.issueType.toString()
            }
          : values.spec.issueType,
      summary: values.spec.fields?.find(field => field.name === 'Summary')?.value.toString(),
      description: values.spec.fields?.find(field => field.name === 'Description')?.value.toString(),
      fields: omitSummaryDescription(values.spec.fields)
    }
  }
}

export const getSelectedFieldsToBeAddedInForm = (
  newFields: JiraFieldNG[],
  existingFields: JiraFieldNGWithValue[] = [],
  existingKVFields: JiraCreateFieldType[]
): JiraFieldNGWithValue[] => {
  const toReturn: JiraFieldNGWithValue[] = [...existingFields]
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentKVField = existingKVFields.find(kv => kv.name === field.name)
    if (!alreadyPresent && !alreadyPresentKVField) {
      toReturn.push({ ...field, value: !isEmpty(field.allowedValues) ? [] : '' })
    }
  })
  return toReturn
}

export const getKVFieldsToBeAddedInForm = (
  newFields: JiraCreateFieldType[],
  existingFields: JiraCreateFieldType[] = [],
  existingSelectedFields: JiraFieldNGWithValue[] = []
): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = [...existingFields]
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentSelectedField = existingSelectedFields.find(existing => existing.name === field.name)
    if (!alreadyPresent && !alreadyPresentSelectedField) {
      toReturn.push(field)
    }
  })
  return toReturn
}

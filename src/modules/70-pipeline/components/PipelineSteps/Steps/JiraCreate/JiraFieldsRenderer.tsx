/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { Button, FormInput, Layout } from '@wings-software/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { JiraFieldNG } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setAllowedValuesOptions } from '../JiraApproval/helper'
import type { JiraFieldNGWithValue } from './types'
import css from './JiraCreate.module.scss'

export interface JiraFieldsRendererProps {
  selectedFields?: JiraFieldNGWithValue[]
  readonly?: boolean
  onDelete: (index: number, selectedField: JiraFieldNG) => void
}

interface MappedComponentInterface {
  selectedField: JiraFieldNG
  props: JiraFieldsRendererProps
  expressions: string[]
  index: number
}

const GetMappedFieldComponent = ({ selectedField, props, expressions, index }: MappedComponentInterface) => {
  const showTextField = useCallback(() => {
    if (
      selectedField.schema.type === 'string' ||
      selectedField.schema.type === 'date' ||
      selectedField.schema.type === 'datetime' ||
      selectedField.schema.type === 'number'
    ) {
      return true
    }
    if (isEmpty(selectedField.allowedValues) && selectedField.schema.type === 'option' && selectedField.schema.array) {
      return true
    }
    return false
  }, [selectedField])

  const showMultiSelectField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema.type === 'option' && selectedField.schema.array
  }, [selectedField])

  const showMultiTypeField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema.type === 'option'
  }, [selectedField])

  if (showTextField()) {
    return (
      <FormInput.MultiTextInput
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        className={css.md}
        multiTextInputProps={{
          expressions
        }}
      />
    )
  } else if (showMultiSelectField()) {
    return (
      <FormInput.MultiSelectTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        className={cx(css.multiSelect, css.md)}
        multiSelectTypeInputProps={{
          expressions
        }}
      />
    )
  } else if (showMultiTypeField()) {
    return (
      <FormInput.MultiTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={cx(css.multiSelect, css.md)}
        multiTypeInputProps={{ expressions }}
      />
    )
  }
  return null
}

export const JiraFieldsRenderer = (props: JiraFieldsRendererProps) => {
  const { expressions } = useVariablesExpression()
  const { readonly, selectedFields, onDelete } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: JiraFieldNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
          <GetMappedFieldComponent
            selectedField={selectedField}
            props={props}
            expressions={expressions}
            index={index}
          />
          <Button
            minimal
            icon="trash"
            disabled={isApprovalStepFieldDisabled(readonly)}
            data-testid={`remove-selectedField-${index}`}
            onClick={() => onDelete(index, selectedField)}
          />
        </Layout.Horizontal>
      ))}
    </>
  ) : null
}

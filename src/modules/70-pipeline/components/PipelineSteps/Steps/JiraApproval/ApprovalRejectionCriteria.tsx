import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { FieldArray } from 'formik'
import { isEmpty } from 'lodash-es'
import { Button, FormInput, Layout, MultiTypeInputType, Radio, SelectOption, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { JiraFieldNG } from 'services/cd-ng'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  ApprovalRejectionCriteriaCondition,
  ApprovalRejectionCriteriaProps,
  ApprovalRejectionCriteriaType,
  ConditionsInterface
} from './types'
import { filterOutMultiOperators, operatorValues, removeDuplicateFieldKeys, setAllowedValuesOptions } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ApprovalRejectionCriteria.module.scss'

const renderValueSelects = (
  condition: ApprovalRejectionCriteriaCondition,
  allowedValuesForFields: Record<string, SelectOption[]>,
  mode: string,
  i: number
) => {
  if (condition.operator === 'in' || condition.operator === 'not in') {
    return (
      <FormInput.MultiSelectTypeInput
        label=""
        className={css.multiSelect}
        name={`spec.${mode}.spec.conditions[${i}].value`}
        selectItems={allowedValuesForFields[condition.key]}
        placeholder="Value(s)"
        multiSelectTypeInputProps={{
          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
        }}
      />
    )
  }
  return (
    <FormInput.MultiTypeInput
      label=""
      name={`spec.${mode}.spec.conditions[${i}].value`}
      selectItems={allowedValuesForFields[condition.key]}
      placeholder="Value(s)"
      multiTypeInputProps={{
        allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
      }}
    />
  )
}

export const Conditions = ({
  values,
  onChange,
  mode,
  isFetchingFields,
  allowedValuesForFields,
  allowedFieldKeys,
  formikErrors,
  fieldList
}: ConditionsInterface) => {
  const { getString } = useStrings()
  if (isFetchingFields) {
    return <div className={css.fetching}>{getString('pipeline.jiraApprovalStep.fetchingFields')}</div>
  }
  return (
    <div>
      <Layout.Horizontal className={css.alignConditions} spacing="xxxlarge">
        <span>{getString('pipeline.jiraApprovalStep.match')}</span>
        <Radio
          onClick={() => onChange({ ...values, spec: { ...values.spec, matchAnyCondition: false } })}
          checked={!values.spec.matchAnyCondition}
        >
          {getString('pipeline.jiraApprovalStep.allConditions')}
        </Radio>
        <Radio
          onClick={() => onChange({ ...values, spec: { ...values.spec, matchAnyCondition: true } })}
          checked={values.spec.matchAnyCondition}
        >
          {getString('pipeline.jiraApprovalStep.anyCondition')}
        </Radio>
      </Layout.Horizontal>

      <div className={stepCss.formGroup}>
        <FieldArray
          name={`spec.${mode}.spec.conditions`}
          render={({ push, remove }) => {
            return (
              <div>
                <div className={css.headers}>
                  <span>{getString('pipeline.jiraApprovalStep.jiraField')}</span>
                  <span>{getString('pipeline-triggers.conditionsPanel.operator')}</span>
                  <span>{getString('valueLabel')}</span>
                </div>
                {values.spec.conditions?.map((condition: ApprovalRejectionCriteriaCondition, i: number) => (
                  <div className={css.headers} key={i}>
                    {isEmpty(fieldList) ? (
                      <FormInput.Text name={`spec.${mode}.spec.conditions[${i}].key`} placeholder="Key" />
                    ) : (
                      <FormInput.Select
                        items={allowedFieldKeys}
                        name={`spec.${mode}.spec.conditions[${i}].key`}
                        placeholder="Key"
                      />
                    )}
                    <FormInput.Select
                      items={allowedValuesForFields[condition.key] ? operatorValues : filterOutMultiOperators()}
                      name={`spec.${mode}.spec.conditions[${i}].operator`}
                      placeholder="Operator"
                    />
                    {allowedValuesForFields[condition.key] ? (
                      renderValueSelects(condition, allowedValuesForFields, mode, i)
                    ) : (
                      <FormInput.MultiTextInput
                        label=""
                        name={`spec.${mode}.spec.conditions[${i}].value`}
                        placeholder="Value(s)"
                        multiTextInputProps={{
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                      />
                    )}

                    <Button minimal icon="trash" data-testid={`remove-conditions-${i}`} onClick={() => remove(i)} />
                  </div>
                ))}
                <Button
                  icon="plus"
                  minimal
                  intent="primary"
                  data-testid="add-conditions"
                  onClick={() => push({ key: 'Status', operator: 'equals', value: [] })}
                >
                  {getString('add')}
                </Button>
              </div>
            )
          }}
        />
      </div>

      {formikErrors?.conditions ? (
        <Text className={css.formikError} intent="danger">
          {formikErrors.conditions}
        </Text>
      ) : null}
    </div>
  )
}

export const Jexl = (props: ApprovalRejectionCriteriaProps) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <FormMultiTypeTextAreaField
      name={`spec.${props.mode}.spec.expression`}
      label={
        props.mode === 'approvelCriteria'
          ? getString('pipeline.jiraApprovalStep.jexlExpressionLabelApproval')
          : getString('pipeline.jiraApprovalStep.jexlExpressionLabelRejection')
      }
      className={css.jexlExpression}
      placeholder={getString('pipeline.jiraApprovalStep.jexlExpressionPlaceholder')}
      multiTypeTextArea={{
        expressions
      }}
    />
  )
}

export const ApprovalRejectionCriteria: React.FC<ApprovalRejectionCriteriaProps> = props => {
  const { values, onChange } = props
  const [type, setType] = useState<ApprovalRejectionCriteriaType>(values.type)
  const [allowedFieldKeys, setAllowedFieldKeys] = useState<SelectOption[]>([])
  const [allowedValuesForFields, setAllowedValuesForFields] = useState<Record<string, SelectOption[]>>({})
  const { getString } = useStrings()

  useEffect(() => {
    const allowedFieldKeysToSet: SelectOption[] = [{ label: 'Status', value: 'Status' }]
    const allowedValuesForFieldsToSet: Record<string, SelectOption[]> = {}
    if (!isEmpty(props.statusList)) {
      // If the status list is non empty, initialise it so that status is by default a dropdown
      allowedValuesForFieldsToSet['Status'] = props.statusList.map(status => ({ label: status.name, value: status.id }))
    }
    props.fieldList.forEach((field: JiraFieldNG) => {
      const fieldName = field.name || field.key
      if (!field.schema.array) {
        if (field.schema.type === 'string') {
          allowedFieldKeysToSet.push({
            label: fieldName,
            value: fieldName
          })
        } else if (field.allowedValues && field.schema.type === 'option' && fieldName) {
          allowedFieldKeysToSet.push({
            label: fieldName,
            value: fieldName
          })
          allowedValuesForFieldsToSet[fieldName] = setAllowedValuesOptions(field.allowedValues)
        }
      }
    })
    setAllowedFieldKeys(removeDuplicateFieldKeys(allowedFieldKeysToSet))
    setAllowedValuesForFields(allowedValuesForFieldsToSet)
  }, [props.fieldList, props.statusList])

  useEffect(() => {
    onChange({
      ...values,
      type
    })
  }, [type])

  return (
    <div>
      <div className={css.tabs}>
        <div
          className={cx(css.tab, type === ApprovalRejectionCriteriaType.KeyValues ? css.selectedTab : '')}
          onClick={() => setType(ApprovalRejectionCriteriaType.KeyValues)}
        >
          {getString('conditions')}
        </div>
        <div
          className={cx(css.tab, type === ApprovalRejectionCriteriaType.Jexl ? css.selectedTab : '')}
          onClick={() => setType(ApprovalRejectionCriteriaType.Jexl)}
        >
          {getString('common.jexlExpression')}
        </div>
      </div>

      {type === ApprovalRejectionCriteriaType.KeyValues ? (
        <Conditions {...props} allowedFieldKeys={allowedFieldKeys} allowedValuesForFields={allowedValuesForFields} />
      ) : (
        <Jexl {...props} />
      )}
    </div>
  )
}

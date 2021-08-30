import React from 'react'
import { FormInput, Text, Icon, Heading, Color, Button, ButtonVariation } from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { mockOperators, inNotInArr, inNotInPlaceholder } from '../utils/TriggersWizardPageUtils'
import css from './WebhookConditionsPanel.module.scss'

export interface AddConditionInterface {
  key: string
  operator: string
  value: string
}

interface AddConditionsSectionPropsInterface {
  title: string
  fieldId: string
  attributePlaceholder?: string
  formikValues?: { [key: string]: any }
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  errors: { [key: string]: string }
}

interface AddConditionRowInterface {
  fieldId: string
  index: number
  attributePlaceholder: string
  operatorPlaceholder: string
  valuePlaceholder: string
  getString: UseStringsReturn['getString']
}

// Has first class support with predefined attribute
export const ConditionRow = ({
  formikProps,
  name,
  label
}: {
  formikProps: any
  name: string
  label: string
}): JSX.Element => {
  const { getString } = useStrings()
  const operatorKey = `${name}Operator`
  const valueKey = `${name}Value`
  const operatorError = formikProps?.errors?.[operatorKey]
  const valueError = formikProps?.errors?.[valueKey]
  const operatorValue = formikProps?.values?.[operatorKey]
  return (
    <div className={css.conditionsRow}>
      <div>
        <Text style={{ fontSize: 16 }}>{label}</Text>
      </div>
      <FormInput.Select
        style={{ alignSelf: valueError ? 'baseline' : 'center' }}
        items={mockOperators}
        name={operatorKey}
        label={getString('pipeline.triggers.conditionsPanel.operator')}
        placeholder={getString('pipeline.operatorPlaceholder')}
        onChange={() => {
          formikProps.setFieldTouched(valueKey, true)
        }}
      />
      <FormInput.Text
        name={valueKey}
        style={{ alignSelf: operatorError ? 'baseline' : 'center' }}
        label={getString('pipeline.triggers.conditionsPanel.matchesValue')}
        onChange={() => {
          formikProps.setFieldTouched(operatorKey, true)
        }}
        placeholder={
          inNotInArr.includes(operatorValue)
            ? inNotInPlaceholder
            : getString('pipeline.triggers.conditionsPanel.matchesValuePlaceholder')
        }
      />
    </div>
  )
}

const AddConditionRow: React.FC<AddConditionRowInterface> = ({
  fieldId,
  index,
  getString,
  attributePlaceholder,
  operatorPlaceholder,
  valuePlaceholder
}) => (
  <div className={cx(css.conditionsRow, css.addConditionsRow)}>
    <FormInput.Text placeholder={attributePlaceholder} name={`${fieldId}.${[index]}.key`} label="Attribute" />
    <FormInput.Select
      placeholder={operatorPlaceholder}
      items={mockOperators}
      name={`${fieldId}.${[index]}.operator`}
      label="Operator"
    />
    <FormInput.Text
      name={`${fieldId}.${[index]}.value`}
      label={getString('pipeline.triggers.conditionsPanel.matchesValue')}
      placeholder={valuePlaceholder}
    />
  </div>
)

export const AddConditionsSection: React.FC<AddConditionsSectionPropsInterface> = ({
  title,
  fieldId,
  attributePlaceholder = '',
  formikValues,
  setFieldValue,
  errors
}) => {
  const { getString } = useStrings()
  const addConditions = formikValues?.[fieldId] || []
  return (
    <section data-name={fieldId}>
      <Heading level={2} font={{ weight: 'bold' }}>
        {title}
      </Heading>
      <FieldArray
        name={fieldId}
        render={() => (
          <div>
            {addConditions?.map((_addCondition: AddConditionInterface, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <AddConditionRow
                  index={index}
                  getString={getString}
                  fieldId={fieldId}
                  attributePlaceholder={attributePlaceholder}
                  operatorPlaceholder={getString('pipeline.operatorPlaceholder')}
                  valuePlaceholder={
                    inNotInArr.includes(formikValues?.[fieldId]?.[index]?.operator)
                      ? inNotInPlaceholder
                      : getString('pipeline.triggers.conditionsPanel.matchesValuePlaceholder')
                  }
                />
                <Icon
                  style={{
                    position: 'absolute',
                    left: '775px',
                    cursor: 'pointer'
                  }}
                  data-name="main-delete"
                  size={14}
                  color={Color.GREY_500}
                  name="main-trash"
                  onClick={() => {
                    const newAddConditions = [...addConditions]
                    newAddConditions.splice(index, 1)
                    setFieldValue(fieldId, newAddConditions)
                  }}
                />
              </div>
            ))}
            {(addConditions?.length && errors[fieldId] && (
              <Text color={Color.RED_500} style={{ marginBottom: 'var(--spacing-medium)' }}>
                {errors[fieldId]}
              </Text>
            )) ||
              null}
          </div>
        )}
      />
      <Button
        variation={ButtonVariation.LINK}
        data-name="plusAdd"
        style={{ padding: 0 }}
        onClick={() => {
          const emptyRow = { key: '', operator: '', value: '' }
          if (!addConditions) setFieldValue(fieldId, [emptyRow])
          else setFieldValue(fieldId, [...addConditions, emptyRow])
        }}
        text={getString('plusAdd')}
      />
    </section>
  )
}

export default AddConditionsSection

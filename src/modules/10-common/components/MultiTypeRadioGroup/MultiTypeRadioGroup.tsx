import React from 'react'
import { FormGroup, IFormGroupProps, Intent, IOptionProps, IRadioGroupProps, RadioGroup } from '@blueprintjs/core'
import { ExpressionAndRuntimeType, ExpressionAndRuntimeTypeProps, MultiTypeInputValue } from '@wings-software/uicore'
import { connect } from 'formik'
import cx from 'classnames'
import { get } from 'lodash-es'

import { errorCheck } from '@common/utils/formikHelpers'
import css from './MultiTypeRadioGroup.module.scss'

export interface MultiTypeRadioGroupProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  radioGroupProps?: Omit<IRadioGroupProps, 'name' | 'selectedValue' | 'onChange' | 'options'>
  name: string
  options: IOptionProps[]
}

export const MultiTypeRadioGroup: React.FC<MultiTypeRadioGroupProps> = ({
  radioGroupProps,
  value = '',
  options,
  ...rest
}) => {
  const { className = '', ...restProps } = radioGroupProps || {}
  const fixedTypeComponent = React.useCallback(
    props => {
      const { onChange } = props
      return (
        <RadioGroup
          className={cx(css.input, className)}
          {...restProps}
          options={options}
          selectedValue={value as string}
          name={name}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            onChange?.(event.currentTarget.value, MultiTypeInputValue.STRING)
          }}
        />
      )
    },
    [value, options, name]
  )
  return <ExpressionAndRuntimeType value={value} {...rest} fixedTypeComponent={fixedTypeComponent} />
}

export interface FormMultiTypeRadioGroupProps extends Omit<IFormGroupProps, 'label'> {
  label: string
  name: string
  options: IOptionProps[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any // TODO: Remove this but not sure why FormikContext<any> was not working
  multiTypeRadioGroup?: Omit<MultiTypeRadioGroupProps, 'onChange'>
  onChange?: MultiTypeRadioGroupProps['onChange']
}

export const FormMultiTypeRadioGroup: React.FC<FormMultiTypeRadioGroupProps> = props => {
  const { label, multiTypeRadioGroup, options, formik, name, onChange, ...restProps } = props
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik?.errors, name) : null,
    disabled,
    ...rest
  } = restProps

  const { radioGroupProps, ...restMultiProps } = multiTypeRadioGroup || {}
  const value: string = get(formik?.values, name, '')
  return (
    <FormGroup {...rest} labelFor={name} helperText={helperText} intent={intent} disabled={disabled} label={label}>
      <MultiTypeRadioGroup
        radioGroupProps={radioGroupProps}
        name={name}
        value={value}
        options={options}
        {...restMultiProps}
        onChange={(val, valueType) => {
          formik?.setFieldValue(name, val)
          onChange?.(val, valueType)
        }}
      />
    </FormGroup>
  )
}
export const FormMultiTypeRadioGroupField = connect(FormMultiTypeRadioGroup)

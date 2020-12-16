import React from 'react'
import { FormGroup, IFormGroupProps, Intent, InputGroup, IInputGroupProps, HTMLInputProps } from '@blueprintjs/core'
import { connect, FormikContext } from 'formik'
import {
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  MultiTypeInputValue,
  FixedTypeComponentProps,
  DurationInputHelpers,
  parseStringToTime,
  timeToDisplayText,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uikit'
import { get } from 'lodash-es'
import * as Yup from 'yup'

import { errorCheck } from '@common/utils/formikHelpers'

function isValidTimeString(value: string): boolean {
  return !DurationInputHelpers.UNIT_LESS_REGEX.test(value) && DurationInputHelpers.VALID_SYNTAX_REGEX.test(value)
}

function MultiTypeDurationFixedTypeComponent(
  props: FixedTypeComponentProps & MultiTypeDurationProps['inputGroupProps']
): React.ReactElement {
  const { onChange, value, ...inputGroupProps } = props

  return (
    <InputGroup
      fill
      {...inputGroupProps}
      value={value as string}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.value, MultiTypeInputValue.STRING)
      }}
    />
  )
}

export interface MultiTypeDurationProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  inputGroupProps?: Omit<IInputGroupProps & HTMLInputProps, 'onChange' | 'value'>
}

export function MultiTypeDuration(props: MultiTypeDurationProps): React.ReactElement {
  const { inputGroupProps, ...rest } = props

  return (
    <ExpressionAndRuntimeType
      {...rest}
      fixedTypeComponentProps={inputGroupProps}
      fixedTypeComponent={MultiTypeDurationFixedTypeComponent}
    />
  )
}

export interface FormMultiTypeDurationProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  label: string
  name: string
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: FormikContext<any>
  multiTypeDurationProps?: Omit<MultiTypeDurationProps, 'onChange' | 'value'>
  onChange?: MultiTypeDurationProps['onChange']
}

export function FormMultiTypeDuration(props: FormMultiTypeDurationProps): React.ReactElement {
  const { label, multiTypeDurationProps, formik, name, onChange, ...restProps } = props
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik?.errors, name) : null,
    disabled,
    ...rest
  } = restProps

  const value: string = get(formik?.values, name, '')
  const handleChange: MultiTypeDurationProps['onChange'] = React.useCallback(
    (val, valueType) => {
      const correctVal =
        getMultiTypeFromValue(val) === MultiTypeInputType.FIXED && typeof val === 'string'
          ? val.replace(DurationInputHelpers.TEXT_LIMIT_REGEX, '')
          : val
      formik?.setFieldValue(name, correctVal)
      formik?.setFieldTouched(name, true)
      onChange?.(correctVal, valueType)
    },
    [formik?.setFieldTouched, formik?.setFieldValue, name, onChange]
  )

  const handleBlur = (): void => {
    formik?.setFieldTouched(name, true)

    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || !isValidTimeString(value)) {
      return
    }

    const time = parseStringToTime(value)
    const strVal = timeToDisplayText(time)

    formik?.setFieldValue(name, strVal)
  }

  const customProps: MultiTypeDurationProps = {
    ...multiTypeDurationProps,
    name,
    inputGroupProps: {
      placeholder: 'Enter w/d/h/m/s/ms',
      ...multiTypeDurationProps?.inputGroupProps,
      name,
      onBlur: handleBlur
    }
  }

  return (
    <FormGroup {...rest} labelFor={name} helperText={helperText} intent={intent} disabled={disabled} label={label}>
      <MultiTypeDuration {...customProps} value={value} onChange={handleChange} />
    </FormGroup>
  )
}

export const FormMultiTypeDurationField = connect(FormMultiTypeDuration)

export interface GetDurationValidationSchemaProps {
  minimum?: string
  maximum?: string
  inValidSyntaxMessage?: string
  minimunErrorMessage?: string
  maximumErrorMessage?: string
}

export function getDurationValidationSchema(
  props: GetDurationValidationSchemaProps = {}
): Yup.StringSchema<string | undefined> {
  const { minimum, maximum } = props

  if (typeof minimum === 'string' && !isValidTimeString(minimum)) {
    throw new Error(`Invalid format "${minimum}" provided for minimum value`)
  }

  if (typeof maximum === 'string' && !isValidTimeString(maximum)) {
    throw new Error(`Invalid format "${maximum}" provided for maximum value`)
  }

  return Yup.string().test({
    test(value: string): boolean | Yup.ValidationError {
      const { inValidSyntaxMessage, maximumErrorMessage, minimunErrorMessage } = props

      if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
        return true
      }

      if (typeof value === 'string' && !isValidTimeString(value)) {
        return this.createError({ message: inValidSyntaxMessage || 'Invalid syntax provided' })
      }

      if (typeof minimum === 'string') {
        const minTime = parseStringToTime(minimum)
        const time = parseStringToTime(value)

        if (time < minTime) {
          return this.createError({
            message: minimunErrorMessage || `Value must be greater than or equal to "${timeToDisplayText(minTime)}"`
          })
        }
      }

      if (typeof maximum === 'string') {
        const maxTime = parseStringToTime(maximum)
        const time = parseStringToTime(value)

        if (time > maxTime) {
          return this.createError({
            message: maximumErrorMessage || `Value must be less than or equal to "${timeToDisplayText(maxTime)}"`
          })
        }
      }

      return true
    }
  })
}

import React from 'react'
import { connect, FormikContext } from 'formik'
import cx from 'classnames'
import {
  Button,
  FixedTypeComponentProps,
  ExpressionAndRuntimeType,
  ButtonProps,
  ExpressionAndRuntimeTypeProps,
  MultiTypeInputType,
  Text
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'

import useCreateOrSelectSecretModal from '@secrets/modals/CreateOrSelectSecretModal/useCreateOrSelectSecretModal'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { errorCheck } from '@common/utils/formikHelpers'

import css from './MultiTypeSecretInput.module.scss'

export interface MultiTypeSecretInputFixedTypeComponentProps
  extends FixedTypeComponentProps,
    Omit<ButtonProps, 'onChange'> {}

export function MultiTypeSecretInputFixedTypeComponent(
  props: MultiTypeSecretInputFixedTypeComponentProps
): React.ReactElement {
  const { value, onChange, disabled, ...rest } = props
  const { getString } = useStrings()
  return (
    <Button
      {...rest}
      withoutBoxShadow
      className={css.value}
      icon="key-main"
      iconProps={{ size: 24, height: 12 }}
      data-testid={'create-or-select-secret'}
      disabled={disabled}
    >
      <Text lineClamp={1}>{value || getString('createOrSelectSecret')}</Text>
    </Button>
  )
}

export interface MultiTypeSecretInputProps extends IFormGroupProps {
  name: string
  label?: string
  expressions?: string[]
  allowableTypes?: MultiTypeInputType[]
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  isMultiType?: boolean
  small?: boolean
}

export interface ConnectedMultiTypeSecretInputProps extends MultiTypeSecretInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContext<any>
}

export function MultiTypeSecretInput(props: ConnectedMultiTypeSecretInputProps): React.ReactElement {
  const {
    formik,
    label,
    name,
    allowableTypes,
    expressions = [],
    onSuccess,
    type,
    secretsListMockData,
    isMultiType = true,
    ...restProps
  } = props
  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type,
      onSuccess: secret => {
        formik.setFieldValue(name, secret.referenceString)
        /* istanbul ignore next */
        onSuccess?.(secret)
      },
      secretsListMockData
    },
    [name, onSuccess]
  )
  const value = get(formik.values, name)
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik.errors, name) : null,
    disabled,
    small,
    ...rest
  } = restProps

  const handleChange: ExpressionAndRuntimeTypeProps['onChange'] = val => {
    formik.setFieldValue(name, val)
  }

  return (
    <FormGroup
      {...rest}
      className={cx({ [css.smallForm]: small })}
      labelFor={name}
      label={label}
      intent={intent}
      helperText={helperText}
    >
      {isMultiType ? (
        <ExpressionAndRuntimeType
          name={name}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          expressions={expressions}
          allowableTypes={allowableTypes}
          style={{ flexGrow: 1 }}
          fixedTypeComponentProps={{ onClick: openCreateOrSelectSecretModal }}
          fixedTypeComponent={MultiTypeSecretInputFixedTypeComponent}
          defaultValueToReset=""
        />
      ) : (
        <MultiTypeSecretInputFixedTypeComponent
          value={value}
          onChange={handleChange}
          onClick={openCreateOrSelectSecretModal}
          disabled={disabled}
          data-testid={name}
        />
      )}
    </FormGroup>
  )
}

export default connect<MultiTypeSecretInputProps>(MultiTypeSecretInput)

import React from 'react'
import { debounce } from 'lodash-es'
import { Formik, FieldArray } from 'formik'
import { v4 as uuid } from 'uuid'
import { Button, FormInput, MultiTypeInputType, getMultiTypeFromValue } from '@wings-software/uicore'
import cx from 'classnames'

import { String, useStrings } from 'framework/exports'
import { TextInputWithCopyBtn } from '@common/components/TextInputWithCopyBtn/TextInputWithCopyBtn'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { CustomVariableEditableProps, CustomVariablesData } from './CustomVariableEditable'
import { VariableType, getVaribaleTypeOptions, labelStringMap } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'

export function CustomVariablesEditableStage(props: CustomVariableEditableProps): React.ReactElement {
  const { initialValues, onUpdate, domId, className, yamlProperties } = props
  const uids = React.useRef<string[]>([])
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce((data: CustomVariablesData) => onUpdate?.(data), 500),
    [onUpdate]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={data => onUpdate?.(data)} validate={debouncedUpdate}>
      {({ values, setFieldValue }) => (
        <FieldArray name="variables">
          {({ remove, push, replace }) => {
            function handleAdd(): void {
              uids.current.push(uuid())
              push({ name: '', type: 'String', value: '', new: true })
            }

            function handleEdit(index: number): void {
              replace(index, { ...values.variables?.[index], new: true })
            }

            function handleRemove(index: number): void {
              uids.current.splice(index, 1)
              remove(index)
            }

            return (
              <div className={cx(css.customVariablesStage, className)} id={domId}>
                {values.variables?.length > 0 ? (
                  <div className={cx(css.tableRow, css.headerRow)}>
                    <String stringID="name" />
                    <String stringID="typeLabel" />
                    <String stringID="valueLabel" />
                    <div />
                  </div>
                ) : null}
                {values.variables.map?.((variable, index) => {
                  // generated uuid if they are not present
                  if (!uids.current[index]) {
                    uids.current[index] = uuid()
                  }
                  const key = uids.current[index]
                  const yamlData = yamlProperties?.[index] || {}

                  return (
                    <div key={key} className={css.tableRow}>
                      <TextInputWithCopyBtn
                        name={`variables[${index}].name`}
                        label=""
                        localName={yamlData.localName}
                        fullName={yamlData.fqn}
                      />
                      {variable.new ? (
                        <FormInput.Select
                          name={`variables[${index}].type`}
                          items={getVaribaleTypeOptions(getString)}
                          label=""
                          placeholder={getString('typeLabel')}
                        />
                      ) : (
                        <String className={css.valueString} stringID={labelStringMap[variable.type as VariableType]} />
                      )}
                      <div className={css.valueColumn}>
                        {variable.type === VariableType.Secret ? (
                          <MultiTypeSecretInput name={`variables[${index}].value`} label="" />
                        ) : (
                          <FormInput.MultiTextInput
                            className="variableInput"
                            name={`variables[${index}].value`}
                            label=""
                            multiTextInputProps={{
                              defaultValueToReset: '',
                              expressions,
                              textProps: {
                                disabled: !initialValues.canAddVariable,
                                type: variable.type === VariableType.Number ? 'number' : 'text'
                              }
                            }}
                          />
                        )}
                        {getMultiTypeFromValue(variable.value) === MultiTypeInputType.RUNTIME ? (
                          <ConfigureOptions
                            value={variable.value as string}
                            defaultValue={variable.default}
                            type={variable.type || /* istanbul ignore next */ 'String'}
                            variableName={variable.name || /* istanbul ignore next */ ''}
                            onChange={(value, defaultValue) => {
                              setFieldValue(`variables[${index}].value`, value)
                              setFieldValue(`variables[${index}].default`, defaultValue)
                            }}
                          />
                        ) : null}
                      </div>
                      <div className={css.actionButtons}>
                        {initialValues.canAddVariable ? (
                          <React.Fragment>
                            {!variable.new ? (
                              <Button
                                icon="edit"
                                tooltip={<String className={css.tooltip} stringID="common.editVariableType" />}
                                data-testid={`edit-variable-${index}`}
                                onClick={() => handleEdit(index)}
                                minimal
                              />
                            ) : null}
                            <Button
                              icon="trash"
                              data-testid={`delete-variable-${index}`}
                              tooltip={<String className={css.tooltip} stringID="common.removeThisVariable" />}
                              onClick={() => handleRemove(index)}
                              minimal
                            />
                          </React.Fragment>
                        ) : /* istanbul ignore next */ null}
                      </div>
                    </div>
                  )
                })}
                {values.canAddVariable ? (
                  <Button minimal intent="primary" icon="plus" onClick={handleAdd}>
                    <String stringID="common.addVariable" />
                  </Button>
                ) : /* istanbul ignore next */ null}
              </div>
            )
          }}
        </FieldArray>
      )}
    </Formik>
  )
}

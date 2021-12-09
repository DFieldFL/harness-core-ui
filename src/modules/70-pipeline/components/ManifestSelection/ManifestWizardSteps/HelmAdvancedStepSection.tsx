import React from 'react'
import {
  Layout,
  Button,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  ButtonVariation
} from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { FieldArray } from 'formik'

import { String, useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { CommandFlags, HelmWithGITDataType, HelmWithHTTPDataType } from '../ManifestInterface'

import helmcss from './HelmWithGIT/HelmWithGIT.module.scss'
import css from './ManifestWizardSteps.module.scss'
interface HelmAdvancedStepProps {
  commandFlagOptions: Array<{ label: string; value: string }>
  expressions: string[]
  formik: {
    setFieldValue: (a: string, b: string) => void
    values: HelmWithGITDataType | HelmWithHTTPDataType
  }
  isReadonly?: boolean
}

const HelmAdvancedStepSection: React.FC<HelmAdvancedStepProps> = ({
  formik,
  commandFlagOptions,
  expressions,
  isReadonly
}) => {
  const { getString } = useStrings()
  const defaultValueToReset = [{ commandType: '', flag: '', id: uuid('', nameSpace()) }]

  const commandFlagLabel = (): React.ReactElement => {
    return (
      <Layout.Horizontal flex spacing="small">
        <String tagName="div" stringID="pipeline.manifestType.helmCommandFlagLabel" />
      </Layout.Horizontal>
    )
  }

  return (
    <div className={helmcss.helmAdvancedSteps}>
      <Layout.Horizontal width={'90%'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <FormMultiTypeCheckboxField
          name="skipResourceVersioning"
          label={getString('skipResourceVersion')}
          className={cx(helmcss.checkbox, helmcss.halfWidth)}
          multiTypeTextbox={{ expressions }}
        />
        {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={(formik.values?.skipResourceVersioning || '') as unknown as string}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
            style={{ alignSelf: 'center', marginTop: 11 }}
            className={cx(css.addmarginTop)}
            isReadonly={isReadonly}
          />
        )}
      </Layout.Horizontal>

      <div className={helmcss.commandFlags}>
        <MultiTypeFieldSelector
          defaultValueToReset={defaultValueToReset}
          name={'commandFlags'}
          label={commandFlagLabel()}
          disableTypeSelection
        >
          <FieldArray
            name="commandFlags"
            render={({ push, remove }) => (
              <Layout.Vertical>
                {formik.values?.commandFlags?.map((commandFlag: CommandFlags, index: number) => (
                  <Layout.Horizontal key={commandFlag.id} spacing="xxlarge" margin={{ top: 'small' }}>
                    <div className={helmcss.halfWidth}>
                      <FormInput.MultiTypeInput
                        name={`commandFlags[${index}].commandType`}
                        label={index === 0 ? getString('pipeline.manifestType.helmCommandType') : ''}
                        selectItems={commandFlagOptions}
                        placeholder={getString('pipeline.manifestType.helmCommandTypePlaceholder')}
                        multiTypeInputProps={{
                          width: 300,
                          onChange: value => {
                            if (isEmpty(value)) {
                              formik.setFieldValue(`commandFlags[${index}].commandType`, '')
                              formik.setFieldValue(`commandFlags[${index}].flag`, '')
                            }
                          },
                          expressions,
                          selectProps: {
                            addClearBtn: true,
                            items: commandFlagOptions
                          }
                        }}
                      />
                    </div>
                    <div className={helmcss.halfWidth}>
                      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <FormInput.MultiTextInput
                          label={index === 0 ? getString('flag') : ''}
                          name={`commandFlags[${index}].flag`}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [
                              MultiTypeInputType.FIXED,
                              MultiTypeInputType.EXPRESSION,
                              MultiTypeInputType.RUNTIME
                            ]
                          }}
                        />
                        {getMultiTypeFromValue(formik.values?.commandFlags?.[index]?.flag) ===
                          MultiTypeInputType.RUNTIME && (
                          <div
                            className={cx({
                              [css.addmarginTop]: index === 0
                            })}
                          >
                            <ConfigureOptions
                              style={{ marginBottom: 3 }}
                              value={(formik.values?.commandFlags?.[index].flag || '') as unknown as string}
                              type="String"
                              variableName={`CommandFlag-${index}`}
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value =>
                                formik.setFieldValue(`formik.values?.commandFlags?.[${index}].flag`, value)
                              }
                              isReadonly={isReadonly}
                            />
                          </div>
                        )}
                        {index !== 0 && (
                          <Button
                            minimal
                            icon="main-trash"
                            className={cx({
                              [helmcss.delBtn]: index === 0
                            })}
                            onClick={() => remove(index)}
                          />
                        )}
                      </Layout.Horizontal>
                    </div>
                  </Layout.Horizontal>
                ))}
                {!!(formik.values?.commandFlags?.length < commandFlagOptions.length) && (
                  <span>
                    <Button
                      minimal
                      text={getString('add')}
                      variation={ButtonVariation.PRIMARY}
                      onClick={() => push({ commandType: '', flag: '', id: uuid('', nameSpace()) })}
                    />
                  </span>
                )}
              </Layout.Vertical>
            )}
          />
        </MultiTypeFieldSelector>
      </div>
    </div>
  )
}

export default HelmAdvancedStepSection

import React from 'react'
import { Layout, Button, FormInput, MultiTypeInputType, Color, Icon } from '@wings-software/uicore'
import { Tooltip } from '@blueprintjs/core'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { FieldArray } from 'formik'

import { String, useStrings } from 'framework/exports'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { CommandFlags, HelmWithGITDataType } from '../ManifestInterface'
import helmcss from './HelmWithGIT/HelmWithGIT.module.scss'

interface HelmAdvancedStepProps {
  commandFlagOptions: Array<{ label: string; value: string }>
  expressions: string[]
  formik: {
    setFieldValue: (a: string, b: string) => void
    values: HelmWithGITDataType
  }
}

const HelmAdvancedStepSection: React.FC<HelmAdvancedStepProps> = ({ formik, commandFlagOptions, expressions }) => {
  const { getString } = useStrings()
  const defaultValueToReset = [{ commandType: '', flag: '', id: uuid('', nameSpace()) }]

  const commandFlagLabel = (): React.ReactElement => {
    return (
      <Layout.Horizontal flex spacing="small">
        <String tagName="div" stringID="manifestType.helmCommandFlagLabel" />
        <Tooltip
          position="top"
          content={<div className={helmcss.tooltipContent}>{getString('manifestType.helmCommandFlags')}</div>}
          className={helmcss.tooltip}
        >
          <Icon name="info-sign" color={Color.BLUE_450} size={16} />
        </Tooltip>
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
        <Tooltip
          position="top"
          content={<div className={helmcss.tooltipContent}>{getString('manifestType.helmSkipResourceVersion')} </div>}
          className={helmcss.tooltip}
        >
          <Icon name="info-sign" color={Color.BLUE_450} size={16} />
        </Tooltip>
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
                  <Layout.Horizontal key={commandFlag.id} spacing="xxlarge" flex margin={{ top: 'small' }}>
                    <div className={helmcss.halfWidth}>
                      <FormInput.Select
                        name={`commandFlags[${index}].commandType`}
                        label={index === 0 ? getString('manifestType.helmCommandType') : ''}
                        items={commandFlagOptions}
                        placeholder={getString('manifestType.helmCommandType')}
                      />
                    </div>
                    <div className={helmcss.halfWidth}>
                      <Layout.Horizontal>
                        <FormInput.MultiTextInput
                          label={index === 0 ? getString('flag') : ''}
                          name={`commandFlags[${index}].flag`}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                        />

                        {formik.values?.commandFlags?.length > 1 && (
                          <Button minimal icon="minus" onClick={() => remove(index)} style={{ alignSelf: 'center' }} />
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
                      intent="primary"
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

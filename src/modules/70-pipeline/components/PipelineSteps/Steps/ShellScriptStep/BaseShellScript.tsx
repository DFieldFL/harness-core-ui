import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { FormMultiTypeTextAreaField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ShellScriptFormData } from './shellScriptTypes'
import stepCss from '../Steps.module.scss'

export const shellScriptType: SelectOption[] = [
  { label: 'Bash', value: 'Bash' },
  { label: 'PowerShell', value: 'PowerShell' }
]

export default function BaseShellScript(props: { formik: FormikProps<ShellScriptFormData> }): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue }
  } = props

  const { getString } = useStrings()
  return (
    <>
      <div className={stepCss.formGroup}>
        <FormInput.InputWithIdentifier inputLabel={getString('pipelineSteps.stepNameLabel')} />
      </div>
      <div className={stepCss.formGroup}>
        <FormInput.Select
          items={shellScriptType}
          name="spec.shell"
          label={getString('scriptType')}
          placeholder={getString('scriptType')}
          disabled
        />
      </div>
      <div className={stepCss.formGroup}>
        <FormMultiTypeTextAreaField
          name="spec.source.spec.script"
          label={getString('script')}
          multiTypeTextArea={{ enableConfigureOptions: false, textAreaProps: { className: stepCss.code } }}
        />
        {getMultiTypeFromValue(formValues.spec.source?.spec?.script) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.source?.spec?.script as string}
            type="String"
            variableName="spec.source.spec.script"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.source.spec.script', value)}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{ enableConfigureOptions: false }}
          className={stepCss.duration}
        />
        {getMultiTypeFromValue(formValues?.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec?.timeout as string}
            type="String"
            variableName="step.timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              setFieldValue('timeout', value)
            }}
          />
        )}
      </div>
    </>
  )
}

import React, { FormEvent, useState } from 'react'
import { get, isEmpty } from 'lodash-es'
import { FormInput, MultiTypeInputType } from '@wings-software/uicore'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

export interface CICodebaseInputSetFormProps {
  path: string
  readonly?: boolean
  formik?: FormikContext<any>
}

const inputNames = {
  branch: 'branch',
  tag: 'tag',
  PR: 'number'
}

const defaultValues = {
  branch: '<+trigger.branch>',
  tag: '<+trigger.tag>',
  PR: '<+trigger.prNumber>'
}

const CICodebaseInputSetFormInternal = ({ path, readonly, formik }: CICodebaseInputSetFormProps): JSX.Element => {
  const [isInputTouched, setIsInputTouched] = useState(false)

  const [savedValues, setSavedValues] = useState({
    branch: '',
    tag: '',
    PR: ''
  })

  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const formattedPath = isEmpty(path) ? '' : `${path}.`

  const type = get(formik?.values, `${formattedPath}properties.ci.codebase.build.type`, '') as 'branch' | 'tag' | 'PR'

  const radioGroupItems = [
    {
      label: getString('gitBranch'),
      value: 'branch',
      disabled: readonly
    },
    {
      label: getString('gitTag'),
      value: 'tag',
      disabled: readonly
    },
    {
      label: getString('pipeline.gitPullRequest'),
      value: 'PR',
      disabled: readonly
    }
  ]

  const inputLabels = {
    branch: getString('gitBranch'),
    tag: getString('gitTag'),
    PR: getString('pipeline.gitPullRequestNumber')
  }

  const handleTypeChange = (e: FormEvent<HTMLInputElement>): void => {
    const newType = (e.target as HTMLFormElement).value as 'branch' | 'tag' | 'PR'

    setSavedValues(previousSavedValues => ({
      ...previousSavedValues,
      [type]: get(formik?.values, `${formattedPath}properties.ci.codebase.build.spec.${inputNames[type]}`, '')
    }))

    if (!isInputTouched) {
      formik?.setFieldValue(`${formattedPath}properties.ci.codebase.build.spec.${inputNames[type]}`, undefined)
      formik?.setFieldValue(
        `${formattedPath}properties.ci.codebase.build.spec.${inputNames[newType]}`,
        defaultValues[newType]
      )
    } else {
      formik?.setFieldValue(
        `${formattedPath}properties.ci.codebase.build.spec.${inputNames[newType]}`,
        savedValues[newType] || ''
      )

      formik?.setFieldValue(`${formattedPath}properties.ci.codebase.build.spec.${inputNames[type]}`, undefined)
    }
  }

  const handleInputChange = (): void => setIsInputTouched(true)

  return (
    <>
      <FormInput.RadioGroup
        name={`${formattedPath}properties.ci.codebase.build.type`}
        items={radioGroupItems}
        radioGroup={{ inline: true }}
        onChange={handleTypeChange}
        style={{ marginBottom: 0 }}
      />
      {type === 'branch' && (
        <FormInput.MultiTextInput
          label={inputLabels[type]}
          name={`${formattedPath}properties.ci.codebase.build.spec.branch`}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 0 }}
          disabled={readonly}
          onChange={handleInputChange}
        />
      )}
      {type === 'tag' && (
        <FormInput.MultiTextInput
          label={inputLabels[type]}
          name={`${formattedPath}properties.ci.codebase.build.spec.tag`}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 0 }}
          disabled={readonly}
          onChange={handleInputChange}
        />
      )}
      {type === 'PR' && (
        <FormInput.MultiTextInput
          label={inputLabels[type]}
          name={`${formattedPath}properties.ci.codebase.build.spec.number`}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 0 }}
          disabled={readonly}
          onChange={handleInputChange}
        />
      )}
    </>
  )
}

export const CICodebaseInputSetForm = connect(CICodebaseInputSetFormInternal)

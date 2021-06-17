import React from 'react'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { DelegateSelectors } from '@common/components'
import { useStrings } from 'framework/strings'

export interface DelegatePanelProps {
  formikProps: FormikProps<{
    delegateSelectors?: string[]
  }>
  isReadonly: boolean
}

export default function DelegateSelectorPanel(props: DelegatePanelProps): React.ReactElement {
  const { getString } = useStrings()

  const { setFieldValue, values } = props.formikProps
  const { projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
  }>()
  return (
    <DelegateSelectors
      fill
      allowNewTag={false}
      placeholder={getString('connectors.delegate.delegateselectionPlaceholder')}
      onChange={data => {
        setFieldValue('delegateSelectors', data)
      }}
      readonly={props.isReadonly}
      projectIdentifier={projectIdentifier}
      orgIdentifier={orgIdentifier}
      selectedItems={values.delegateSelectors}
    />
  )
}

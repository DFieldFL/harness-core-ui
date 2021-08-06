import React from 'react'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Formik, Layout, ThumbnailSelect, Label, Button, Container } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { useStrings } from 'framework/strings'
import { useCreateEnvironmentV2, useUpsertEnvironmentV2, EnvironmentResponseDTO } from 'services/cd-ng'
import type { NewEditEnvironmentModalProps } from './NewEditEnvironmentModal.types'

export const NewEditEnvironmentModal: React.FC<NewEditEnvironmentModalProps> = ({
  isEdit,
  data,
  isEnvironment,
  formik,
  onCreateOrUpdate,
  closeModal
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { loading: createLoading, mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { loading: updateLoading, mutate: updateEnvironment } = useUpsertEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { showSuccess, showError, clear } = useToaster()

  const onSubmit = React.useCallback(
    async (values: Required<EnvironmentResponseDTO>) => {
      try {
        if (isEdit && !isEnvironment) {
          const response = await updateEnvironment({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('common.environmentUpdated'))
            formik?.setFieldValue('environmentRef', values.identifier)
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createEnvironment({ ...values, orgIdentifier, projectIdentifier })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('common.environmentCreated'))
            formik?.setFieldValue('environmentRef', values.identifier)
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(e?.data?.message || e?.message || getString('commonError'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isEnvironment]
  )
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const typeList: { label: string; value: string }[] = [
    {
      label: getString('production'),
      value: 'Production'
    },
    {
      label: getString('nonProduction'),
      value: 'PreProduction'
    }
  ]

  if (createLoading || updateLoading) {
    return <PageSpinner />
  }
  return (
    <Layout.Vertical>
      <Formik<Required<EnvironmentResponseDTO>>
        initialValues={data as Required<EnvironmentResponseDTO>}
        enableReinitialize={false}
        formName="deployEnv"
        onSubmit={values => {
          onSubmit(values)
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Environment' }) }),
          type: Yup.string().required(getString?.('fieldRequired', { field: 'Type' })),
          identifier: IdentifierSchema()
        })}
      >
        {formikProps => (
          <Layout.Vertical
            onKeyDown={e => {
              if (e.key === 'Enter') {
                formikProps.handleSubmit()
              }
            }}
          >
            <NameIdDescriptionTags
              formikProps={formikProps}
              identifierProps={{
                inputLabel: getString('name'),
                inputGroupProps: {
                  inputGroup: {
                    inputRef: ref => (inputRef.current = ref)
                  }
                },
                isIdentifierEditable: !isEdit
              }}
            />
            <Layout.Vertical spacing={'small'} style={{ marginBottom: 'var(--spacing-medium)' }}>
              <Label style={{ fontSize: 13, fontWeight: 'normal' }}>{getString('envType')}</Label>
              <ThumbnailSelect name={'type'} items={typeList} />
            </Layout.Vertical>
            <Container padding={{ top: 'xlarge' }}>
              <Button
                data-id="environment-save"
                onClick={() => formikProps.submitForm()}
                intent="primary"
                text={getString('save')}
              />
              &nbsp; &nbsp;
              <Button text={getString('cancel')} onClick={closeModal} />
            </Container>
          </Layout.Vertical>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

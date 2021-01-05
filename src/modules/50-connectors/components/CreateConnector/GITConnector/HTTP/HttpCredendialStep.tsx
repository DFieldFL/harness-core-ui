import React, { useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  SelectOption,
  Icon,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  FormikForm as Form,
  SelectV2
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/exports'
import { buildGITPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useCreateConnector, useUpdateConnector, ConnectorConfigDTO, ConnectorRequestBody } from 'services/cd-ng'
import { AuthTypes, getLabelForAuthType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import i18n from './HttpCredentialStep.i18n'
import css from './HttpCredentialStep.module.scss'

interface HttpCredentialStepProps {
  name: string
  setFormData: (formData: ConnectorConfigDTO) => void
  formData?: ConnectorConfigDTO
  projectIdentifier: string
  orgIdentifier: string
  nextStep?: () => void
  previousStep?: (data?: ConnectorConfigDTO) => void
  accountId: string
  hideLightModal: () => void
  isEditMode: boolean
  onSuccess: () => void
}

const HttpCredentialStep: React.FC<HttpCredentialStepProps> = props => {
  const { accountId } = useParams()
  const [authType, setAuthType] = useState({
    label: 'Username and Password',
    value: AuthTypes.USER_PASSWORD
  } as SelectOption)

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { showSuccess } = useToaster()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })
  const [loadConnector, setLoadConnector] = useState(false)

  const handleCreate = async (data: ConnectorRequestBody): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      await createConnector(data)
      setLoadConnector(false)
      props.onSuccess?.()
      showSuccess(`Connector '${props.formData?.name}' created successfully`)
      props.nextStep?.()
    } catch (e) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const handleUpdate = async (data: ConnectorRequestBody): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      await updateConnector(data)
      setLoadConnector(false)
      showSuccess(`Connector '${props.formData?.name}' updated successfully`)
      props.nextStep?.()
    } catch (error) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(error?.message)
    }
  }

  return (
    <div className={css.credStep}>
      <Text
        font="medium"
        margin={{ top: 'var(--spacing-small)', left: 'var(--spacing-small)' }}
        color="var(--grey-800)"
      >
        {i18n.Credentials}
      </Text>
      <Formik
        initialValues={{
          authType: authType.value || props.formData?.authType,
          username: props.formData?.username || '',
          branchName: props.formData?.branchName || '',
          password: props.formData?.password,
          ...props.formData
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string().trim().required(i18n.validation.username),
          password: Yup.string().when('authType', {
            is: AuthTypes.USER_PASSWORD,
            then: Yup.string().trim().required(i18n.validation.password)
          })
        })}
        onSubmit={formData => {
          const connectorData = {
            ...formData,
            ...props.formData,
            authType: authType?.value,
            projectIdentifier: props.projectIdentifier,
            orgIdentifier: props.orgIdentifier
          }
          const data = buildGITPayload(connectorData)

          if (props.isEditMode) {
            handleUpdate(data)
          } else {
            handleCreate(data)
          }
          props.setFormData(connectorData)
        }}
      >
        {formikProps => (
          <div className={css.formWrapper}>
            <Form className={css.credForm}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Layout.Vertical style={{ minHeight: '440px' }}>
                <Layout.Horizontal className={css.credWrapper}>
                  <div className={css.label}>
                    <Icon name="lock" size={14} className={css.lockIcon} />
                    {i18n.Authentication}
                  </div>

                  <SelectV2
                    items={[
                      { label: getLabelForAuthType(AuthTypes.USER_PASSWORD), value: AuthTypes.USER_PASSWORD }
                      //ToDo: { label: 'Kerberos', value: 'Kerberos' }
                    ]}
                    value={authType}
                    filterable={false}
                    onChange={item => {
                      setAuthType(item)
                      formikProps.setFieldValue('authType', item.value)
                    }}
                    className={css.selectAuth}
                  >
                    <Button text={authType.label} rightIcon="chevron-down" minimal />
                  </SelectV2>
                </Layout.Horizontal>
                <FormInput.Text name="username" label={i18n.Username} />
                <SecretInput name={'password'} label={i18n.Password} />
                <FormInput.Text name="branchName" label={i18n.BranchName} className={css.branchName} />
              </Layout.Vertical>
              <Layout.Horizontal spacing="large" className={css.footer}>
                <Button
                  onClick={() => props.previousStep?.({ ...props.formData })}
                  text={i18n.BACK}
                  font={{ size: 'small' }}
                />
                <Button
                  type="submit"
                  className={css.saveBtn}
                  text={i18n.SAVE_CREDENTIALS_AND_CONTINUE}
                  disabled={loadConnector}
                />
              </Layout.Horizontal>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  )
}

export default HttpCredentialStep

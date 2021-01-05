import React, { useState } from 'react'
import { useParams } from 'react-router'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  FormikForm as Form,
  StepProps,
  Color
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { buildNexusPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useToaster } from '@common/exports'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO,
  Connector
} from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import i18n from '../CreateNexusConnector.i18n'

interface StepNexusAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface NexusAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
}

const nexusVersions = [
  { label: '2.x', value: '2.x' },
  { label: '3.x', value: '3.x' }
]

const StepNexusAuthentication: React.FC<StepProps<StepNexusAuthenticationProps> & NexusAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })
  const [loadConnector, setLoadConnector] = useState(false)

  const handleCreate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      await createConnector(data)
      setLoadConnector(false)
      props.onConnectorCreated?.()
      showSuccess(`Connector '${prevStepData?.name}' created successfully`)
      nextStep?.({ ...prevStepData, ...stepData } as StepNexusAuthenticationProps)
    } catch (e) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const handleUpdate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      await updateConnector(data)
      setLoadConnector(false)
      showSuccess(`Connector '${prevStepData?.name}' updated successfully`)
      nextStep?.({ ...prevStepData, ...stepData } as StepNexusAuthenticationProps)
    } catch (error) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(error.data?.message || error.message)
    }
  }

  return (
    <Layout.Vertical height={'inherit'}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {i18n.STEP_TWO.Heading}
      </Text>
      <Formik
        initialValues={{
          userName: '',
          password: undefined,
          nexusServerUrl: '',
          nexusVersion: '',
          ...prevStepData
        }}
        validationSchema={Yup.object().shape({
          nexusServerUrl: Yup.string().trim().required(i18n.STEP_TWO.validation.nexusServerURL),
          nexusVersion: Yup.string().trim().required(i18n.STEP_TWO.validation.nexusVersion)
        })}
        onSubmit={stepData => {
          const connectorData = {
            ...prevStepData,
            ...stepData,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }
          const data = buildNexusPayload(connectorData)

          if (prevStepData?.isEditMode) {
            handleUpdate(data as Connector, stepData)
          } else {
            handleCreate(data as Connector, stepData)
          }
        }}
      >
        {() => (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />

            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} width={'64%'} style={{ minHeight: '440px' }}>
              <FormInput.Text name="nexusServerUrl" label={i18n.STEP_TWO.NexusServerURL} />
              <FormInput.Select name="nexusVersion" label={i18n.STEP_TWO.NexusVersion} items={nexusVersions} />
              <FormInput.Text name="userName" label={i18n.STEP_TWO.Username} />
              <SecretInput name={'password'} label={i18n.STEP_TWO.Password} />
            </Layout.Vertical>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                onClick={() => props.previousStep?.({ ...prevStepData } as StepNexusAuthenticationProps)}
                text={i18n.STEP_TWO.BACK}
              />
              <Button
                type="submit"
                text={i18n.STEP_TWO.SAVE_CREDENTIALS_AND_CONTINUE}
                font="small"
                disabled={loadConnector}
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepNexusAuthentication

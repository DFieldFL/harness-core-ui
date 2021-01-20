import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  ModalErrorHandler,
  FormikForm as Form,
  StepProps,
  ModalErrorHandlerBinding,
  Container,
  CardSelect,
  Color,
  Icon
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import {
  buildGcpPayload,
  DelegateTypes,
  DelegateCardInterface,
  SecretReferenceInterface,
  setupGCPFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useToaster } from '@common/exports'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import { useCreateConnector, useUpdateConnector } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/exports'
import css from '../CreateGcrConnector.module.scss'

interface GcpAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo: ConnectorInfoDTO | void
}

interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
}

interface GCPFormInterface {
  delegateType: string
  password: SecretReferenceInterface | void
}
const GcpAuthentication: React.FC<StepProps<StepConfigureProps> & GcpAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })
  const [loadConnector, setLoadConnector] = useState(false)
  const { getString } = useStrings()

  const defaultInitialFormData: GCPFormInterface = {
    delegateType: DelegateTypes.DELEGATE_OUT_CLUSTER,
    password: undefined
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const DelegateCards: DelegateCardInterface[] = [
    {
      type: DelegateTypes.DELEGATE_OUT_CLUSTER,
      info: getString('connectors.GCP.delegateOutClusterInfo')
    },
    {
      type: DelegateTypes.DELEGATE_IN_CLUSTER,
      info: getString('connectors.GCP.delegateInClusterInfo'),
      disabled: true
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupGCPFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as GCPFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleCreate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await createConnector(data)
      showSuccess(getString('connectors.successfullCreate', { name: data.connector?.name }))
      setLoadConnector(false)
      nextStep?.({ ...prevStepData, ...stepData })
      props.onConnectorCreated?.(response.data)
      props.setIsEditMode(true)
    } catch (e) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const handleUpdate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await updateConnector(data)
      showSuccess(getString('connectors.successfullUpdate', { name: data.connector?.name }))
      setLoadConnector(false)
      nextStep?.({ ...prevStepData, ...stepData })
      props.onConnectorCreated?.(response.data)
    } catch (error) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(error.data?.message || error.message)
    }
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.secondStep}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('connectors.GCP.stepTwoName')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        validationSchema={Yup.object().shape({
          password: Yup.object().required(getString('validation.encryptedKey'))
        })}
        onSubmit={formData => {
          const connectorData = {
            ...prevStepData,
            ...formData,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }
          const data = buildGcpPayload(connectorData)

          if (props.isEditMode) {
            handleUpdate(data, formData)
          } else {
            handleCreate(data, formData)
          }
        }}
      >
        {formikProps => (
          <Form>
            <Container className={css.clusterWrapper}>
              <ModalErrorHandler bind={setModalErrorHandler} style={{ marginBottom: 'var(--spacing-medium)' }} />
              <CardSelect
                onChange={(item: DelegateCardInterface) => {
                  DelegateTypes.DELEGATE_OUT_CLUSTER !== formikProps.values.delegateType &&
                    formikProps?.setFieldValue('delegateType', item.type)
                }}
                data={DelegateCards}
                className={css.cardRow}
                renderItem={(item: DelegateCardInterface) => {
                  return (
                    <Container
                      className={cx(css.card, { [css.selectedCard]: item.type === formikProps.values.delegateType })}
                    >
                      <Text inline className={css.textInfo}>
                        {item.info}
                      </Text>
                      {item.type === formikProps.values.delegateType ? (
                        <Icon margin="small" name="deployment-success-new" size={16} />
                      ) : null}
                    </Container>
                  )
                }}
                selected={DelegateCards[DelegateCards.findIndex(card => card.type === formikProps.values.delegateType)]}
              />

              {DelegateTypes.DELEGATE_OUT_CLUSTER === formikProps.values.delegateType ? (
                <SecretInput name={'password'} label={getString('encryptedKeyLabel')} type={'SecretFile'} />
              ) : null}
            </Container>
            <Button
              type="submit"
              intent="primary"
              text={getString('saveAndContinue')}
              rightIcon="chevron-right"
              disabled={DelegateTypes.DELEGATE_OUT_CLUSTER !== formikProps.values.delegateType || loadConnector}
            />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default GcpAuthentication

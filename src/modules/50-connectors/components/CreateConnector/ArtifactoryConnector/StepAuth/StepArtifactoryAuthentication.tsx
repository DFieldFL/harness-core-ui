import React, { useState, useEffect } from 'react'
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
  Color,
  Container,
  SelectOption
} from '@wings-software/uicore'
import * as Yup from 'yup'
import {
  buildArtifactoryPayload,
  SecretReferenceInterface,
  setupArtifactoryFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
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
import { useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import css from '../../NexusConnector/StepAuth/StepNexusConnector.module.scss'

interface StepArtifactoryAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface ArtifactoryAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface ArtifactoryFormInterface {
  artifactoryServerUrl: string
  authType: string
  username: string
  password: SecretReferenceInterface | void
}

const defaultInitialFormData: ArtifactoryFormInterface = {
  artifactoryServerUrl: '',
  authType: AuthTypes.USER_PASSWORD,
  username: '',
  password: undefined
}

const StepArtifactoryAuthentication: React.FC<
  StepProps<StepArtifactoryAuthenticationProps> & ArtifactoryAuthenticationProps
> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = props
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })
  const [loadConnector, setLoadConnector] = useState(false)
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)
  const { getString } = useStrings()

  const authOptions: SelectOption[] = [
    {
      label: getString('usernamePassword'),
      value: AuthTypes.USER_PASSWORD
    }
    // {
    //   label: getString('annonymous'),
    //   value: AuthTypes.ANNONYMOUS
    // }
  ]

  const handleCreate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await createConnector(data)
      setLoadConnector(false)
      props.setIsEditMode(true)
      props.onConnectorCreated?.(response.data)
      showSuccess(`Connector '${prevStepData?.name}' created successfully`)
      nextStep?.({ ...prevStepData, ...stepData } as StepArtifactoryAuthenticationProps)
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
      nextStep?.({ ...prevStepData, ...stepData } as StepArtifactoryAuthenticationProps)
      props?.onConnectorCreated?.(response.data)
    } catch (error) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(error.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupArtifactoryFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as ArtifactoryFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} margin="small">
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('connectors.artifactory.stepTwoName')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        validationSchema={Yup.object().shape({
          artifactoryServerUrl: Yup.string().trim().required(getString('validation.artifactoryServerURL')),
          username: Yup.string()
            .nullable()
            .when('authType', {
              is: authType => authType === AuthTypes.USER_PASSWORD,
              then: Yup.string().required(getString('validation.username'))
            }),
          password: Yup.object().when('authType', {
            is: authType => authType === AuthTypes.USER_PASSWORD,
            then: Yup.object().required(getString('validation.password')),
            otherwise: Yup.object().nullable()
          })
        })}
        onSubmit={stepData => {
          const connectorData = {
            ...prevStepData,
            ...stepData,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }
          const data = buildArtifactoryPayload(connectorData)

          if (props.isEditMode) {
            handleUpdate(data as Connector, stepData)
          } else {
            handleCreate(data as Connector, stepData)
          }
        }}
      >
        {formikProps => (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />

            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep}>
              <Container className={css.formRow}>
                <FormInput.Text
                  className={css.urlInput}
                  name="artifactoryServerUrl"
                  placeholder={getString('UrlLabel')}
                  label={getString('connectors.artifactory.artifactoryServerUrl')}
                />
              </Container>

              <Container className={css.authHeaderRow}>
                <Text className={css.authTitle} inline>
                  {getString('connectors.authTitle')}
                </Text>
                <FormInput.Select name="authType" items={authOptions} disabled={false} />
              </Container>
              {formikProps.values.authType === AuthTypes.USER_PASSWORD ? (
                <Container className={css.formWrapper}>
                  <FormInput.Text name="username" label={getString('username')} />
                  {/* <TextReference
                    name="username"
                    label={getString('username')}
                    type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
                  /> */}
                  <SecretInput name={'password'} label={getString('password')} />
                </Container>
              ) : null}
            </Layout.Vertical>
            <Button
              type="submit"
              intent="primary"
              text={getString('saveAndContinue')}
              rightIcon="chevron-right"
              disabled={loadConnector}
            />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepArtifactoryAuthentication

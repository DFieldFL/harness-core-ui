import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import {
  Layout,
  StepProps,
  Heading,
  Container,
  StepsProgress,
  Intent,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Button
} from '@wings-software/uicore'
import type { ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { useGetTestConnectionResult } from 'services/cd-ng'
import i18n from '../AWSCOConnector.i18n'
import css from './Steps.module.scss'

export enum Status {
  // WAIT = 'WAIT',
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

interface TestConnectionStepProps extends StepProps<ConnectorInfoDTO> {
  onSuccess: (data: ConnectorInfoDTO) => void
  onFailure: () => void
}

const TestConnectionStep: React.FC<StepProps<ConnectorConfigDTO> & TestConnectionStepProps> = props => {
  const { accountId } = useParams<{ accountId: string; orgIdentifier: string }>()
  const { prevStepData, onFailure } = props
  const [steps, setSteps] = useState<string[]>([])
  const [currentStep] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.ERROR)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const connectorDetails = prevStepData as ConnectorInfoDTO

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const { mutate: reloadTestConnection } = useGetTestConnectionResult({
    identifier: connectorDetails.identifier,
    queryParams: {
      accountIdentifier: accountId
      // orgIdentifier: orgIdentifier,
      // projectIdentifier: connectorDetails.projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const verifyOptimizationPermissions = async (): Promise<void> => {
    const newSteps = [...steps]
    newSteps.push(i18n.testConnection.crossARN.valid)
    setSteps(newSteps)

    try {
      setCurrentStatus(Status.PROCESS)
      const result = await reloadTestConnection()
      if (result.data?.status === 'SUCCESS') {
        setCurrentIntent(Intent.SUCCESS)
        setCurrentStatus(Status.DONE)
      } else {
        throw new Error('Could not verify connectivity')
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.errorSummary || e.message)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }
  useEffect(() => {
    verifyOptimizationPermissions()
  }, [])

  const handleSuccess = () => {
    props.onSuccess(connectorDetails)
  }
  return (
    <Layout.Vertical>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Container padding="medium">
        <Heading level={2} font={{ weight: 'bold' }}>
          {i18n.testConnection.title}
        </Heading>
      </Container>
      <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
      {currentIntent == Intent.SUCCESS && currentStatus === Status.DONE && (
        <Button intent="primary" text={i18n.testConnection.finish} onClick={handleSuccess} className={css.nextButton} />
      )}
      {currentStatus === Status.ERROR && (
        <Button
          intent="primary"
          text={i18n.crossAccountRole.submitText}
          onClick={() => onFailure()}
          className={css.nextButton}
        />
      )}
    </Layout.Vertical>
  )
}

export default TestConnectionStep

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { Layout, Heading, Container, StepsProgress, Intent, Button } from '@wings-software/uicore'

import css from './TestConnection.module.scss'

export enum Status {
  // WAIT = 'WAIT',
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

const steps: string[] = []

const TestConnection: React.FC<Record<string, unknown>> = (props: any) => {
  const [currentStep] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.DONE)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.SUCCESS)

  const handleSuccess = () => {
    setCurrentStatus(Status.DONE)
    props.onClose()
  }

  const launchArgoDashboard = () => {
    setCurrentIntent(Intent.SUCCESS)
    props.onClose()
  }

  return (
    <Layout.Vertical>
      <Container padding="medium">
        <Heading level={2} font={{ weight: 'bold' }}>
          {'Test Connection'}
        </Heading>
      </Container>
      <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />

      <Layout.Vertical spacing="large">
        <Layout.Horizontal className={css.layoutFooter} padding={{ top: 'small' }} spacing="medium">
          <Button text={'Finish'} onClick={handleSuccess} className={css.nextButton} />
          <Button
            intent="primary"
            text={'Launch Argo App Dashboard'}
            onClick={launchArgoDashboard}
            className={css.nextButton}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TestConnection

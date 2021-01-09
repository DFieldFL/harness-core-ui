import React from 'react'
import { StepWizard, Color } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useStrings } from 'framework/exports'
import { getConnectorIconByType, getConnectorTitleTextByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { ConnectorRequestBody, ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'
import GitDetailsStep from './GithubDetailsStep'
import StepGithubAuthentication from './StepAuth/StepGithubAuthentication'

interface CreateGithubConnectorProps {
  hideLightModal: () => void
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  mock?: ResponseBoolean
}
const CreateGithubConnector = (props: CreateGithubConnectorProps): JSX.Element => {
  const { getString } = useStrings()

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.GITHUB)}
      iconProps={{ size: 37, color: Color.BLACK }}
      title={getConnectorTitleTextByType(Connectors.GITHUB)}
    >
      <GitDetailsStep
        type={Connectors.GITHUB}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <StepGithubAuthentication
        name={getString('connectors.git.githubStepTwoName')}
        onConnectorCreated={props.onConnectorCreated}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        renderInModal={true}
        onSuccess={props.onConnectorCreated}
        isLastStep={true}
        type={Connectors.GITHUB}
        hideLightModal={props.hideLightModal}
      />
    </StepWizard>
  )
}

export default CreateGithubConnector

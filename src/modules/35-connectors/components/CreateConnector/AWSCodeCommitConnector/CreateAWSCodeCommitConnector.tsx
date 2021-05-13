import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER, CreateConnectorModalProps } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import AWSCCAuthStep from './AWSCCAuthStep'
import AWSCCDetailsStep from './AWSCCDetailsStep'

export default function CreateAWSCodeCommitConnector(props: CreateConnectorModalProps) {
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.AWS_CODECOMMIT)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.AWS_CODECOMMIT))}
    >
      <ConnectorDetailsStep
        type={Connectors.AWS_CODECOMMIT}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
      />
      <AWSCCDetailsStep
        name={getString('details')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo as ConnectorInfoDTO}
      />
      <AWSCCAuthStep
        name={getString('credentials')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo as ConnectorInfoDTO}
        onSuccess={props.onSuccess}
        setIsEditMode={props.setIsEditMode}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        isLastStep
        type={Connectors.AWS_CODECOMMIT}
        onClose={props.onClose}
      />
    </StepWizard>
  )
}

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/exports'
import StepNexusAuthentication from './StepAuth/StepNexusAuthentication'

const CreateNexusConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'connectorInfo',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])
  return (
    <>
      <StepWizard
        icon={getConnectorIconByType(Connectors.NEXUS)}
        iconProps={{ size: 40 }}
        title={getString(getConnectorTitleIdByType(Connectors.NEXUS))}
      >
        <ConnectorDetailsStep
          type={Connectors.NEXUS}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          mock={props.mock}
        />
        <StepNexusAuthentication name={getString('details')} {...commonProps} onConnectorCreated={props.onSuccess} />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          isStep
          isLastStep={true}
          type={Connectors.NEXUS}
          onClose={props.onClose}
          setIsEditMode={props.setIsEditMode}
        />
      </StepWizard>
    </>
  )
}

export default CreateNexusConnector

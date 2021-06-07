import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'

// This is an old implementation of the overview page of the Azure Connector creation process
// We will get rid of it once the new one is finalised.
// Contact me for any questions - akash.bhardwaj@harness.io
// import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
// import AzureBillingInfo from './AzureBillingInfo'
// import CreateServicePrincipal from './CreateServicePrincipal'
// Below is the new one:
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import Overview from './Steps/Overview/AzureConnectorOverview'
import Billing from './Steps/Billing/AzureConnectorBilling'
import ModalExtension from './ModalExtension'
import AzureConnectorBillingExtension from './Steps/Billing/AzureConnectorBillingExtension'
import ChooseRequirements from './Steps/CreateServicePrincipal/ChooseRequirements'
import CreateServicePrincipal from './Steps/CreateServicePrincipal/CreateServicePrincipal'
// import VerifyConnection from './Steps/VerifyConnection/VerifyConnection'
import css from './CreateCeAzureConnector.module.scss'

const CreateCeAzureConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  return (
    <ModalExtension renderExtension={AzureConnectorBillingExtension}>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CE_AZURE)}
        iconProps={{ size: 40 }}
        title={getString(getConnectorTitleIdByType(Connectors.CE_AZURE))}
        className={css.azureConnector}
      >
        <Overview
          type={Connectors.CE_AZURE}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
        />
        <Billing name={'Azure Billing Export'} />
        <ChooseRequirements name={'Choose Requirements'} />
        <CreateServicePrincipal name={'Create Service Principal'} />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.verifyConnection')}
          onClose={props.onClose}
          isStep
          isLastStep
          type={Connectors.CE_AZURE}
          connectorInfo={props.connectorInfo}
        />
      </StepWizard>
    </ModalExtension>
  )
}

export default CreateCeAzureConnector

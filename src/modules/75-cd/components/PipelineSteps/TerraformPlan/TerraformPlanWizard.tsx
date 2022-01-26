import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { StepWizard, Layout, Icon, Text, Color, Button, ButtonVariation } from '@wings-software/uicore'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { TerraformConfigStepOne, TerraformConfigStepTwo } from './TerraformConfigForm'
import css from '../Common/Terraform/Editview/TerraformVarfile.module.scss'

type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | ''
const WizardToConnectorMap: Record<ConnectorTypes | string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET
}

const TerraformPlanWizard = ({
  isEditMode,
  allowableTypes,
  setIsEditMode,
  onCloseOfRemoteWizard,
  readonly,
  formik,
  onSubmitCallBack
}: any) => {
  const [connectorView, setConnectorView] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<ConnectorTypes>('')
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const getTitle = () => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Icon name="remotefile" className={css.remoteIcon} size={50} />
      <Text color={Color.WHITE}>{getString('pipelineSteps.remoteFile')}</Text>
    </Layout.Vertical>
  )

  const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
    if (type === Connectors.GIT) {
      return buildGitPayload
    }
    if (type === Connectors.GITHUB) {
      return buildGithubPayload
    }
    if (type === Connectors.BITBUCKET) {
      return buildBitbucketPayload
    }
    if (type === Connectors.GITLAB) {
      return buildGitlabPayload
    }
    return () => ({})
  }

  const buildPayload = getBuildPayload(WizardToConnectorMap[selectedConnector])

  const getNewConnectorSteps = () => {
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={WizardToConnectorMap[selectedConnector]}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        <GitDetailsStep
          type={WizardToConnectorMap[selectedConnector]}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {WizardToConnectorMap[selectedConnector] === Connectors.GIT ? (
          <StepGitAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {WizardToConnectorMap[selectedConnector] === Connectors.GITHUB ? (
          <StepGithubAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {WizardToConnectorMap[selectedConnector] === Connectors.BITBUCKET ? (
          <StepBitbucketAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {WizardToConnectorMap[selectedConnector] === Connectors.GITLAB ? (
          <StepGitlabAuthentication
            name={getString('credentials')}
            identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildPayload}
          connectorInfo={undefined}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={false}
          type={WizardToConnectorMap[selectedConnector]}
        />
      </StepWizard>
    )
  }

  return (
    <>
      <div className={css.createTfWizard}>
        <StepWizard title={getTitle()} className={css.manifestWizard}>
          <TerraformConfigStepOne
            isEditMode={isEditMode}
            data={formik.values}
            isReadonly={readonly}
            allowableTypes={allowableTypes}
            setConnectorView={setConnectorView}
            setSelectedConnector={setSelectedConnector}
          />
          {connectorView ? getNewConnectorSteps() : null}
          <TerraformConfigStepTwo
            data={formik.values}
            isReadonly={readonly}
            allowableTypes={allowableTypes}
            onSubmitCallBack={onSubmitCallBack}
          />
        </StepWizard>
      </div>
      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={onCloseOfRemoteWizard}
        className={css.crossIcon}
      />
    </>
  )
}

export default TerraformPlanWizard

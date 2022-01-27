/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { RouteWithLayout } from '@common/router'
import { MinimalLayout } from '@common/layouts'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import {
  accountPathProps,
  projectPathProps,
  pipelinePathProps,
  triggerPathProps,
  connectorPathProps,
  secretPathProps,
  executionPathProps,
  inputSetFormPathProps,
  orgPathProps,
  rolePathProps,
  resourceGroupPathProps,
  delegatePathProps,
  delegateConfigProps,
  userPathProps,
  userGroupPathProps,
  serviceAccountProps,
  servicePathProps,
  templatePathProps
} from '@common/utils/routeUtils'
import type {
  PipelinePathProps,
  ExecutionPathProps,
  ProjectPathProps,
  PipelineType,
  ModulePathParams,
  Module
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import { String as LocaleString } from 'framework/strings'
import CDSideNav from '@cd/components/CDSideNav/CDSideNav'
import CDHomePage from '@cd/pages/home/CDHomePage'
import CDDashboardPage from '@cd/pages/dashboard/CDDashboardPage'
import DeploymentsList from '@pipeline/pages/deployments-list/DeploymentsList'
import CDPipelineStudio from '@cd/pages/pipeline-studio/CDPipelineStudio'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateListing from '@delegates/pages/delegates/DelegateListing'
import DelegateConfigurations from '@delegates/pages/delegates/DelegateConfigurations'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import DelegateTokens from '@delegates/components/DelegateTokens/DelegateTokens'
import { RedirectToSecretDetailHome } from '@secrets/RouteDestinations'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import InputSetList from '@pipeline/pages/inputSet-list/InputSetList'
import TriggersPage from '@pipeline/pages/triggers/TriggersPage'
import TriggersWizardPage from '@pipeline/pages/triggers/TriggersWizardPage'
import ExecutionLandingPage from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import ExecutionArtifactsView from '@pipeline/pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import ExecutionInputsView from '@pipeline/pages/execution/ExecutionInputsView/ExecutionInputsView'
import PipelineDetails from '@pipeline/pages/pipeline-details/PipelineDetails'
import TriggerDetails from '@pipeline/pages/trigger-details/TriggerDetails'
import CDPipelineDeploymentList from '@cd/pages/pipeline-deployment-list/CDPipelineDeploymentList'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import TriggersDetailPage from '@pipeline/pages/triggers/TriggersDetailPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import ServiceDetailPage from '@cd/pages/ServiceDetailPage/ServiceDetailPage'
import ServiceDetails from '@cd/components/ServiceDetails/ServiceDetails'
// eslint-disable-next-line no-restricted-imports
import ChildAppMounter from 'microfrontends/ChildAppMounter'

import './components/PipelineSteps'
import './components/PipelineStudio/DeployStage'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import Roles from '@rbac/pages/Roles/Roles'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import GitSyncPage from '@gitsync/pages/GitSyncPage'
import GitSyncRepoTab from '@gitsync/pages/repos/GitSyncRepoTab'
import GitSyncEntityTab from '@gitsync/pages/entities/GitSyncEntityTab'
import GitSyncErrors from '@gitsync/pages/errors/GitSyncErrors'
import BuildTests from '@pipeline/pages/execution/ExecutionTestView/BuildTests'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { StageType } from '@pipeline/utils/stageHelpers'
import RbacFactory from '@rbac/factories/RbacFactory'
import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory/index'
import ExecutionPolicyEvaluationsView from '@pipeline/pages/execution/ExecutionPolicyEvaluationsView/ExecutionPolicyEvaluationsView'
import ExecutionSecurityView from '@pipeline/pages/execution/ExecutionSecurityView/ExecutionSecurityView'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  isCDCommunity,
  LicenseRedirectProps,
  LICENSE_STATE_NAMES,
  useLicenseStore
} from 'framework/LicenseStore/LicenseStoreContext'
import { TemplateStudioWrapper } from '@templates-library/components/TemplateStudio/TemplateStudioWrapper'
import TemplatesPage from '@templates-library/pages/TemplatesPage/TemplatesPage'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import CDTrialHomePage from './pages/home/CDTrialHomePage'

import { CDExecutionCardSummary } from './components/CDExecutionCardSummary/CDExecutionCardSummary'
import { CDExecutionSummary } from './components/CDExecutionSummary/CDExecutionSummary'
import { CDStageDetails } from './components/CDStageDetails/CDStageDetails'
import { ManifestInputForm } from './components/ManifestInputForm/ManifestInputForm'

import { ArtifactInputForm } from './components/ArtifactInputForm/ArtifactInputForm'
import GitOpsServersPage from './pages/gitops/GitOpsServersHomePage'
import GitOpsModalContainer from './pages/gitops/NativeArgo/GitOpsProvidersList'

// eslint-disable-next-line import/no-unresolved
const GitOpsServersList = React.lazy(() => import('gitopsui/MicroFrontendApp'))

RbacFactory.registerResourceCategory(ResourceCategory.GITOPS, {
  icon: 'gitops-agent',
  label: 'cd.gitOps'
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_AGENT, {
  icon: 'gitops-agent',
  label: 'common.agent',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_AGENT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_AGENT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_AGENT]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_APP, {
  icon: 'gitops-agent',
  label: 'common.application',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_APPLICATION]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_APPLICATION]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_APPLICATION]: <LocaleString stringID="delete" />,
    [PermissionIdentifier.SYNC_GITOPS_APPLICATION]: <LocaleString stringID="common.sync" />,
    [PermissionIdentifier.OVERRIDE_GITOPS_APPLICATION]: <LocaleString stringID="override" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_CERT, {
  icon: 'gitops-agent',
  label: 'common.certificate',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_CERT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_CERT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_CERT]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_CLUSTER, {
  icon: 'gitops-agent',
  label: 'common.cluster',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_CLUSTER]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_CLUSTER]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_CLUSTER]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_GPGKEY, {
  icon: 'gitops-agent',
  label: 'common.gpgkey',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_GPGKEY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_GPGKEY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_GPGKEY]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_REPOSITORY, {
  icon: 'gitops-agent',
  label: 'repository',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_REPOSITORY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_REPOSITORY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_REPOSITORY]: <LocaleString stringID="delete" />
  }
})

executionFactory.registerCardInfo(StageType.DEPLOY, {
  icon: 'cd-main',
  component: CDExecutionCardSummary
})

executionFactory.registerSummary(StageType.DEPLOY, {
  component: CDExecutionSummary
})

executionFactory.registerStageDetails(StageType.DEPLOY, {
  component: CDStageDetails
})

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

const RedirectToGitSyncHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } =
    useParams<PipelineType<ProjectPathProps & ModulePathParams>>()

  return <Redirect to={routes.toGitSyncReposAdmin({ projectIdentifier, accountId, orgIdentifier, module })} />
}

const RedirectToDelegatesHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toDelegateList({ accountId, projectIdentifier, orgIdentifier, module })} />
}

const RedirectToCDProject = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  if (selectedProject?.modules?.includes(ModuleName.CD)) {
    return (
      <Redirect
        to={routes.toProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier,
          module: 'cd'
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCDHome({ accountId })} />
  }
}

const CDDashboardPageOrRedirect = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  const { licenseInformation } = useLicenseStore()
  const isCommunity = isCDCommunity(licenseInformation)

  if (!isCommunity) {
    return <CDDashboardPage />
  } else if (selectedProject?.modules?.includes(ModuleName.CD)) {
    return <Redirect to={routes.toDeployments({ ...params, module: 'cd' })} />
  } else {
    return <Redirect to={routes.toCDHome(params)} />
  }
}

const RedirectToPipelineDetailHome = (): React.ReactElement => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

const RedirectToExecutionPipeline = (): React.ReactElement => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  const { source } = useQueryParams<{ source?: string }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'cd',
        source
      })}
    />
  )
}

const GitOpsPage = (): React.ReactElement | null => {
  const { ARGO_PHASE1, ARGO_PHASE2_MANAGED } = useFeatureFlags()

  if (ARGO_PHASE2_MANAGED) {
    return <ChildAppMounter ChildApp={GitOpsServersList} />
  }

  if (ARGO_PHASE1) {
    return (
      <GitOpsServersPage>
        <GitOpsModalContainer />
      </GitOpsServersPage>
    )
  }

  return null
}

const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CD.toLowerCase() as Module
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CD_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}

const CDSideNavProps: SidebarContext = {
  navComponent: CDSideNav,
  subtitle: 'Continuous',
  title: 'Delivery',
  icon: 'cd-main'
}

const pipelineModuleParams: ModulePathParams = {
  module: ':module(cd)'
}

const templateModuleParams: ModulePathParams = {
  module: ':module(cd)'
}

TriggerFactory.registerTriggerForm(TriggerFormType.Manifest, {
  component: ManifestInputForm
})

TriggerFactory.registerTriggerForm(TriggerFormType.Artifact, {
  component: ArtifactInputForm
})

export default (
  <>
    <Route licenseRedirectData={licenseRedirectData} path={routes.toCD({ ...accountPathProps })} exact>
      <RedirectToCDProject />
    </Route>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toCDHome({ ...accountPathProps })}
      exact
    >
      <CDHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cd' })}
      exact
    >
      <CDTrialHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toProjectOverview({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <CDDashboardPageOrRedirect />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toDeployments({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <DeploymentsList />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <PipelinesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toServices({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <ServiceDetailPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toServiceDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...pipelineModuleParams,
        ...servicePathProps
      })}
    >
      <ServiceDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      exact
      path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <CDPipelineStudio />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      exact
      path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...templateModuleParams })}
    >
      <TemplateStudioWrapper />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps,
        ...pipelineModuleParams
      })}
    >
      <PipelineDetails>
        <CDPipelineDeploymentList />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toConnectors({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps, ...orgPathProps })}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toSecrets({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps,
        ...pipelineModuleParams
      })}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...pipelineModuleParams
      })}
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toSecretDetailsOverview({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...pipelineModuleParams
      })}
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toSecretDetailsReferences({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...pipelineModuleParams
      })}
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toDelegates({
        ...accountPathProps,
        ...projectPathProps,
        ...pipelineModuleParams
      })}
    >
      <RedirectToDelegatesHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toDelegateList({
        ...accountPathProps,
        ...projectPathProps,
        ...pipelineModuleParams
      })}
    >
      <DelegatesPage>
        <DelegateListing />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toDelegateConfigs({
        ...accountPathProps,
        ...projectPathProps,
        ...pipelineModuleParams
      })}
    >
      <DelegatesPage>
        <DelegateConfigurations />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toDelegatesDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegatePathProps,
        ...pipelineModuleParams
      })}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[
        routes.toDelegateConfigsDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...delegateConfigProps,
          ...pipelineModuleParams
        }),
        routes.toEditDelegateConfigsDetails({
          ...accountPathProps,
          ...projectPathProps,
          ...delegateConfigProps,
          ...pipelineModuleParams
        })
      ]}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[
        routes.toDelegateTokens({
          ...accountPathProps,
          ...projectPathProps,
          ...pipelineModuleParams
        })
      ]}
    >
      <DelegatesPage>
        <DelegateTokens />
      </DelegatesPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...orgPathProps,
        ...pipelineModuleParams
      })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <InputSetList />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toInputSetForm({ ...accountPathProps, ...inputSetFormPathProps, ...pipelineModuleParams })}
    >
      <EnhancedInputSetForm />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toTriggersPage({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <TriggersPage />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggerDetails wizard={true}>
        <TriggersWizardPage />
      </TriggerDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggersDetailPage />
    </RouteWithLayout>
    <Route
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toExecution({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <RedirectToExecutionPipeline />
    </Route>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionPipelineView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionPipelineView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionPolicyEvaluationsView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
    >
      <ExecutionLandingPage>
        <ExecutionPolicyEvaluationsView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionSecurityView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
    >
      <ExecutionLandingPage>
        <ExecutionSecurityView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionInputsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionInputsView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionTestsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <BuildTests />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionArtifactsView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
    >
      <ExecutionLandingPage>
        <ExecutionArtifactsView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toUsers({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toUserDetails({ ...projectPathProps, ...pipelineModuleParams, ...userPathProps })}
      exact
    >
      <UserDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toUserGroupDetails({ ...projectPathProps, ...pipelineModuleParams, ...userGroupPathProps })}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toServiceAccounts({ ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toServiceAccountDetails({ ...projectPathProps, ...pipelineModuleParams, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toRoles({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...pipelineModuleParams, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[
        routes.toResourceGroupDetails({ ...projectPathProps, ...pipelineModuleParams, ...resourceGroupPathProps })
      ]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      exact
      path={[routes.toGitSyncAdmin({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })]}
    >
      <RedirectToGitSyncHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toGitSyncReposAdmin({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })}
    >
      <GitSyncPage>
        <GitSyncRepoTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toGitSyncEntitiesAdmin({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncEntityTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toGitSyncErrors({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncErrors />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toTemplates({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <TemplatesPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toGitOps({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })]}
    >
      <GitOpsPage />
    </RouteWithLayout>

    {GovernanceRouteDestinations({
      sidebarProps: CDSideNavProps,
      pathProps: { ...accountPathProps, ...projectPathProps, ...pipelineModuleParams }
    })}
  </>
)

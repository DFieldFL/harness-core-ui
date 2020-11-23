import { pick } from 'lodash-es'
import type { IconName } from '@wings-software/uikit'
import { Connectors, ConnectorInfoText, EntityTypes } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import { Scope } from '@common/interfaces/SecretsInterface'

export const getScopeFromString = (value: string) => {
  return value?.indexOf('.') < 0 ? Scope.PROJECT : value?.split('.')[0]
}

export const getSecretIdFromString = (value: string) => {
  return value?.indexOf('.') < 0 ? value : value?.split('.')[1]
}

export const GCP_AUTH_TYPE = {
  DELEGATE: 'delegate',
  ENCRYPTED_KEY: 'encryptedKey'
}

export const AuthTypes = {
  CLIENT_KEY_CERT: 'ClientKeyCert',
  USER_PASSWORD: 'UsernamePassword',
  SERVICE_ACCOUNT: 'ServiceAccount',
  OIDC: 'OpenIdConnect'
}
export const DelegateTypes = {
  DELEGATE_IN_CLUSTER: 'InheritFromDelegate',
  DELEGATE_OUT_CLUSTER: 'ManualConfig'
}

export const DelegateInClusterType = {
  useExistingDelegate: 'useExistingDelegate',
  addNewDelegate: 'addnewDelegate'
}

export const getScopedSecretString = (scope: string, identifier: string) => {
  switch (scope) {
    case Scope.PROJECT:
      return identifier
    case Scope.ACCOUNT:
      return `account.${identifier}`
    case Scope.ORG:
      return `org.${identifier}`
  }
}

const buildAuthTypePayload = (formData: FormData) => {
  const { authType = '' } = formData

  switch (authType) {
    case AuthTypes.USER_PASSWORD:
      return {
        username: formData.username,
        passwordRef: formData.password.referenceString
      }
    case AuthTypes.SERVICE_ACCOUNT:
      return {
        serviceAccountTokenRef: formData.serviceAccountToken.referenceString
      }
    case AuthTypes.OIDC:
      return {
        oidcUsername: formData.oidcUsername,
        oidcPasswordRef: formData.oidcPassword.referenceString,
        oidcClientIdRef: formData.oidcCleintId.referenceString,
        oidcSecretRef: formData.oidcCleintSecret.referenceString,
        oidcScopes: formData.oidcCleintSecret.oidcScopes
      }

    case AuthTypes.CLIENT_KEY_CERT:
      return {
        clientKeyRef: formData.clientKey.referenceString,
        clientCertRef: formData.clientKeyCertificate.referenceString,
        clientKeyPassphraseRef: formData.clientKeyPassphrase.referenceString,
        caCertRef: formData.clientKeyCACertificate.referenceString,
        clientKeyAlgo: formData.clientKeyAlgorithm
      }
    default:
      return {}
  }
}

// clientKey clientKeyPassphrase clientKeyCertificate

export const getSpecForDelegateType = (formData: FormData) => {
  const type = formData?.delegateType
  if (type === DelegateTypes.DELEGATE_IN_CLUSTER) {
    return {
      delegateName: formData?.delegateName
    }
  } else if (type === DelegateTypes.DELEGATE_OUT_CLUSTER) {
    return {
      masterUrl: formData?.masterUrl,
      auth: {
        type: formData?.authType,
        spec: buildAuthTypePayload(formData)
      }
    }
  }
}

export const buildKubPayload = (formData: FormData) => {
  const savedData = {
    name: formData?.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData?.identifier,
    tags: formData?.tags,
    type: Connectors.KUBERNETES_CLUSTER,
    spec: {
      credential: {
        type: formData?.delegateType,
        spec: getSpecForDelegateType(formData)
      }
    }
  }
  return { connector: savedData }
}

export const buildAWSPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.AWS,
    spec: {
      credential: {
        type: formData.credential,
        spec:
          formData.credential === DelegateTypes.DELEGATE_IN_CLUSTER
            ? {
                delegateSelector: formData.delegateSelector
              }
            : {
                accessKey: formData.accessKey,
                secretKeyRef: formData.secretKeyRef.referenceString
              },
        crossAccountAccess: formData.crossAccountAccess
          ? {
              crossAccountRoleArn: formData.crossAccountRoleArn,
              externalId: formData.externalId
            }
          : null
      }
    }
  }
  return { connector: savedData }
}

export const buildDockerPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.DOCKER,
    spec: {
      dockerRegistryUrl: formData.dockerRegistryUrl,
      auth:
        formData.username && formData.password
          ? {
              type: 'UsernamePassword',
              spec: {
                username: formData.username,
                passwordRef: formData.password.referenceString
              }
            }
          : null
    }
  }
  return { connector: savedData }
}

export const buildDockerFormData = (connector: ConnectorInfoDTO) => {
  return {
    ...pick(connector, ['name', 'identifier', 'description', 'tags']),
    dockerRegistryUrl: connector?.spec?.dockerRegistryUrl,
    ...pick(connector?.spec?.auth?.spec, ['username', 'passwordRef'])
  }
}

export const buildGcpPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.GCP,
    spec: {
      credential: {}
    }
  }

  savedData.spec.credential =
    formData.authType === GCP_AUTH_TYPE.ENCRYPTED_KEY
      ? {
          type: 'ManualConfig',
          spec: {
            secretKeyRef: formData.password.referenceString
          }
        }
      : {
          type: 'InheritFromDelegate',
          spec: {
            delegateSelector: formData.delegateName
          }
        }

  return { connector: savedData }
}

export const getSpecByConnectType = (type: string, formData: FormData) => {
  let referenceField
  if (type === 'Ssh') {
    referenceField = { sshKeyRef: formData?.sshKeyRef }
  } else {
    referenceField = {
      passwordRef: formData.password.referenceString
    }
  }
  return {
    username: formData?.username,
    ...referenceField
  }
}

export const buildGITPayload = (formData: FormData) => {
  const savedData = {
    name: formData?.name,
    description: formData?.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData?.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData?.tags,
    type: Connectors.GIT,
    spec: {
      connectionType: formData?.connectionType,
      branchName: formData.branchName,
      url: formData.url,
      type: formData?.connectType,
      spec: getSpecByConnectType(formData?.connectType, formData)
      // mocked data untill UX is not provided
      // gitSync: {
      //   enabled: true,
      //   customCommitAttributes: {
      //     authorName: 'deepak',
      //     authorEmail: 'deepak.patankar@harness.io',
      //     commitMessage: '[GITSYNC-0]: Pushing Changes'
      //   }
      // }
    }
  }
  return { connector: savedData }
}

export const buildGITFormData = (connector: ConnectorInfoDTO) => {
  return {
    name: connector?.name,
    description: connector?.description,
    identifier: connector?.identifier,
    tags: connector?.tags,
    connectionType: connector?.spec?.connectionType,
    branchName: connector?.spec?.branchName,
    url: connector?.spec?.url,
    connectType: connector?.spec?.type,
    ...connector?.spec?.spec
  }
}

export const buildKubFormData = (connector: ConnectorInfoDTO) => {
  return {
    name: connector?.name,
    description: connector?.description,
    identifier: connector?.identifier,
    tags: connector?.tags,
    delegateType: connector?.spec?.credential?.type,
    delegateName: connector?.spec?.credential?.spec?.delegateName,
    masterUrl: connector?.spec?.credential?.spec?.masterUrl,
    authType: connector?.spec?.credential?.spec?.auth?.type,
    ...connector?.spec?.credential?.spec?.auth?.spec
  }
}

export const buildNexusPayload = (formData: FormData) => {
  const savedData = {
    type: Connectors.NEXUS,
    ...pick(formData, ['name', 'identifier', 'description', 'tags']),
    spec: {
      nexusServerUrl: formData?.nexusServerUrl,
      version: formData?.nexusVersion,
      auth:
        formData.userName && formData.password
          ? {
              type: 'UsernamePassword',
              spec: {
                username: formData.userName,
                passwordRef: formData.password.referenceString
              }
            }
          : null
    }
  }

  return { connector: savedData }
}

export const buildArtifactoryPayload = (formData: FormData) => {
  const savedData = {
    type: Connectors.ARTIFACTORY,
    ...pick(formData, ['name', 'identifier', 'description', 'tags']),
    spec: {
      artifactoryServerUrl: formData?.artifactoryServerUrl,
      auth:
        formData.userName && formData.password
          ? {
              type: 'UsernamePassword',
              spec: {
                username: formData.userName,
                passwordRef: formData.password.referenceString
              }
            }
          : null
    }
  }
  return { connector: savedData }
}

export const getIconByType = (type: ConnectorInfoDTO['type'] | undefined): IconName => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'service-kubernetes'
    case Connectors.GIT:
      return 'service-github'
    case 'Vault': // TODO: use enum when backend fixes it
    case 'Local': // TODO: use enum when backend fixes it
      return 'secret-manager'
    case Connectors.APP_DYNAMICS:
      return 'service-appdynamics'
    case Connectors.SPLUNK:
      return 'service-splunk'
    case Connectors.DOCKER:
      return 'service-dockerhub'
    case Connectors.AWS:
      return 'service-aws'
    case Connectors.NEXUS:
      return 'service-nexus'
    case Connectors.ARTIFACTORY:
      return 'service-artifactory'
    case Connectors.GCP:
      return 'service-gcp'
    default:
      return 'cog'
  }
}

export const getInfoTextByType = (type: string) => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return ConnectorInfoText.KUBERNETES_CLUSTER
    default:
      return ''
  }
}

export const getConnectorDisplayName = (type: string) => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'Kubernetes cluster'
    case Connectors.GIT:
      return 'Git'
    case Connectors.DOCKER:
      return 'Docker'
    case Connectors.GCP:
      return 'GCP'
    case Connectors.APP_DYNAMICS:
      return 'AppDynamics server'
    case Connectors.SPLUNK:
      return 'Splunk server'
    case Connectors.AWS:
      return 'AWS'
    case Connectors.NEXUS:
      return 'Nexus'
    case Connectors.LOCAL:
      return 'Local Secret Manager'
    case Connectors.VAULT:
      return 'Vault'
    case Connectors.GCP_KMS:
      return 'GCP KMS'
    case Connectors.SECRET_MANAGER:
      return 'Custom Secret Manager'
    case Connectors.AZUREVAULT:
      return 'Azure Vault'
    case Connectors.AWSSM:
      return 'AWS Secret Manager'
    default:
      return ''
  }
}

export const getIconByEntityType = (type: string) => {
  switch (type) {
    case EntityTypes.PROJECT:
      return 'nav-project'
    case EntityTypes.PIPELINE:
      return 'pipeline'
    case EntityTypes.SECRET:
      return 'key-main'

    default:
      return ''
  }
}

export const getReferredEntityLabelByType = (type: string) => {
  switch (type) {
    case EntityTypes.PROJECT:
      return 'Project'
    case EntityTypes.PIPELINE:
      return 'Pipeline'
    case EntityTypes.SECRET:
      return 'Secret'

    default:
      return ''
  }
}

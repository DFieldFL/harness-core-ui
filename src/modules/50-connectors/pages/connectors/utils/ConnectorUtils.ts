import { pick } from 'lodash-es'
import type { IconName } from '@wings-software/uicore'
import { Connectors, EntityTypes } from '@connectors/constants'
import {
  ConnectorInfoDTO,
  getSecretV2Promise,
  GetSecretV2QueryParams,
  ConnectorConfigDTO,
  AwsCredential,
  ErrorDetail
} from 'services/cd-ng'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/exports'
import { AuthTypes, GitAuthTypes, GitAPIAuthTypes } from './ConnectorHelper'

export const getScopeFromString = (value: string) => {
  return value?.indexOf('.') < 0 ? Scope.PROJECT : value?.split('.')[0]
}

export const getSecretIdFromString = (value: string) => {
  return value?.indexOf('.') < 0 ? value : value?.split('.')[1]
}

export interface DelegateCardInterface {
  type: string
  info: string
  disabled?: boolean
}
export interface CredentialType {
  [key: string]: AwsCredential['type']
}

export const GCP_AUTH_TYPE = {
  DELEGATE: 'delegate',
  ENCRYPTED_KEY: 'encryptedKey'
}

export const DelegateTypes: CredentialType = {
  DELEGATE_IN_CLUSTER: 'InheritFromDelegate',
  DELEGATE_OUT_CLUSTER: 'ManualConfig'
}

export const DelegateInClusterType = {
  useExistingDelegate: 'useExistingDelegate',
  addNewDelegate: 'addnewDelegate'
}

export const DockerProviderType = {
  DOCKERHUB: 'DockerHub',
  HARBOUR: 'Harbor',
  QUAY: 'Quay',
  OTHER: 'Other'
}

export const GitUrlType = {
  ACCOUNT: 'Account',
  REPO: 'Repo'
}

export const GitConnectionType = {
  HTTP: 'Http',
  SSH: 'Ssh'
}

export interface SecretReferenceInterface {
  identifier: string
  name: string
  referenceString: string
}

const buildAuthTypePayload = (formData: FormData) => {
  const { authType = '' } = formData

  switch (authType) {
    case AuthTypes.USER_PASSWORD:
      return {
        username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
        usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
        passwordRef: formData.password.referenceString
      }
    case AuthTypes.SERVICE_ACCOUNT:
      return {
        serviceAccountTokenRef: formData.serviceAccountToken.referenceString
      }
    case AuthTypes.OIDC:
      return {
        oidcIssuerUrl: formData.oidcIssuerUrl,
        oidcUsername: formData.oidcUsername.type === ValueType.TEXT ? formData.oidcUsername.value : undefined,
        oidcUsernameRef: formData.oidcUsername.type === ValueType.ENCRYPTED ? formData.oidcUsername.value : undefined,
        oidcPasswordRef: formData.oidcPassword.referenceString,
        oidcClientIdRef: formData.oidcCleintId.referenceString,
        oidcSecretRef: formData.oidcCleintSecret.referenceString,
        oidcScopes: formData.oidcScopes
      }

    case AuthTypes.CLIENT_KEY_CERT:
      return {
        clientKeyRef: formData.clientKey.referenceString,
        clientCertRef: formData.clientKeyCertificate.referenceString,
        clientKeyPassphraseRef: formData.clientKeyPassphrase.referenceString,
        caCertRef: formData.clientKeyCACertificate?.referenceString, // optional
        clientKeyAlgo: formData.clientKeyAlgo
      }
    default:
      return {}
  }
}

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

const getGitAuthSpec = (formData: FormData) => {
  const { authType = '' } = formData
  switch (authType) {
    case GitAuthTypes.USER_PASSWORD:
      return {
        username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
        usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
        passwordRef: formData.password.referenceString
      }
    case GitAuthTypes.USER_TOKEN:
      return {
        username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
        usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
        tokenRef: formData.accessToken.referenceString
      }
    case GitAuthTypes.KERBEROS:
      return {
        kerberosKeyRef: formData.kerberosKey.referenceString
      }
    default:
      return {}
  }
}

export const buildGithubPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData.identifier,
    tags: formData?.tags,
    type: Connectors.GITHUB,
    spec: {
      type: formData.urlType,
      url: formData.url,
      authentication: {
        type: formData.connectionType,
        spec:
          formData.connectionType === GitConnectionType.SSH
            ? { sshKeyRef: formData.sshKey.referenceString }
            : {
                type: formData.authType,
                spec: getGitAuthSpec(formData)
              }
      },
      apiAccess: { type: formData.apiAuthType, spec: {} }
    }
  }

  if (formData.enableAPIAccess) {
    savedData.spec.apiAccess.spec =
      formData.apiAuthType === GitAPIAuthTypes.TOKEN
        ? {
            tokenRef: formData.apiAccessToken.referenceString
          }
        : {
            installationId: formData.installationId,
            applicationId: formData.applicationId,
            privateKeyRef: formData.privateKey.referenceString
          }
  } else {
    delete savedData.spec.apiAccess
  }
  return { connector: savedData }
}

export const buildGitlabPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData.identifier,
    tags: formData?.tags,
    type: Connectors.GITLAB,
    spec: {
      type: formData.urlType,
      url: formData.url,
      authentication: {
        type: formData.connectionType,
        spec:
          formData.connectionType === GitConnectionType.SSH
            ? { sshKeyRef: formData.sshKey?.referenceString }
            : {
                type: formData.authType,
                spec: getGitAuthSpec(formData)
              }
      },
      apiAccess: { type: formData.apiAuthType, spec: {} }
    }
  }

  if (formData.enableAPIAccess) {
    savedData.spec.apiAccess.spec =
      formData.apiAuthType === GitAPIAuthTypes.TOKEN
        ? {
            tokenRef: formData.apiAccessToken?.referenceString
          }
        : {
            installationId: formData.installationId,
            applicationId: formData.applicationId,
            privateKeyRef: formData.privateKey.referenceString
          }
  } else {
    delete savedData.spec.apiAccess
  }
  return { connector: savedData }
}

export const buildBitbucketPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData.identifier,
    tags: formData?.tags,
    type: Connectors.BITBUCKET,
    spec: {
      type: formData.urlType,
      url: formData.url,
      authentication: {
        type: formData.connectionType,
        spec:
          formData.connectionType === GitConnectionType.SSH
            ? { sshKeyRef: formData.sshKey.referenceString }
            : {
                type: formData.authType,
                spec: getGitAuthSpec(formData)
              }
      },
      apiAccess: { type: formData.apiAuthType, spec: {} }
    }
  }

  if (formData.enableAPIAccess) {
    savedData.spec.apiAccess.spec = {
      username: formData.apiAccessUsername.type === ValueType.TEXT ? formData.apiAccessUsername.value : undefined,
      usernameRef:
        formData.apiAccessUsername.type === ValueType.ENCRYPTED ? formData.apiAccessUsername.value : undefined,
      tokenRef: formData.accessToken.referenceString
    }
  } else {
    delete savedData.spec.apiAccess
  }
  return { connector: savedData }
}

export const setSecretField = async (
  secretString: string,
  scopeQueryParams: GetSecretV2QueryParams
): Promise<SecretReferenceInterface | void> => {
  if (!secretString) {
    return undefined
  } else {
    const secretScope = getScopeFromString(secretString)

    switch (secretScope) {
      case Scope.ACCOUNT:
        delete scopeQueryParams.orgIdentifier
        delete scopeQueryParams.projectIdentifier
        break
      case Scope.ORG:
        delete scopeQueryParams.projectIdentifier
    }

    const response = await getSecretV2Promise({
      identifier: secretString.indexOf('.') < 0 ? secretString : secretString.split('.')[1],
      queryParams: scopeQueryParams
    })

    return {
      identifier: secretString.split('.')[1],
      name: response.data?.secret.name || secretString.split('.')[1],
      referenceString: secretString
    }
  }
}

export const setupGitFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    sshKey: await setSecretField(connectorInfo?.spec?.sshKeyRef, scopeQueryParams),
    username:
      connectorInfo?.spec?.spec?.username || connectorInfo?.spec?.spec?.usernameRef
        ? {
            value: connectorInfo?.spec?.spec?.username || connectorInfo?.spec?.spec?.usernameRef,
            type: connectorInfo?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password: await setSecretField(connectorInfo?.spec?.spec?.passwordRef, scopeQueryParams)
  }

  return formData
}

export const setupGithubFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const authData = connectorInfo?.spec?.authentication
  const formData = {
    sshKey: await setSecretField(authData?.spec?.sshKeyRef, scopeQueryParams),
    authType: authData?.spec?.type,
    username:
      authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef
        ? {
            value: authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef,
            type: authData?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password: await setSecretField(authData?.spec?.spec?.passwordRef, scopeQueryParams),
    accessToken: await setSecretField(
      authData?.spec?.spec?.tokenRef || connectorInfo?.spec?.apiAccess?.spec?.tokenRef,
      scopeQueryParams
    ),
    apiAccessToken: await setSecretField(connectorInfo?.spec?.apiAccess?.spec?.tokenRef, scopeQueryParams),
    kerberosKey: await setSecretField(authData?.spec?.spec?.kerberosKeyRef, scopeQueryParams),
    enableAPIAccess: !!connectorInfo?.spec?.apiAccess,
    apiAuthType: connectorInfo?.spec?.apiAccess?.type,
    installationId: connectorInfo?.spec?.apiAccess?.spec?.installationId,
    applicationId: connectorInfo?.spec?.apiAccess?.spec?.applicationId,
    privateKey: await setSecretField(connectorInfo?.spec?.apiAccess?.spec?.privateKeyRef, scopeQueryParams)
  }

  return formData
}

export const setupBitbucketFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const authData = connectorInfo?.spec?.authentication
  const formData = {
    sshKey: await setSecretField(authData?.spec?.sshKeyRef, scopeQueryParams),
    authType: authData?.spec?.type,
    username:
      authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef
        ? {
            value: authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef,
            type: authData?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,
    password: await setSecretField(authData?.spec?.spec?.passwordRef, scopeQueryParams),
    enableAPIAccess: !!connectorInfo?.spec?.apiAccess,
    apiAccessUsername:
      connectorInfo?.spec?.apiAccess?.spec?.username || connectorInfo?.spec?.apiAccess?.spec?.usernameRef
        ? {
            value: connectorInfo?.spec?.apiAccess?.spec?.username || connectorInfo?.spec?.apiAccess?.spec?.usernameRef,
            type: connectorInfo?.spec?.apiAccess?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    apiAuthType: connectorInfo?.spec?.apiAccess?.type,
    accessToken: await setSecretField(connectorInfo?.spec?.apiAccess?.spec?.tokenRef, scopeQueryParams)
  }

  return formData
}

export const getK8AuthFormFields = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }
  const authdata = connectorInfo.spec.credential?.spec?.auth?.spec
  return {
    username:
      authdata.username || authdata.usernameRef
        ? {
            value: authdata.username || authdata.usernameRef,
            type: authdata.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,
    password: await setSecretField(authdata.passwordRef, scopeQueryParams),
    serviceAccountToken: await setSecretField(authdata.serviceAccountTokenRef, scopeQueryParams),
    oidcIssuerUrl: authdata.oidcIssuerUrl,
    oidcUsername:
      authdata.oidcUsername || authdata.oidcUsernameRef
        ? {
            value: authdata.oidcUsername || authdata.oidcUsernameRef,
            type: authdata.oidcUsernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,
    oidcPassword: await setSecretField(authdata.oidcPasswordRef, scopeQueryParams),
    oidcCleintId: await setSecretField(authdata.oidcClientIdRef, scopeQueryParams),
    oidcCleintSecret: await setSecretField(authdata.oidcSecretRef, scopeQueryParams),
    oidcScopes: authdata.oidcScopes,
    clientKey: await setSecretField(authdata.clientKeyRef, scopeQueryParams),
    clientKeyCertificate: await setSecretField(authdata.clientCertRef, scopeQueryParams),
    clientKeyPassphrase: await setSecretField(authdata.clientKeyPassphraseRef, scopeQueryParams),
    clientKeyCACertificate: await setSecretField(authdata.caCertRef, scopeQueryParams),
    clientKeyAlgo: authdata.clientKeyAlgo
  }
}

export const setupKubFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const authData = await getK8AuthFormFields(connectorInfo, accountId)

  const formData = {
    delegateType: connectorInfo.spec.credential.type,
    delegateName: connectorInfo.spec.credential?.spec?.delegateName || '',
    masterUrl: connectorInfo.spec.credential?.spec?.masterUrl || '',
    authType: connectorInfo.spec.credential?.spec?.auth?.type || '',
    skipDefaultValidation: false,
    ...authData
  }

  return formData
}

export const setupGCPFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    delegateType: connectorInfo.spec.credential.type,
    delegateName: connectorInfo.spec.credential?.spec?.delegateName || '',
    password: await setSecretField(connectorInfo.spec.credential?.spec?.secretKeyRef, scopeQueryParams)
  }

  return formData
}

export const setupAWSFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    credential: connectorInfo.spec.credential.type,
    accessKey:
      connectorInfo.spec.credential.spec.accessKey || connectorInfo.spec.credential.spec.accessKeyRef
        ? {
            value: connectorInfo.spec.credential.spec.accessKey || connectorInfo.spec.credential.spec.accessKeyRef,
            type: connectorInfo.spec.credential.spec.accessKeyRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    secretKeyRef: await setSecretField(connectorInfo.spec.credential.spec.secretKeyRef, scopeQueryParams),
    crossAccountAccess: !!connectorInfo.spec.credential.crossAccountAccess,
    crossAccountRoleArn: connectorInfo.spec.credential.crossAccountAccess?.crossAccountRoleArn,
    externalId: connectorInfo.spec.credential.crossAccountAccess?.externalId
  }

  return formData
}

export const setupDockerFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    dockerRegistryUrl: connectorInfo.spec.dockerRegistryUrl,
    authType: connectorInfo.spec.auth.type,
    dockerProviderType: connectorInfo.spec.providerType,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }
  return formData
}

export const setupNexusFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    nexusServerUrl: connectorInfo.spec.nexusServerUrl,
    nexusVersion: connectorInfo.spec.version,
    authType: connectorInfo.spec.auth.type,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }

  return formData
}

export const setupArtifactoryFormData = async (
  connectorInfo: ConnectorInfoDTO,
  accountId: string
): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    artifactoryServerUrl: connectorInfo.spec.artifactoryServerUrl,
    authType: connectorInfo.spec.auth.type,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }

  return formData
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
                accessKey: formData.accessKey.type === ValueType.TEXT ? formData.accessKey.value : undefined,
                accessKeyRef: formData.accessKey.type === ValueType.ENCRYPTED ? formData.accessKey.value : undefined,

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
      providerType: formData.dockerProviderType,
      auth:
        formData.authType === AuthTypes.USER_PASSWORD
          ? {
              type: formData.authType,
              spec: {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            }
          : {
              type: formData.authType
            }
    }
  }
  return { connector: savedData }
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
      credential: {
        type: formData?.delegateType,
        spec:
          formData?.delegateType === DelegateTypes.DELEGATE_IN_CLUSTER
            ? {
                delegateSelector: formData.delegateName
              }
            : {
                secretKeyRef: formData.password.referenceString
              }
      }
    }
  }

  return { connector: savedData }
}

export const buildGitPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.GIT,
    spec: {
      connectionType: formData.urlType,
      url: formData.url,
      type: formData.connectionType,
      spec:
        formData.connectionType === GitConnectionType.SSH
          ? { sshKeyRef: formData.sshKey.referenceString }
          : {
              username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
              usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
              passwordRef: formData.password.referenceString
            }

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

    ...pick(formData, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'tags']),
    spec: {
      nexusServerUrl: formData?.nexusServerUrl,
      version: formData?.nexusVersion,
      auth: {
        type: formData.authType,
        spec:
          formData.authType === AuthTypes.USER_PASSWORD
            ? {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            : null
      }
    }
  }

  return { connector: savedData }
}

export const buildArtifactoryPayload = (formData: FormData) => {
  const savedData = {
    type: Connectors.ARTIFACTORY,
    ...pick(formData, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'tags']),
    spec: {
      artifactoryServerUrl: formData?.artifactoryServerUrl,
      auth: {
        type: formData.authType,
        spec:
          formData.authType === AuthTypes.USER_PASSWORD
            ? {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            : null
      }
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
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket'
    case Connectors.VAULT: // TODO: use enum when backend fixes it
      return 'hashiCorpVault'
    case Connectors.LOCAL: // TODO: use enum when backend fixes it
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

export const getConnectorDisplayName = (type: string) => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'Kubernetes cluster'
    case Connectors.GIT:
      return 'Git'
    case Connectors.GITHUB:
      return 'GitHub'
    case Connectors.GITLAB:
      return 'GitLab'
    case Connectors.BITBUCKET:
      return 'Bitbucket'
    case Connectors.DOCKER:
      return 'Docker Registry'
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
      return 'HashiCorp Vault'
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

export function GetTestConnectionValidationTextByType(type: ConnectorConfigDTO['type']) {
  const { getString } = useStrings()
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return getString('connectors.testConnectionStep.validationText.k8s')
    case Connectors.DOCKER:
      return getString('connectors.testConnectionStep.validationText.docker')
    case Connectors.AWS:
      return getString('connectors.testConnectionStep.validationText.aws')
    case Connectors.NEXUS:
      return getString('connectors.testConnectionStep.validationText.nexus')
    case Connectors.ARTIFACTORY:
      return getString('connectors.testConnectionStep.validationText.artifactory')
    case Connectors.GCP:
      return getString('connectors.testConnectionStep.validationText.gcp')
    case Connectors.GCR:
      return getString('connectors.testConnectionStep.validationText.gcr')
    case Connectors.APP_DYNAMICS:
      return getString('connectors.testConnectionStep.validationText.appD')
    case Connectors.SPLUNK:
      return getString('connectors.testConnectionStep.validationText.splunk')
    case Connectors.VAULT:
      return getString('connectors.testConnectionStep.validationText.vault')
    case Connectors.BITBUCKET:
      return getString('connectors.testConnectionStep.validationText.bitbucket')
    case Connectors.GITLAB:
      return getString('connectors.testConnectionStep.validationText.gitlab')
    case Connectors.GITHUB:
      return getString('connectors.testConnectionStep.validationText.github')
    case Connectors.GIT:
      return getString('connectors.testConnectionStep.validationText.git')

    default:
      return ''
  }
}
export const getUrlValueByType = (type: ConnectorInfoDTO['type'], connector: ConnectorInfoDTO): string => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return connector.spec.credential.spec.masterUrl
    case Connectors.DOCKER:
      return connector.spec.dockerRegistryUrl
    case Connectors.NEXUS:
      return connector.spec.nexusServerUrl

    case Connectors.ARTIFACTORY:
      return connector.spec.artifactoryServerUrl

    case Connectors.APP_DYNAMICS:
      return connector.spec.controllerUrl

    case Connectors.SPLUNK:
      return connector.spec.splunkUrl

    case Connectors.VAULT:
      return connector.spec.vaultUrl
    case Connectors.BITBUCKET:
    case Connectors.GITLAB:
    case Connectors.GITHUB:
    case Connectors.GIT:
      return connector.spec.url

    default:
      return ''
  }
}

export const getInvocationPathsForSecrets = (type: ConnectorInfoDTO['type'] | 'Unknown'): Set<RegExp> => {
  switch (type) {
    case 'K8sCluster':
      return new Set([
        /^.+\.passwordRef$/,
        /^.+\.usernameRef$/,
        /^.+\.serviceAccountTokenRef$/,
        /^.+\.oidcUsernameRef$/,
        /^.+\.oidcClientIdRef$/,
        /^.+\.oidcPasswordRef$/,
        /^.+\.oidcSecretRef$/,
        /^.+\.caCertRef$/,
        /^.+\.clientCertRef$/,
        /^.+\.clientKeyRef$/,
        /^.+\.clientKeyPassphraseRef$/
      ])
    case 'DockerRegistry':
      return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/])
    case 'Nexus':
      return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/])
    case 'Git':
      return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/, /^.+\.encryptedSshKey$/])
    case 'Splunk':
      return new Set([/^.+\.passwordRef$/])
    case 'AppDynamics':
      return new Set([/^.+\.passwordRef$/])
    case 'Gcp':
      return new Set([/^.+\.secretKeyRef$/])
    case 'Aws':
      return new Set([/^.+\.accessKeyRef$/, /^.+\.secretKeyRef$/])
    case 'Github':
      return new Set([
        /^.+\.usernameRef$/,
        /^.+\.passwordRef$/,
        /^.+\.tokenRef$/,
        /^.+\.sshKeyRef$/,
        /^.+\.privateKeyRef$/
      ])
    case 'Gitlab':
      return new Set([
        /^.+\.usernameRef$/,
        /^.+\.passwordRef$/,
        /^.+\.tokenRef$/,
        /^.+\.sshKeyRef$/,
        /^.+\.kerberosKeyRef$/
      ])
    case 'Bitbucket':
      return new Set([/^.+\.usernameRef$/, /^.+\.passwordRef$/, /^.+\.tokenRef$/, /^.+\.sshKeyRef$/])
    case 'Unknown':
      return new Set([/^.+\.Ref$/])
    default:
      return new Set([])
  }
}

export const removeErrorCode = (errors: ErrorDetail[] = []) => {
  errors.forEach(item => delete item.code)
  return errors
}

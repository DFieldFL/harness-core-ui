import type { IconName } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { HelmVersionOptions, ManifestStores, ManifestTypes } from './ManifestInterface'

export const ManifestDataType: { [key: string]: ManifestTypes } = {
  K8sManifest: 'K8sManifest',
  Values: 'Values',
  HelmChart: 'HelmChart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'OpenshiftTemplate',
  OpenshiftParam: 'OpenshiftParam'
}

export const ManifestStoreMap: { [key: string]: ManifestStores } = {
  Git: 'Git',
  Github: 'Github',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  Http: 'Http',
  S3: 'S3',
  Gcs: 'Gcs'
}

export const manifestTypeIcons: Record<ManifestTypes, IconName> = {
  K8sManifest: 'service-kubernetes',
  Values: 'functions',
  HelmChart: 'service-helm',
  Kustomize: 'kustamize',
  OpenshiftTemplate: 'openshift',
  OpenshiftParam: 'openshift-params'
}

export const manifestTypeLabels: Record<ManifestTypes, string> = {
  K8sManifest: 'K8s Manifest',
  Values: 'Values YAML',
  HelmChart: 'Helm Chart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'Openshift Template',
  OpenshiftParam: 'Openshift Param'
}

export const manifestTypeText: Record<string, string> = {
  K8sManifest: 'Manifest',
  Values: 'Values Overrides',
  HelmChart: 'Helm Chart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'Openshift Template',
  OpenshiftParam: 'Openshift Param'
}

export const helmVersions: Array<{ label: string; value: HelmVersionOptions }> = [
  { label: 'Version 2', value: 'V2' },
  { label: 'Version 3', value: 'V3' }
]
export const getManifestIconByType = (type: string | undefined): IconName => {
  switch (type) {
    case ManifestStoreMap.Git:
      return 'service-github'
    case ManifestStoreMap.Github:
      return 'github'
    case ManifestStoreMap.GitLab:
      return 'service-gotlab'
    case ManifestStoreMap.Bitbucket:
      return 'bitbucket'
    case ManifestStoreMap.Http:
      return 'service-helm'
    case ManifestStoreMap.S3:
      return 'service-helm' // proper icon needs to be added for S3 and Gcs
    case ManifestStoreMap.Gcs:
      return 'service-helm'
    default:
      return 'cog'
  }
}
export const getManifestStoreTitle = (type: string): string => {
  switch (type) {
    case ManifestStoreMap.Git:
      return 'connectors.title.gitConnector'
    case ManifestStoreMap.Github:
      return 'connectors.title.githubConnector'
    case ManifestStoreMap.GitLab:
      return 'connectors.title.gitlabConnector'
    case ManifestStoreMap.Bitbucket:
      return 'connectors.title.bitbucketConnector'
    case ManifestStoreMap.Http:
      return 'connectors.title.helmConnector'
    case ManifestStoreMap.S3:
      return 'connectors.S3'
    case ManifestStoreMap.Gcs:
      return 'connectors.GCS.fullName'
    default:
      return 'store'
  }
}

export const ManifestToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Http: Connectors.HttpHelmRepo,
  S3: Connectors.AWS,
  Gcs: Connectors.GCP
}
export const GitRepoName: Record<string, string> = {
  Account: 'Account',
  Repo: 'Repo'
}

import type { IconName } from '@wings-software/uicore'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { GetYamlSnippetMetadataQueryParams, GetYamlSchemaQueryParams, ConnectorInfoDTO } from 'services/cd-ng'

export const getIconNameForTag = (tag: string): IconName => {
  switch (tag) {
    case 'k8s':
      return 'app-kubernetes'
    case 'docker':
      return 'service-dockerhub'
    case 'git':
      return 'service-github'
    case 'secretmanager':
      return 'lock'
    default:
      return 'main-code-yaml'
  }
}

const entitySubTypeToTagMap: {
  [key in ConnectorInfoDTO['type']]: GetYamlSnippetMetadataQueryParams['tags'][number]
} = {
  K8sCluster: 'k8s',
  Git: 'git',
  Splunk: 'splunk',
  AppDynamics: 'appdynamics',
  Vault: 'vault',
  DockerRegistry: 'docker',
  Local: 'local',
  GcpKms: 'gcpkms',
  Gcp: 'gcp',
  Aws: 'aws',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  AwsKms: 'awskms',
  Artifactory: 'artifactory',
  Jira: 'jira',
  Nexus: 'nexus',
  Github: 'github',
  Gitlab: 'gitlab',
  Bitbucket: 'bitbucket',
  CEAws: 'ceaws',
  CEAzure: 'ceazure',
  CEK8sCluster: 'cek8s',
  Codecommit: 'codecommit',
  HttpHelmRepo: 'httphelmrepo',
  NewRelic: 'newrelic'
}

export const getSnippetTags = (
  entityType: GetYamlSchemaQueryParams['entityType'],
  entitySubType?: ConnectorInfoDTO['type'] | Module
): GetYamlSnippetMetadataQueryParams['tags'] => {
  const tags: GetYamlSnippetMetadataQueryParams['tags'] = []
  switch (entityType) {
    case 'Connectors': {
      tags.push('connector')
      const entitySubTypeTag = entitySubType && entitySubTypeToTagMap[entitySubType as ConnectorInfoDTO['type']]
      entitySubTypeTag && tags.push(entitySubTypeTag)
      break
    }
    case 'Secrets':
      tags.push('secret')
      break
    case 'Pipelines':
      tags.push('pipeline')
      if (entitySubType === 'ci') {
        tags.splice(0, 1)
      }
      break
    default:
  }
  return tags
}

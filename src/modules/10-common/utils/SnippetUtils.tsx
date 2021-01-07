import type { IconName } from '@wings-software/uicore'
import type {
  GetYamlSnippetMetadataQueryParams,
  GetYamlSchemaQueryParams,
  GetYamlSchemaForSubtypeQueryParams
} from 'services/cd-ng'

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

export const getSnippetTags = (
  entityType: GetYamlSchemaQueryParams['entityType'],
  entitySubType?: GetYamlSchemaForSubtypeQueryParams['subtype']
): GetYamlSnippetMetadataQueryParams['tags'] => {
  const tags: GetYamlSnippetMetadataQueryParams['tags'] = []
  switch (entityType) {
    case 'Connectors':
      tags.push('connector')
      switch (entitySubType) {
        case 'K8sCluster':
          tags.push('k8s')
          break
        case 'DockerRegistry':
          tags.push('docker')
          break
        case 'Git':
          tags.push('git')
          break
      }
      break
    case 'Secrets':
      tags.push('secret')
      break
    default:
  }
  return tags
}

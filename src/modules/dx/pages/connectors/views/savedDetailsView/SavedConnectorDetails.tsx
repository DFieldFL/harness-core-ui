import React from 'react'
import { Layout, Tag, Text, Color } from '@wings-software/uikit'
import { Connectors } from 'modules/dx/constants'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { DelegateTypes } from '../../Forms/KubeFormInterfaces'
import { getLabelForAuthType } from '../../utils/ConnectorHelper'
import i18n from './SavedConnectorDetails.i18n'

interface SavedConnectorDetailsProps {
  connector: ConnectorConfigDTO
}
const getLabelByType = (type: string) => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return i18n.NAME_LABEL.Kubernetes
    case Connectors.GIT:
      return i18n.NAME_LABEL.GIT
    case Connectors.DOCKER:
      return i18n.NAME_LABEL.Docker
    case Connectors.APP_DYNAMICS:
      return i18n.NAME_LABEL.AppDynamics
    case Connectors.SPLUNK:
      return i18n.NAME_LABEL.Splunk
    case Connectors.SECRET_MANAGER:
      return i18n.NAME_LABEL.SecretManager
    default:
      return ''
  }
}
const getKubernetesSchema = (connector: ConnectorConfigDTO) => {
  return [
    {
      label: i18n.k8sCluster.connectionMode,
      value:
        connector?.spec?.type === DelegateTypes.DELEGATE_IN_CLUSTER
          ? i18n.k8sCluster.delegateInCluster
          : i18n.k8sCluster.delegateOutCluster
    },
    {
      label: i18n.k8sCluster.delegateName,
      value: connector.spec?.spec?.delegateName
    },
    {
      label: i18n.k8sCluster.masterUrl,
      value: connector?.spec?.spec?.masterUrl
    },
    {
      label: i18n.k8sCluster.credType,
      value: getLabelForAuthType(connector?.spec?.spec?.auth?.type)
    },
    {
      label: i18n.k8sCluster.identityProviderUrl,
      value: connector?.spec?.spec?.auth?.spec?.oidcIssuerUrl
    },
    {
      label: i18n.k8sCluster.username,
      value: connector?.spec?.spec?.auth?.spec?.username || connector?.spec?.spec?.auth?.spec?.oidcUsername
    },
    {
      label: i18n.k8sCluster.password,
      value:
        connector?.spec?.spec?.auth?.spec?.passwordRef || connector?.spec?.spec?.auth?.spec?.oidcPasswordRef
          ? i18n.k8sCluster.encrypted
          : null
    },
    {
      label: i18n.k8sCluster.serviceAccountToken,
      value: connector?.spec?.spec?.auth?.spec?.serviceAccountTokenRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.k8sCluster.oidcClientId,
      value: connector?.spec?.spec?.auth?.spec?.oidcClientIdRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.k8sCluster.clientSecret,
      value: connector?.spec?.spec?.auth?.spec?.oidcSecretRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.k8sCluster.oidcScopes,
      value: connector?.spec?.spec?.auth?.spec?.oidcScopes
    },

    {
      label: i18n.k8sCluster.clientKey,
      value: connector?.spec?.spec?.auth?.spec?.clientKeyRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.k8sCluster.clientCert,
      value: connector?.spec?.spec?.auth?.spec?.clientCertRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.k8sCluster.clientKeyPassphrase,
      value: connector?.spec?.spec?.auth?.spec?.clientKeyPassphraseRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.k8sCluster.clientAlgo,
      value: connector?.spec?.spec?.auth?.spec?.clientKeyAlgo
    }
  ]
}

const getGITSchema = (connector: ConnectorConfigDTO) => {
  return [
    {
      label: i18n.GIT.configure,
      value: connector?.spec?.connectionType
    },
    {
      label: i18n.GIT.connection,
      value: connector.spec?.type === 'Http' ? i18n.GIT.HTTP : i18n.GIT.SSH
    },
    {
      label: i18n.GIT.url,
      value: connector?.spec?.url
    },

    {
      label: i18n.GIT.username,
      value: connector?.spec?.spec?.username
    },
    {
      label: i18n.GIT.password,
      value: connector?.spec?.spec?.passwordRef ? i18n.k8sCluster.encrypted : null
    },
    {
      label: i18n.GIT.sshKey,
      value: connector?.spec?.spec?.sshKeyRef ? i18n.k8sCluster.encrypted : null
    }
  ]
}

const getDockerSchema = (connector: ConnectorConfigDTO) => {
  return [
    {
      label: i18n.Docker.dockerRegistryURL,
      value: connector?.spec?.dockerRegistryUrl
    },
    {
      label: i18n.k8sCluster.credType,
      value: getLabelForAuthType(connector?.spec?.auth?.type)
    },
    {
      label: i18n.Docker.username,
      value: connector?.spec?.auth?.spec?.username
    },
    {
      label: i18n.Docker.password,
      value: connector?.spec?.auth?.spec?.passwordRef ? i18n.k8sCluster.encrypted : null
    }
  ]
}
const getSchemaByType = (connector: ConnectorConfigDTO, type: string) => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return getKubernetesSchema(connector)
    case Connectors.GIT:
      return getGITSchema(connector)
    case Connectors.DOCKER:
      return getDockerSchema(connector)
    default:
      return []
  }
}

const getSchema = (props: SavedConnectorDetailsProps) => {
  const { connector } = props
  return [
    {
      label: getLabelByType(connector?.type),
      value: connector?.name
    },
    {
      label: i18n.description,
      value: connector?.description
    },
    {
      label: i18n.identifier,
      value: connector?.identifier
    },
    {
      label: i18n.tags,
      value: connector?.tags
    }
  ]
}

const renderTags = (value: string[]) => {
  return (
    <Layout.Horizontal spacing="small">
      {value.map((tag, index) => {
        return (
          <Tag minimal={true} key={tag + index}>
            {tag}
          </Tag>
        )
      })}
    </Layout.Horizontal>
  )
}

const SavedConnectorDetails = (props: SavedConnectorDetailsProps) => {
  const connectorDetailsSchema = getSchema(props).concat(getSchemaByType(props.connector, props.connector?.type) || [])

  return (
    <>
      {connectorDetailsSchema.map((item, index) => {
        if (item.value && (item.label === i18n.tags ? item.value?.length : true)) {
          return (
            <Layout.Vertical spacing="xsmall" margin={{ bottom: 'large' }} key={`${item.value}${index}`}>
              <Text font={{ size: 'small' }}>{item.label}</Text>
              {item.label === i18n.tags && typeof item.value === 'object' ? (
                renderTags(item.value)
              ) : (
                <Text color={item.value === 'encrypted' ? Color.GREY_350 : Color.BLACK}>{item.value}</Text>
              )}
            </Layout.Vertical>
          )
        }
      })}
    </>
  )
}
export default SavedConnectorDetails

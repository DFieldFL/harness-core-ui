import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Color, Layout, Text } from '@wings-software/uicore'
import {
  GetActiveInstancesByServiceIdEnvIdAndBuildIdsQueryParams,
  InstanceDetailsDTO,
  useGetActiveInstancesByServiceIdEnvIdAndBuildIds
} from 'services/cd-ng'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export type InstanceData = Record<string, Record<string, InstanceDetailsDTO[]>>

export interface ActiveServiceInstancePopoverProps {
  buildId?: string
  envId?: string
  instanceNum?: number
}

interface SectionProps {
  header: string
  values: {
    label: string
    value: string
  }[]
}

const Section: React.FC<{ data: SectionProps[] }> = props => {
  const { data } = props
  return (
    <Card className={css.activeServiceInstancePopover}>
      <Layout.Vertical>
        {data.map(item => {
          return (
            <Layout.Vertical key={item.header} className={css.activeServiceInstancePopoverSection}>
              <Text font={{ weight: 'semi-bold', size: 'small' }} margin={{ bottom: 'small' }} color={Color.GREY_800}>
                {item.header}
              </Text>
              <Layout.Vertical>
                {item.values.map(itemValue =>
                  itemValue.value ? (
                    <Layout.Horizontal key={itemValue.label}>
                      <Text
                        font={{ weight: 'semi-bold', size: 'small' }}
                        color={Color.GREY_500}
                        margin={{ right: 'medium', bottom: 'xsmall' }}
                      >
                        {`${itemValue.label}:`}
                      </Text>
                      <Text
                        font={{ weight: 'semi-bold', size: 'small' }}
                        color={Color.GREY_800}
                        className={css.sectionValue}
                      >
                        {itemValue.value}
                      </Text>
                    </Layout.Horizontal>
                  ) : (
                    <></>
                  )
                )}
              </Layout.Vertical>
            </Layout.Vertical>
          )
        })}
      </Layout.Vertical>
    </Card>
  )
}

export const ActiveServiceInstancePopover: React.FC<ActiveServiceInstancePopoverProps> = props => {
  const { buildId = '', envId = '', instanceNum = 0 } = props
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { getString } = useStrings()

  const queryParams: GetActiveInstancesByServiceIdEnvIdAndBuildIdsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    envId,
    buildIds: [buildId]
  }
  const { loading, data, error } = useGetActiveInstancesByServiceIdEnvIdAndBuildIds({
    queryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  if (loading || error || !data?.data?.instancesByBuildIdList?.[0]?.instances?.length) {
    return <></>
  }

  const instanceData = data?.data?.instancesByBuildIdList?.[0]?.instances[instanceNum] || {}

  const sectionData: SectionProps[] = [
    {
      header: getString('cd.serviceDashboard.instanceDetails'),
      values: [
        {
          label: getString('cd.serviceDashboard.pod'),
          value: instanceData.podName || ''
        },
        {
          label: getString('cd.serviceDashboard.artifact'),
          value: instanceData.artifactName || ''
        }
      ]
    },
    {
      header: getString('infrastructureText'),
      values: Object.keys(instanceData.infrastructureDetails || {}).map(infrastructureDetailsKey => ({
        label: infrastructureDetailsKey,
        value: instanceData.infrastructureDetails?.[infrastructureDetailsKey]
      }))
    },
    {
      header: getString('deploymentText'),
      values: [
        {
          label: getString('cd.serviceDashboard.deployedAt'),
          value: instanceData.deployedAt
        },
        {
          label: getString('cd.serviceDashboard.deployedBy'),
          value: instanceData.deployedByName
        },
        {
          label: getString('common.pipeline'),
          value: instanceData.pipelineExecutionName
        }
      ]
    }
  ]

  return <Section data={sectionData}></Section>
}

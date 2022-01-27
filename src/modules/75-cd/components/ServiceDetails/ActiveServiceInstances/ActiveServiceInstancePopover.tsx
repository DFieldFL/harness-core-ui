/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Color, Layout, Text } from '@wings-software/uicore'
import {
  GetActiveInstancesByServiceIdEnvIdAndBuildIdsQueryParams,
  InstanceDetailsDTO,
  NativeHelmInstanceInfoDTO,
  useGetActiveInstancesByServiceIdEnvIdAndBuildIds
} from 'services/cd-ng'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { getReadableDateTime } from '@common/utils/dateUtils'
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
          value: getReadableDateTime(instanceData.deployedAt, 'MMM DD, YYYY hh:mm a')
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
  if ((instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO)?.helmChartInfo) {
    sectionData.push({
      header: getString('cd.serviceDashboard.helmChartDetails'),
      values: [
        {
          label: getString('cd.serviceDashboard.helmChartName'),
          value: (instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO).helmChartInfo?.name as string
        },
        {
          label: getString('cd.serviceDashboard.helmRopoUrl'),
          value: (instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO).helmChartInfo?.repoUrl as string
        },
        {
          label: getString('helmVersion'),
          value: (instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO).helmChartInfo?.version as string
        }
      ]
    })
  }
  return <Section data={sectionData}></Section>
}

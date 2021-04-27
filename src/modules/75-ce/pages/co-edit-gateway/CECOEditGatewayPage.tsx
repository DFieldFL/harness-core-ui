import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty } from 'lodash-es'
import COGatewayDetails from '@ce/components/COGatewayDetails/COGatewayDetails'
import type { GatewayDetails, Routing, InstanceDetails } from '@ce/components/COCreateGateway/models'
import {
  HealthCheck,
  PortConfig,
  Service,
  ServiceDep,
  ServiceMetadata,
  useAllServiceResources,
  useRouteDetails
} from 'services/lw'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const CECOEditGatewayPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, gatewayIdentifier } = useParams<
    ProjectPathProps & { gatewayIdentifier: string }
  >()

  const { data, loading } = useRouteDetails({
    org_id: orgIdentifier,
    project_id: projectIdentifier,
    service_id: (gatewayIdentifier as unknown) as number
  })
  const { data: resources, loading: resourcesLoading } = useAllServiceResources({
    org_id: orgIdentifier,
    project_id: projectIdentifier,
    service_id: (gatewayIdentifier as unknown) as number,
    debounce: 300
  })

  const [gatewayDetails, setGatewayDetails] = useState<GatewayDetails>()
  useEffect(() => {
    if (loading || resourcesLoading) return
    const service = data?.response?.service as Service
    const deps = data?.response?.deps as ServiceDep[]
    const hasAsg = !_isEmpty(service.routing?.instance?.scale_group)
    const routing: Routing = {
      instance: { filterText: service.routing?.instance?.filter_text as string },
      ports: service.routing?.ports as PortConfig[],
      lb: ''
    }
    let selectedInstances: InstanceDetails[] = []
    if (hasAsg) {
      routing.instance.scale_group = service.routing?.instance?.scale_group // eslint-disable-line
    } else {
      const selectedResources = resources?.response ? resources?.response : []
      selectedInstances = selectedResources.map(item => {
        return {
          name: item.name ? item.name : '',
          id: item.id ? item.id : '',
          ipv4: item.ipv4 ? item.ipv4[0] : '',
          region: item.region ? item.region : '',
          type: item.type ? item.type : '',
          tags: '',
          launch_time: item.launch_time ? item.launch_time : '', // eslint-disable-line
          status: item.status ? item.status : '',
          vpc: item.metadata ? item.metadata['VpcID'] : ''
        }
      })
    }
    const gwDetails: GatewayDetails = {
      id: service.id,
      name: service.name,
      idleTimeMins: service.idle_time_mins as number,
      fullfilment: service.fulfilment,
      filter: service.routing?.instance?.filter_text as string,
      kind: service.kind,
      healthCheck: service.health_check as HealthCheck,
      hostName: service.host_name,
      routing,
      opts: {
        preservePrivateIP: service.opts?.preserve_private_ip as boolean,
        deleteCloudResources: service.opts?.delete_cloud_resources as boolean,
        alwaysUsePrivateIP: service.opts?.always_use_private_ip as boolean
      },
      provider: {
        name: 'aws',
        icon: 'service-aws',
        value: 'aws'
      }, //TODO take from a master list when on boarding azure or do
      selectedInstances: selectedInstances,
      accessPointID: service.access_point_id as string,
      accountID: accountId,
      orgID: orgIdentifier,
      projectID: projectIdentifier,
      cloudAccount: {
        id: service.cloud_account_id,
        name: service.metadata?.cloud_provider_details?.name as string
      },
      metadata: service.metadata as ServiceMetadata,
      customDomains: service.custom_domains,
      deps: deps
    }
    setGatewayDetails(gwDetails)
  }, [data, resources])

  return (
    <>
      {!loading && !resourcesLoading && gatewayDetails ? (
        <COGatewayDetails
          gatewayDetails={gatewayDetails as GatewayDetails}
          setGatewayDetails={setGatewayDetails}
          previousTab={() => undefined}
        />
      ) : (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
    </>
  )
}

export default CECOEditGatewayPage

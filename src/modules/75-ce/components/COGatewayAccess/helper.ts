/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import type { AccessPoint, AccessPointCore, GCPAccessPointCore } from 'services/lw'
import type { ConnectionMetadata, GatewayDetails } from '../COCreateGateway/models'

export const getSelectedTabId = (accessDetails: ConnectionMetadata): string => {
  const accessDetailsToTabIdMap: Record<string, string> = {
    dnsLink: 'dns',
    ssh: 'ssh',
    ipaddress: 'ip',
    rdp: 'rdp',
    backgroundTasks: 'bg'
  }
  const key = Object.entries(accessDetails).find(([, d]) => d.selected)?.[0]
  return key ? accessDetailsToTabIdMap[key] : ''
}

export const getValidStatusForDnsLink = (gatewayDetails: GatewayDetails): boolean => {
  let validStatus = true
  // check for custom domains validation
  if (gatewayDetails.customDomains?.length) {
    validStatus = gatewayDetails.customDomains.every(url =>
      url.match(
        /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
      )
    )
    if (
      !gatewayDetails.routing.custom_domain_providers?.others &&
      !gatewayDetails.routing.custom_domain_providers?.route53?.hosted_zone_id
    ) {
      validStatus = false
    }
  }
  // checck for valid access point selected
  if (_isEmpty(gatewayDetails.accessPointID)) {
    validStatus = false
  }

  // check for routing ports
  if (validStatus && _isEmpty(gatewayDetails.routing.container_svc) && _isEmpty(gatewayDetails.routing.ports)) {
    validStatus = false
  }
  return validStatus
}

export const getHelpText = (selectedTabId: string) => {
  let helpTextBase = 'setup-access'
  if (selectedTabId !== '') {
    helpTextBase = `${helpTextBase}-${selectedTabId}`
  }
  return helpTextBase
}

export const getDummySupportedResourceFromAG = (ag: AccessPoint): AccessPointCore => {
  return {
    type: 'app_gateway',
    details: {
      fe_ip_id: ag.metadata?.fe_ip_id,
      id: ag.id,
      name: ag.name,
      region: ag.region,
      resource_group: ag.metadata?.resource_group,
      size: ag.metadata?.size,
      subnet_id: ag.metadata?.subnet_id,
      vpc: ag.vpc
    }
  }
}

export const getDummySupportedResourceFromALB = (alb: AccessPoint): AccessPointCore => {
  return {
    type: 'alb',
    details: {
      albARN: alb.metadata?.albArn,
      name: alb.name,
      security_groups: alb.security_groups,
      vpc: alb.vpc
    }
  }
}

export const getDummyGcpSupportedResourceFromLb = (lb: AccessPoint): AccessPointCore => {
  return {
    type: 'envoy',
    details: {
      id: lb.id,
      // "instanceId": 2740445792372081000,
      name: lb.name,
      security_groups: lb.metadata?.security_groups,
      subnet: lb.metadata?.subnet_name,
      vpc: lb.vpc,
      zone: lb.metadata?.zone
    }
  }
}

export const getGcpApFromLoadBalancer = (gatewayDetails: GatewayDetails, accountId: string, lb?: AccessPointCore) => {
  return {
    cloud_account_id: gatewayDetails.cloudAccount.id,
    account_id: accountId,
    region: _defaultTo(gatewayDetails.selectedInstances?.[0]?.region, ''),
    vpc: (lb?.details as GCPAccessPointCore)?.vpc,
    metadata: {
      zone: _defaultTo(gatewayDetails.selectedInstances[0].metadata?.availabilityZone, ''),
      security_groups: (lb?.details as GCPAccessPointCore)?.security_groups,
      subnet: (lb?.details as GCPAccessPointCore)?.subnet
    }
  }
}

import xhr from '@wings-software/xhr-async'
import type { RestResponsePageResponseSettingAttribute } from '@wings-software/swagger-ts/definitions'
import type { ServiceResponse } from 'modules/common/services/ServiceResponse'

const Endpoints = {
  fetchServices: (appId: string, accId: string) => `cd/api/services?accountId=${accId}&appId=${appId}`,
  createService: (accId: string) => `cd/api/services?accountId=${accId}`,
  fetchEnvironments: (accId: string) => `cd/api/environments?accountId=${accId}`,
  createEnvironment: (accId: string) => `cd/api/environments?accountId=${accId}`,
  fetchConnectors: (accountId: string) =>
    `/api/settings?&accountId=${accountId}&search[0][field]=category&search[0][op]=IN&search[0][value]=CONNECTOR`
}

export async function fetchServices(appId: string, group = 'XHR_SERVICES_GROUP', accId: string): ServiceResponse<any> {
  return await xhr.get(Endpoints.fetchServices(appId, accId), { group }).as('services')
}

export async function createService(
  identifier: string,
  accId: string,
  orgIdentifier: string,
  projectIdentifier: string,
  group = 'XHR_SERVICES_GROUP'
) {
  return await xhr.post(Endpoints.createService(accId), {
    group,
    data: {
      identifier,
      orgIdentifier,
      projectIdentifier
    }
  })
}

export async function fetchEnvironments(accId: string, group = 'XHR_SERVICES_GROUP'): ServiceResponse<any> {
  return await xhr.get(Endpoints.fetchEnvironments(accId), { group }).as('environments')
}

export async function createEnvironment(
  identifier: string,
  accId: string,
  orgIdentifier: string,
  projectIdentifier: string,
  group = 'XHR_SERVICES_GROUP'
) {
  return await xhr.post(Endpoints.createEnvironment(accId), {
    group,
    data: {
      identifier,
      orgIdentifier,
      projectIdentifier
    }
  })
}

export async function fetchConnectors(accountId: string): ServiceResponse<RestResponsePageResponseSettingAttribute> {
  return await xhr.get(Endpoints.fetchConnectors(accountId))
}

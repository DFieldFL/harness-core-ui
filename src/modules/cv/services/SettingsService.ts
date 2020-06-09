import xhr from '@wings-software/xhr-async'
import type { ResponseWrapper } from 'modules/common/utils/HelperTypes'
import type {
  RestResponsePageResponseService,
  RestResponsePageResponseSettingAttribute
} from '@wings-software/swagger-ts/definitions'

const Endpoints = {
  fetchServices: (appId: string, accId: string) =>
    `https://localhost:9090/api/services?accountId=${accId}&appId=${appId}`,
  fetchConnectors: (accountId: string) =>
    `https://localhost:9090/api/settings?&accountId=${accountId}&search[0][field]=category&search[0][op]=IN&search[0][value]=CONNECTOR`
}

export async function fetchServices(
  appId: string,
  group = 'XHR_SERVICES_GROUP',
  accId: string
): Promise<ResponseWrapper<RestResponsePageResponseService>> {
  return await xhr.get(Endpoints.fetchServices(appId, accId), { group }).as('services')
}

export async function fetchConnectors(
  accountId: string
): Promise<ResponseWrapper<RestResponsePageResponseSettingAttribute>> {
  return await xhr.get(Endpoints.fetchConnectors(accountId))
}

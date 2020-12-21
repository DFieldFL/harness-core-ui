import type { DSConfig } from '@wings-software/swagger-ts/definitions'
import type { AdditionalInfo } from 'services/cv'

export const CVProviders = {
  APP_DYNAMICS: {
    value: 'APP_DYNAMICS',
    label: 'AppDynamics'
  },
  SPLUNK: {
    value: 'SPLUNK',
    label: 'Splunk'
  }
}

export const RouteVerificationTypeToVerificationType: { [routeType: string]: DSConfig['type'] } = {
  'app-dynamics': 'APP_DYNAMICS',
  splunk: 'SPLUNK'
}

export const VerificationTypeToRouteVerificationType: { [type: string]: string } = {
  APP_DYNAMICS: 'app-dynamics',
  SPLUNK: 'splunk'
}

export const VerificationJobType: { [key: string]: AdditionalInfo['type'] } = {
  TEST: 'TEST',
  CANARY: 'CANARY',
  BLUE_GREEN: 'BLUE_GREEN',
  HEALTH: 'HEALTH'
}

export const connectorId = '7BgBODXQQtuHI4M7hh9PLA' //'WWF95JcuQ-azSNbH4zt-XQ'
export const accountId = 'kmpySmUISimoRrJL6NL73w'
export const appId = '_ia5NKUCSoytYrZJMM15mQ' //t0-jbpLoR7S2BTsNfsk4Iw'
export const projectIdentifier = '12345'
export const SETUP_INDEXDB_ID = 'setupIndexDBid'

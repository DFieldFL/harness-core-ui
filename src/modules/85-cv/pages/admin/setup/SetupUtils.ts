export const getIconBySourceType = (type: string) => {
  switch (type) {
    case 'KUBERNETES':
      return 'service-kubernetes'
    case 'AppDynamics':
      return 'service-appdynamics'
    case 'HarnessCD_1.0':
      return 'cd-main'
    case 'STACKDRIVER':
      return 'service-stackdriver'
    case 'HEALTH':
      return 'health'
    case 'CANARY':
      return 'canary-outline'
    case 'BLUE_GREEN':
      return 'bluegreen'
    case 'TEST':
      return 'lab-test'
    default:
      return ''
  }
}

export const getCardLabelByType = (type: string) => {
  switch (type) {
    case 'HEALTH':
      return 'Health'
    case 'CANARY':
      return 'Canary'
    case 'BLUE_GREEN':
      return 'BlueGreen'
    case 'TEST':
      return 'Test'
    default:
      return ''
  }
}

export const getMonitoringSourceLabel = (type: string) => {
  switch (type) {
    case 'APP_DYNAMICS':
      return 'App Dynamics'
    case 'SPLUNK':
      return 'Splunk'
    case 'STACKDRIVER':
      return 'Google Cloud Operations'
    default:
      return ''
  }
}

export interface SetupIndexDBDataObject {
  name: string
  identifier: string
  type: string
  routeUrl: string
}

export interface SetupIndexDBData {
  monitoringSources: SetupIndexDBDataObject[]
  activitySources: SetupIndexDBDataObject[]
  verificationJobs: SetupIndexDBDataObject[]
}

export const Step = {
  CHANGE_SOURCE: 'CHANGE_SOURCE',
  MONITORING_SOURCE: 'MONITORING_SOURCE',
  VERIFICATION_JOBS: 'VERIFICATION_JOBS'
}

export const ONBOARDING_ENTITIES = Step

export interface BaseSetupTabsObject {
  name?: string
  identifier?: string
  sourceType?: 'CHANGE_SOURCE' | 'MONITORING_SOURCE' | 'VERIFICATION_JOBS'
  type?: string // Replace with types in apis
}

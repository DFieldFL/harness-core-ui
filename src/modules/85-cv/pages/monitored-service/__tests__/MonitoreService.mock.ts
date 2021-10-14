import { RiskValues } from '@cv/utils/CommonUtils'

export const yamlResponse = {
  metaData: {},
  resource:
    'monitoredService:\n  identifier:\n  type: Application\n  name:\n  desc:\n  projectIdentifier: Demo\n  orgIdentifier: default\n  serviceRef:\n  environmentRef:\n  sources:\n    healthSources:\n    changeSources:\n      - name: Harness CD\n        identifier: harness_cd\n        type: HarnessCD\n        desc: Deployments from Harness CD\n        enabled : true\n',
  responseMessages: []
}

export const rowData = {
  original: {
    name: 'Monitoring service 102',
    identifier: 'Monitoring_service_102',
    serviceRef: 'AppDService101',
    environmentRef: 'AppDTestEnv1',
    serviceName: 'ServiceName 1',
    environmentName: 'EnvironmentName 1',
    type: 'Application' as any,
    healthMonitoringEnabled: true,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
    },
    tags: { tag1: '', tag2: '', tag3: '' },
    currentHealthScore: { riskValue: 50, riskStatus: RiskValues.NEED_ATTENTION }
  }
}

export const changeSummary = {
  categoryCountMap: {
    Deployment: { count: 0, countInPrecedingWindow: 0 },
    Infrastructure: { count: 0, countInPrecedingWindow: 0 },
    Alert: { count: 0, countInPrecedingWindow: 0 }
  }
}

export const changeSummaryWithPositiveChange = {
  categoryCountMap: {
    Deployment: { count: 15, countInPrecedingWindow: 10 },
    Infrastructure: { count: 15, countInPrecedingWindow: 10 },
    Alert: { count: 15, countInPrecedingWindow: 10 }
  }
}

export const changeSummaryWithNegativeChange = {
  categoryCountMap: {
    Deployment: { count: 10, countInPrecedingWindow: 15 },
    Infrastructure: { count: 10, countInPrecedingWindow: 15 },
    Alert: { count: 10, countInPrecedingWindow: 15 }
  }
}

export const monitoredServicelist = {
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 10,
    content: [
      {
        name: 'delete me test',
        identifier: 'delete_me_test',
        serviceRef: 'AppDService',
        serviceName: 'ServiceName 1',
        environmentName: 'EnvironmentName 1',
        environmentRef: 'new_env_test',
        type: 'Application',
        healthMonitoringEnabled: true,
        historicalTrend: {
          healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
        },
        currentHealthScore: { riskValue: 10, riskStatus: RiskValues.HEALTHY }
      },
      {
        name: 'Monitoring service 102 new',
        identifier: 'Monitoring_service_101',
        serviceRef: 'AppDService101',
        environmentRef: 'AppDTestEnv1',
        serviceName: 'ServiceName 2',
        environmentName: 'EnvironmentName 2',
        type: 'Application',
        healthMonitoringEnabled: true,
        historicalTrend: {
          healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
        },
        tags: { tag1: '', tag2: '', tag3: '' },
        currentHealthScore: { riskValue: 50, riskStatus: RiskValues.NEED_ATTENTION }
      },
      {
        name: 'new monitored service 101',
        identifier: 'dadadasd',
        serviceRef: 'test_service',
        environmentRef: 'AppDTestEnv2',
        serviceName: 'ServiceName 3',
        environmentName: 'EnvironmentName 3',
        type: 'Application',
        healthMonitoringEnabled: true,
        historicalTrend: {
          healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
        },
        currentHealthScore: { riskValue: 90, riskStatus: RiskValues.UNHEALTHY }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const mockDeleteData = {
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 10,
    content: [
      {
        name: 'Monitoring service 102 new',
        identifier: 'Monitoring_service_101',
        serviceRef: 'AppDService101',
        environmentRef: 'AppDTestEnv1',
        serviceName: 'ServiceName 2',
        environmentName: 'EnvironmentName 2',
        type: 'Application',
        healthMonitoringEnabled: true,
        historicalTrend: {
          healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
        },
        tags: { tag1: '', tag2: '', tag3: '' },
        currentHealthScore: { riskValue: 50, riskStatus: RiskValues.NEED_ATTENTION }
      },
      {
        name: 'new monitored service 101',
        identifier: 'dadadasd',
        serviceRef: 'test_service',
        environmentRef: 'AppDTestEnv2',
        serviceName: 'ServiceName 3',
        environmentName: 'EnvironmentName 3',
        type: 'Application',
        healthMonitoringEnabled: true,
        historicalTrend: {
          healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
        },
        currentHealthScore: { riskValue: 90, riskStatus: RiskValues.UNHEALTHY }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const graphData = {
  metaData: {},
  resource: {
    nodes: [
      {
        serviceRef: 'service300',
        environmentRef: 'env300',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0,
        identifierRef: 'service300_env300'
      },
      {
        serviceRef: 'service260',
        environmentRef: 'env260',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0,
        identifierRef: 'service260_env260'
      }
    ],
    edges: [
      {
        from: 'service300_env300',
        to: 'service260_env260'
      }
    ]
  },
  responseMessages: []
}

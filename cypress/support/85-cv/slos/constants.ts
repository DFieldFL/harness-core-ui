/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const projectIdentifier = 'project1'
const orgIdentifier = 'default'
const healthSource = 'appd_cvng_prod'
const accountId = 'accountId'

export const getUserJourneysCall = `/cv/api/user-journey?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&offset=0&pageSize=100`
export const listSLOsCall = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4`
export const listMonitoredServices = `/cv/api/monitored-service/all/time-series-health-sources?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getSLOMetrics = `/cv/api/monitored-service/cvng_prod/health-source/${healthSource}/slo-metrics?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getSliGraph = `/cv/api/monitored-service/cvng_prod/sli/onboarding-graph?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getServiceLevelObjective = `/cv/api/slo/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getServiceLevelObjectivesRiskCount = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getMonitoredService = `/cv/api/monitored-service/cvng_prod?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const deleteSLOData = `/cv/api/slo/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const saveSLO = `/cv/api/slo?routingId=${accountId}&accountId=${accountId}`

export const listSLOsCallResponse = {
  status: 'SUCCESS',
  data: { totalPages: 0, totalItems: 0, pageItemCount: 0, pageSize: 4, content: [], pageIndex: 0, empty: false },
  metaData: null,
  correlationId: '6a558a73-53e9-4b5a-9700-cbfcd64e87ad'
}

export const listUserJourneysCallResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        createdAt: 1641461279691,
        lastModifiedAt: 1641461279691,
        userJourney: { identifier: 'newone', name: 'new-one' }
      },
      {
        createdAt: 1641461279691,
        lastModifiedAt: 1641461279691,
        userJourney: { identifier: 'Second_Journey', name: 'Second Journey' }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '241de3a2-d84a-48fa-8e7b-06d7217e489d'
}

export const listMonitoredServicesCallResponse = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'cvng_prod',
      name: 'cvng_prod',
      healthSources: [
        { name: 'appd_manager', identifier: 'appd_manager' },
        { name: 'appd_cvng_prod', identifier: 'appd_cvng_prod' },
        { name: 'New Relic Health source', identifier: 'New_Relic_Health_source' }
      ]
    },
    {
      identifier: 'cvng_dev',
      name: 'cvng_dev',
      healthSources: [{ name: 'appd_cvng_dev', identifier: 'appd_cvng_dev' }]
    }
  ],
  metaData: null,
  correlationId: 'fe6686a2-cd9e-45e1-bca4-2cc86285eb82'
}

export const listSLOMetricsCallResponse = {
  metaData: {},
  resource: [
    { identifier: 'number_of_slow_calls', metricName: 'number_of_slow_calls' },
    { identifier: 'https_errors_per_min', metricName: 'https_errors_per_min' }
  ],
  responseMessages: []
}

export const updatedListSLOsCallResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 4,
    content: [
      {
        sloIdentifier: 'SLO1',
        title: 'SLO-1',
        monitoredServiceIdentifier: 'cvng_prod',
        monitoredServiceName: 'cvng_prod',
        healthSourceIdentifier: 'appd_cvng_prod',
        healthSourceName: 'appd_cvng_prod',
        serviceIdentifier: 'cvng',
        environmentIdentifier: 'prod',
        environmentName: 'prod',
        serviceName: 'cvng',
        tags: {},
        type: 'Latency',
        burnRate: {
          currentRatePercentage: 138.44167025398193
        },
        timeRemainingDays: 6,
        errorBudgetRemainingPercentage: 100,
        errorBudgetRemaining: 104,
        totalErrorBudget: 104,
        sloTargetType: 'Rolling',
        currentPeriodLengthDays: 7,
        currentPeriodStartTime: 1641364526709,
        currentPeriodEndTime: 1641450926709,
        sloTargetPercentage: 99,
        errorBudgetBurndown: [
          { timestamp: 1641407726709, value: 100 },
          { timestamp: 1641450926709, value: 100 }
        ],
        sloPerformanceTrend: [
          { timestamp: 1641407726709, value: 100 },
          { timestamp: 1641450926709, value: 100 }
        ],
        errorBudgetRisk: 'HEALTHY',
        recalculatingSLI: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '95d58b07-33b2-4501-8d6c-71bfd140bba1'
}

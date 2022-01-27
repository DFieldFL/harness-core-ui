/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const metricName = 'CustomHealth Metric 101'
const jsonPath = '$.series.[*].pointlist.[*]'

export const mappedMetric = new Map()
const emptyMappedValue = {
  baseURL: '',
  endTime: {
    customTimestampFormat: '',
    placeholder: '',
    timestampFormat: 'SECONDS'
  },
  identifier: '',
  metricIdentifier: '',
  metricName: 'CustomHealth Metric',
  metricValue: '',
  pathURL: '',
  query: '',
  queryType: undefined,
  requestMethod: undefined,
  serviceInstancePath: '',
  startTime: {
    customTimestampFormat: '',
    placeholder: '',
    timestampFormat: 'SECONDS'
  },
  timestamp: '',
  timestampFormat: ''
}
mappedMetric.set('CustomHealth Metric', emptyMappedValue)

export const transformedSetupSource = {
  connectorRef: undefined,
  healthSourceIdentifier: undefined,
  healthSourceName: undefined,
  isEdit: false,
  mappedServicesAndEnvs: mappedMetric
}

export const mappedValue = {
  metricName,
  metricIdentifier: 'CustomHealthMetric101',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  riskCategory: 'Errors/ERROR',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  queryType: 'SERVICE_BASED',
  requestMethod: 'POST',
  query: 'Select * from ',
  baseURL: '',
  pathURL:
    'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
  metricValue: jsonPath,
  timestamp: jsonPath,
  timestampFormat: 'MMMM DD YY',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
  endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' }
}

export const customHealthSourceData = {
  name: 'customHealthDatadog',
  identifier: 'customHealthDatadog',
  type: 'CustomHealth' as any,
  spec: {
    metricDefinitions: [
      {
        metricName: 'metric110',
        identifier: 'metric110',
        groupName: 'group1',
        queryType: 'SERVICE_BASED',
        urlPath: 'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)',
        method: 'GET',
        startTime: {
          placeholder: 'start_time_seconds',
          timestampFormat: 'SECONDS'
        },
        endTime: {
          placeholder: 'end_time_seconds',
          timestampFormat: 'SECONDS'
        },
        metricResponseMapping: {
          metricValueJsonPath: 'series[*].pointlist[*].[1]',
          timestampJsonPath: 'series[*].pointlist[*].[0]'
        }
      }
    ]
  }
}

export const mocksampledata = {
  status: 'SUCCESS',
  data: {
    total: {
      results: [{ average: 0.0026334715948905796 }],
      beginTimeSeconds: 1.63974324e9,
      endTimeSeconds: 1.63974504e9,
      inspectedCount: 30.0
    },
    timeSeries: [
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974324e9,
        endTimeSeconds: 1.6397433e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.0030637369491159916 }],
        beginTimeSeconds: 1.6397433e9,
        endTimeSeconds: 1.63974336e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.0030637369491159916 }],
        beginTimeSeconds: 1.63974336e9,
        endTimeSeconds: 1.63974342e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974342e9,
        endTimeSeconds: 1.63974348e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974348e9,
        endTimeSeconds: 1.63974354e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974354e9,
        endTimeSeconds: 1.6397436e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397436e9,
        endTimeSeconds: 1.63974366e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.001387411030009389 }],
        beginTimeSeconds: 1.63974366e9,
        endTimeSeconds: 1.63974372e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974372e9,
        endTimeSeconds: 1.63974378e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974378e9,
        endTimeSeconds: 1.63974384e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974384e9,
        endTimeSeconds: 1.6397439e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397439e9,
        endTimeSeconds: 1.63974396e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974396e9,
        endTimeSeconds: 1.63974402e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974402e9,
        endTimeSeconds: 1.63974408e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974408e9,
        endTimeSeconds: 1.63974414e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974414e9,
        endTimeSeconds: 1.6397442e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.002205845434218645 }],
        beginTimeSeconds: 1.6397442e9,
        endTimeSeconds: 1.63974426e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974426e9,
        endTimeSeconds: 1.63974432e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974432e9,
        endTimeSeconds: 1.63974438e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.004594903904944658 }],
        beginTimeSeconds: 1.63974438e9,
        endTimeSeconds: 1.63974444e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974444e9,
        endTimeSeconds: 1.6397445e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397445e9,
        endTimeSeconds: 1.63974456e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974456e9,
        endTimeSeconds: 1.63974462e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974462e9,
        endTimeSeconds: 1.63974468e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.002273146528750658 }],
        beginTimeSeconds: 1.63974468e9,
        endTimeSeconds: 1.63974474e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974474e9,
        endTimeSeconds: 1.6397448e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397448e9,
        endTimeSeconds: 1.63974486e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974486e9,
        endTimeSeconds: 1.63974492e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974492e9,
        endTimeSeconds: 1.63974498e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974498e9,
        endTimeSeconds: 1.63974504e9,
        inspectedCount: 1.0
      }
    ],
    performanceStats: {
      inspectedCount: 30.0,
      omittedCount: 0.0,
      matchCount: 30.0,
      wallClockTime: 145.0,
      matchedFromFileRead: 0.0,
      matchedViaCache: 0.0
    },
    metadata: {
      accounts: [1805869.0],
      eventTypes: ['Metric'],
      eventType: 'Metric',
      timeAggregations: ['raw metrics'],
      openEnded: false,
      beginTime: '2021-12-17T12:14:00Z',
      endTime: '2021-12-17T12:44:00Z',
      beginTimeMillis: 1.63974324e12,
      endTimeMillis: 1.63974504e12,
      rawSince: '1639743240000',
      rawUntil: '1639745040000',
      rawCompareWith: '',
      bucketSizeMillis: 60000.0,
      guid: '48d0cbe4-040c-fea2-b8a8-aba18a7a5d64',
      routerGuid: '48d0cbe4-040c-fea2-b8a8-aba18a7a5d64',
      messages: [],
      timeSeries: {
        messages: [],
        contents: [{ function: 'average', attribute: 'apm.service.transaction.duration', simple: true }]
      }
    }
  },
  metaData: null,
  correlationId: '1fe4535e-2665-483b-a23c-6096f20907b1'
}

export const mockedHealthSourcePayload = {
  identifier: 'New_Custom',
  name: 'New Custom',
  spec: {
    connectorRef: 'customhealth',
    metricDefinitions: [
      {
        analysis: {
          deploymentVerification: {
            enabled: false,
            serviceInstanceFieldName: 'serviceInstance'
          },
          liveMonitoring: {
            enabled: true
          },
          riskProfile: {
            category: 'Errors',
            metricType: 'ERROR',
            thresholdTypes: ['ACT_WHEN_HIGHER']
          }
        },
        endTime: {
          customTimestampFormat: '',
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        groupName: 'Group 1',
        identifier: 'CustomHealthMetric101',
        method: 'POST',
        metricName,
        metricResponseMapping: {
          metricValueJsonPath: jsonPath,
          serviceInstanceJsonPath: '',
          timestampFormat: 'MMMM DD YY',
          timestampJsonPath: jsonPath
        },
        queryType: 'SERVICE_BASED',
        requestBody: 'Select * from ',
        sli: {
          enabled: false
        },
        startTime: {
          customTimestampFormat: '',
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        },
        urlPath:
          'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations'
      }
    ]
  },
  type: 'CustomHealth'
}

export const noErrorValidatation = {
  metricName,
  metricIdentifier: 'CustomHealthMetric101',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  riskCategory: 'Errors/ERROR',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  queryType: 'SERVICE_BASED',
  requestMethod: 'POST',
  query: 'Select * from ',
  baseURL: '',
  pathURL:
    'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations?start_time=dfgdd&end_time=5433',
  metricValue: jsonPath,
  timestamp: jsonPath,
  timestampFormat: 'MMMM DD YY',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
  endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' }
}

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'New Custom',
      identifier: 'New_Custom',
      type: 'CustomHealth',
      spec: {
        connectorRef: 'customhealth',
        metricDefinitions: [
          {
            identifier: 'CustomHealthMetric101',
            metricName: 'CustomHealth Metric 101',
            riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: 'serviceInstance',
                serviceInstanceMetricPath: null
              },
              riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            sli: null,
            groupName: 'Group 1',
            queryType: 'SERVICE_BASED',
            urlPath:
              'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
            method: 'POST',
            requestBody: 'Select * from ',
            startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
            endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
            metricResponseMapping: {
              metricValueJsonPath: '$.series.[*].pointlist.[*]',
              timestampJsonPath: '$.series.[*].pointlist.[*]',
              serviceInstanceJsonPath: null,
              timestampFormat: 'MMMM DD YY'
            }
          }
        ]
      }
    }
  ],
  serviceRef: 'Service_101',
  environmentRef: 'QA',
  monitoredServiceRef: { name: 'Service_101_QA', identifier: 'Service_101_QA' },
  existingMetricDetails: {
    name: 'New Custom',
    identifier: 'New_Custom',
    type: 'CustomHealth',
    spec: {
      connectorRef: 'customhealth',
      metricDefinitions: [
        {
          identifier: 'CustomHealthMetric101',
          metricName: 'CustomHealth Metric 101',
          riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          analysis: {
            liveMonitoring: { enabled: true },
            deploymentVerification: {
              enabled: false,
              serviceInstanceFieldName: 'serviceInstance',
              serviceInstanceMetricPath: null
            },
            riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] }
          },
          sli: null,
          groupName: 'Group 1',
          queryType: 'SERVICE_BASED',
          urlPath:
            'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
          method: 'POST',
          requestBody: 'Select * from ',
          startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
          endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
          metricResponseMapping: {
            metricValueJsonPath: '$.series.[*].pointlist.[*]',
            timestampJsonPath: '$.series.[*].pointlist.[*]',
            serviceInstanceJsonPath: null,
            timestampFormat: 'MMMM DD YY'
          }
        }
      ]
    }
  },
  healthSourceName: 'New Custom',
  healthSourceIdentifier: 'New_Custom',
  sourceType: 'CustomHealth',
  connectorRef: 'customhealth',
  product: {}
}

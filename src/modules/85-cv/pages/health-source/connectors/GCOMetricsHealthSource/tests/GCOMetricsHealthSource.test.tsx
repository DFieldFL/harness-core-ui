/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { render, waitFor, fireEvent, act, screen } from '@testing-library/react'
import { fillAtForm, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { MetricDashboardWidgetNavProps } from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import * as cvService from 'services/cv'
import * as cdService from 'services/cd-ng'
import { GCOMetricsHealthSource } from '../GCOMetricsHealthSource'
import type { GCOMetricsHealthSourceProps } from '../GCOMetricsHealthSource.type'
import { FieldNames } from '../GCOMetricsHealthSource.constants'
import { GCOProduct } from '../../GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'

const MockQuery = `{}`
const MockQueryWithGroupBy = '{"sdfsdf": "groupByFields sdfs"}'
const MockSelectedMetricInfo = {
  query: '{"someQuery": "sdosdf"}',
  widgetName: 'widget_1',
  metric: 'metric_1'
}

const currentProduct = GCOProduct.CLOUD_METRICS
const MockParams = {
  accountId: '1234_accountId',
  projectIdentifier: '1234_projectid',
  orgIdentifier: '1234_orgId'
}

const MetricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: '9Xg2tjyAQCqcekCTVc_xtw',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [{ name: 'Errors', type: 'ERROR', path: null, validationPath: null, thresholds: [], included: false }],
      thresholds: null
    },
    {
      uuid: '5CBVKks3T4WLIpYtaNO58g',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Infrastructure',
      category: 'Infrastructure',
      metrics: [
        { name: 'Infrastructure', type: 'INFRA', path: null, validationPath: null, thresholds: [], included: false }
      ],
      thresholds: null
    },
    {
      uuid: 'NmTC-1wRSfmviaeu3n87Gw',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        { name: 'Response Time', type: 'RESP_TIME', path: null, validationPath: null, thresholds: [], included: false },
        { name: 'Other', type: 'ERROR', path: null, validationPath: null, thresholds: [], included: false },
        { name: 'Throughput', type: 'THROUGHPUT', path: null, validationPath: null, thresholds: [], included: false }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as any),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

const mockMetricDashboardWidgetNav = jest.fn()
jest.mock(
  '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.tsx',
  () => (props: MetricDashboardWidgetNavProps<any>) => {
    mockMetricDashboardWidgetNav(props)
    return <></>
  }
)

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const MockValidationResponse = {
  metaData: {},
  data: [
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    }
  ]
}

const MockValidationResponseWithMultipleTxns = {
  metaData: {},
  data: [
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_time',
      metricName: 'kubernetes.io/container/cpu/core_time',
      metricValue: 12.65,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_time',
      metricName: 'kubernetes.io/container/cpu/core_time/s',
      metricValue: 12.65,
      timestamp: 1607599980000
    }
  ]
}

function WrapperComponent({ data, onSubmit }: GCOMetricsHealthSourceProps) {
  return (
    <TestWrapper>
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <GCOMetricsHealthSource data={data} onSubmit={onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

const DefaultObject = {
  ...MockParams,
  identifier: 'MyGoogleCloudOperationsSource',
  product: currentProduct,
  name: 'MyGoogleCloudOperationsSource',
  selectedDashboards: [],
  selectedMetrics: new Map(),
  type: 'STACKDRIVER',
  mappedServicesAndEnvs: new Map(),
  isEdit: false
}

const initialData = {
  isEdit: false,
  healthSourceList: [
    {
      name: 'testing new latest',
      identifier: 'testing_new_latest',
      type: 'Prometheus',
      spec: {
        connectorRef: 'account.prometheus',
        metricDefinitions: [
          {
            identifier: 'myId',
            metricName: 'Prometheus Metric',
            riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: null
              },
              riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            sli: { enabled: false },
            query: 'count(ALERTS_FOR_STATE{alertname="alertname",alertname="alertname",alertstate="alertstate"})',
            groupName: 'ghjg',
            serviceInstanceFieldName: null,
            prometheusMetric: 'ALERTS_FOR_STATE',
            serviceFilter: [{ labelName: 'alertname', labelValue: 'alertname' }],
            envFilter: [{ labelName: 'alertname', labelValue: 'alertname' }],
            additionalFilters: [{ labelName: 'alertstate', labelValue: 'alertstate' }],
            aggregation: 'count',
            isManualQuery: false
          }
        ]
      }
    },
    {
      name: 'test',
      identifier: 'test',
      type: 'Prometheus',
      spec: {
        connectorRef: 'account.prometheus',
        metricDefinitions: [
          {
            identifier: 'myId',
            metricName: 'Prometheus Metric',
            riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: null
              },
              riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            sli: { enabled: false },
            query:
              'min(aggregator_openapi_v2_regeneration_count{apiservice="apiservice",beta_kubernetes_io_arch="beta_kubernetes_io_arch",alertstate="alertstate",app="app",app="app",beta_kubernetes_io_os="beta_kubernetes_io_os"})',
            groupName: 'check',
            serviceInstanceFieldName: null,
            prometheusMetric: 'aggregator_openapi_v2_regeneration_count',
            serviceFilter: [
              { labelName: 'apiservice', labelValue: 'apiservice' },
              { labelName: 'beta_kubernetes_io_arch', labelValue: 'beta_kubernetes_io_arch' }
            ],
            envFilter: [
              { labelName: 'alertstate', labelValue: 'alertstate' },
              { labelName: 'app', labelValue: 'app' }
            ],
            additionalFilters: [
              { labelName: 'app', labelValue: 'app' },
              { labelName: 'beta_kubernetes_io_os', labelValue: 'beta_kubernetes_io_os' }
            ],
            aggregation: 'min',
            isManualQuery: false
          }
        ]
      }
    },
    {
      type: 'Prometheus',
      identifier: 'jkljkl',
      name: 'jkljkl',
      spec: {
        connectorRef: 'account.prometheus',
        feature: 'apm',
        metricDefinitions: [
          {
            prometheusMetric: 'aggregator_openapi_v2_regeneration_count',
            metricName: 'Prometheus Metric',
            identifier: 'check',
            serviceFilter: [{ labelName: 'alertstate', labelValue: 'alertstate' }],
            isManualQuery: false,
            query: 'count(\n\taggregator_openapi_v2_regeneration_count\t{\n\n})',
            envFilter: [{ labelName: 'alertname', labelValue: 'alertname' }],
            additionalFilters: [{ labelName: '__name__', labelValue: '__name__' }],
            aggregation: 'count',
            groupName: 'fgh',
            sli: { enabled: false },
            analysis: {
              riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: false }
            }
          }
        ]
      }
    }
  ],
  serviceRef: 'service14',
  environmentRef: 'datadogtest',
  monitoredServiceRef: { name: 'service14_datadogtest', identifier: 'service14_datadogtest' },
  product: { value: 'Cloud Metrics', label: 'Cloud Metrics' },
  sourceType: 'Gcp',
  connectorRef: 'GCP',
  healthSourceName: 'ghjngh fgj f',
  healthSourceIdentifier: 'ghjngh_fgj_f',
  selectedDashboards: [
    {
      name: 'Delegate Perpetual Tasks - freemium',
      path: 'projects/778566137835/dashboards/081fe911-79e9-4d4e-9875-84b35e3f934d'
    }
  ]
}

describe('Unit tests for MapGCOMetricsToServices', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.spyOn(cvService, 'useGetMetricNames').mockReturnValue({ data: { data: [] } } as any)
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] } } as any)
  })
  beforeEach(() => {
    jest.clearAllMocks()
    const getEnvironmentSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    getEnvironmentSpy.mockReturnValue({
      data: {
        data: {
          content: [
            {
              accountId: 'kmpySmUISimoRrJL6NL73w',
              deleted: false,
              description: null,
              identifier: 'Qe',
              name: 'Qe',
              orgIdentifixer: 'harness_test',
              projectIdentifier: 'raghu_p',
              tags: {},
              type: 'PreProduction'
            }
          ]
        }
      }
    } as any)

    const getServiceSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    getServiceSpy.mockReturnValue({
      data: {
        data: {
          content: [
            {
              accountId: 'kmpySmUISimoRrJL6NL73w',
              deleted: false,
              description: null,
              identifier: 'verification',
              name: 'verification',
              orgIdentifier: 'harness_test',
              projectIdentifier: 'raghu_p',
              tags: {},
              version: 0
            }
          ]
        }
      }
    } as any)
  })

  test('Should show please Enter Query when ther is no query in the text area', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })

    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => {
      fireEvent.change(container.querySelector('textarea')!, { target: { value: '' } })
    })

    expect(container.querySelector('[data-icon="fullscreen"]')).not.toBeNull()

    expect(container.querySelector('[data-icon="main-notes"]')).not.toBeNull()
    expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.enterQueryForValidation')).not.toBeNull()
  })

  test('Ensure validation api is called on query input', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })

    expect(getByText('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')).toBeDefined()

    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    expect(getByText('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })

    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()

    act(() => {
      fireEvent.click(container.querySelector('[data-icon="fullscreen"]')!)
    })
    await waitFor(() => expect(document.body.querySelector('[data-testid="monaco-editor"]')).not.toBeNull())
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Ensure that when a metric is selected in the nav, the content in the form is rendered', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as UseGetReturn<any, unknown, any, unknown>)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(DefaultObject)} />
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const metricNav = container.querySelector('.metricWidgetNav')
    if (!metricNav) {
      throw Error('Metric nav was not rendered.')
    }

    fireEvent.click(metricNav)
    await waitFor(() =>
      expect(container.querySelector(`input[value="${MockSelectedMetricInfo.metric}"]`)).not.toBeNull()
    )
    expect(getByText(MockSelectedMetricInfo.widgetName)).not.toBeNull()

    fireEvent.click(getByText('submit'))
    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  test('Ensure that when validation api throws error or returns no data, correct content is displayed', async () => {
    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockRejectedValue({ data: { detailedMessage: 'mock error' } })
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as UseGetReturn<any, unknown, any, unknown>)

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const { container, getByText, rerender } = render(
      <WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />
    )

    // error case
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })
    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
    expect(container.querySelector('[class*="highcharts"]')).toBeNull()

    // no data case
    mutateMock.mockReturnValue(
      Promise.resolve({
        data: { data: [] }
      })
    )
    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)

    rerender(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)

    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: '{ "dsadd": "dsfs" }'
    })
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.noDataForQuery')))

    //retry api
    fireEvent.click(getByText('retry'))
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(3))
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('ensure metric name is updated and saved when user updates it for manual query', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: MetricPackResponse
    } as UseGetReturn<any, unknown, any, unknown>)
    const onSubmitMock = jest.fn()

    const { container } = render(<WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(DefaultObject)} />)

    // select metric option and fill out metric name in displayed modal
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const manualQueryOption = container.querySelector('.manualQuery')
    if (!manualQueryOption) {
      throw Error('manual query was not rendered.')
    }
    fireEvent.click(manualQueryOption)

    await waitFor(() =>
      expect(document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')).not.toBeNull()
    )
    const metricNameInput = document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')
    if (!metricNameInput) {
      throw Error('Metric name was not found.')
    }

    fireEvent.change(metricNameInput, { target: { value: 'solo-dolo' } })
    const buttons = document.body.querySelectorAll('[class*="buttonContainer"] button')
    if (!buttons) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(buttons[1])
    await waitFor(() =>
      expect(document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')).toBeNull()
    )
    await waitFor(() => expect(container.querySelector('input[value="metric_1"]')).not.toBeNull())

    await fillAtForm([
      { container, type: InputTypes.CHECKBOX, fieldId: 'continuousVerification', value: 'continuousVerification' }
    ])

    // fill out parts of the form
    await fillAtForm([
      { container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery },
      { container, type: InputTypes.RADIOS, fieldId: FieldNames.RISK_CATEGORY, value: 'Errors/ERROR' },
      { container, type: InputTypes.CHECKBOX, fieldId: FieldNames.HIGHER_BASELINE_DEVIATION, value: 'higher' }
    ])

    // enter service and environment values and tags
    const metricTagsInput = container.querySelector(
      '[class*="nameAndMetricTagContainer"] [data-id*="metricTags"] input'
    )
    if (!metricTagsInput) {
      throw Error('metric tags was not rendered.')
    }

    fireEvent.change(metricTagsInput, { target: { value: 'metricTag' } })
    await waitFor(() => expect(container.querySelector('input[value="metricTag"]')).not.toBeNull())

    const submitFormButton = container.querySelector('button[class*="nextButton"]')
    if (!submitFormButton) {
      throw Error('submit form button does not exist.')
    }

    fireEvent.click(submitFormButton)
  })

  test('Ensure that when too many metrics are returned for a groupBy query, validation is displayed', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponseWithMultipleTxns
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)

    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: MockQueryWithGroupBy
    })

    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })

    // assign a query with gruopByFields and ensure validation is there
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tooManyMetrics')).not.toBeNull()
    )

    // remove the groupByFields value and ensure validation message disappeared
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: MockQuery
    })
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(2))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()
    await waitFor(() => expect(container.querySelector('[class*="tooManyRecords"]')).toBeNull())
  })

  test('Ensure error is thrown when assign component has no service selected', async () => {
    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)
    fireEvent.click(getByText('submit'))
    // Error is show below sli checkbox
    await waitFor(() => expect(container.querySelector('div[data-id="sli-5"] .bp3-form-helper-text')).not.toBeNull())
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')).toBeInTheDocument()
    )
    await fillAtForm([
      { container, type: InputTypes.CHECKBOX, fieldId: 'continuousVerification', value: 'continuousVerification' }
    ])
    await waitFor(() => expect(container.querySelector('div[data-id="sli-5"] .bp3-form-helper-text')).toBeNull())
  })

  test('should render input with identifier field', () => {
    const onSubmitMock = jest.fn()
    const { container } = render(<WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(DefaultObject)} />)

    expect(screen.getByText(/^id$/i)).toBeInTheDocument()
    expect(container.querySelector('.InputWithIdentifier--txtNameContainer')).toBeInTheDocument()
  })
  test('should have initial value assigned', async () => {
    const onSubmitMock = jest.fn()
    render(<WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(initialData)} />)

    expect(screen.getByText(/cv.identifierPlaceholder/i)).toBeInTheDocument()
  })

  test('Ensure service instance field is displayed when clicking on continuous verification', async () => {
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(DefaultObject)} />
    )
    await waitFor(() => expect(getByText('cv.monitoredServices.continuousVerification')).not.toBeNull())
    fireEvent.click(getByText('cv.monitoredServices.continuousVerification'))
    await waitFor(() =>
      expect(container.querySelector(`input[name=${FieldNames.SERVICE_INSTANCE_FIELD}]`)).not.toBeNull()
    )

    fireEvent.click(getByText('cv.monitoredServices.continuousVerification'))
    await waitFor(() => expect(container.querySelector(`input[name=${FieldNames.SERVICE_INSTANCE_FIELD}]`)).toBeNull())
  })
})

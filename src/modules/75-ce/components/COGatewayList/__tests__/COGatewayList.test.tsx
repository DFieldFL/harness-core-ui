/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import * as lwServices from 'services/lw'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayList from '../COGatewayList'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }
const checkFeatureReturnMock = {
  enabled: true
}
const checkFeatureDisabledReturnMock = { featureEnabled: true, disabledFeatureName: null }

jest.mock('highcharts-react-official', () => () => <></>)

jest.mock('@common/hooks/useFeatures', () => {
  return {
    useFeature: () => {
      return checkFeatureReturnMock
    },
    useGetFirstDisabledFeature: () => {
      return checkFeatureDisabledReturnMock
    },
    useFeatures: () => {
      return { features: new Map<FeatureIdentifier, CheckFeatureReturn>() }
    }
  }
})

const listData = {
  response: [
    {
      id: 282,
      name: 'ravi-test-13',
      fulfilment: 'kubernetes',
      kind: 'k8s',
      cloud_account_id: 'Lightwing_Non_prod_old',
      idle_time_mins: 15,
      host_name: 'grateful-liger-c40gjtnsbqnjmr91f8n0.gateway.lightwing.io',
      custom_domains: null,
      match_all_subdomains: false,
      disabled: false,
      created_by: 'lv0euRhKRCyiXWzS7pOg6g',
      routing: {
        instance: null,
        lb: null,
        k8s: {
          RuleJson:
            '{"apiVersion":"lightwing.lightwing.io/v1","kind":"AutoStoppingRule","metadata":{"name":"ravi-test-13","annotations":{"harness.io/cloud-connector-id":"Lightwing_Non_prod_old","nginx.ingress.kubernetes.io/configuration-snippet":"more_set_input_headers \\"AutoStoppingRule: undefined-undefined-ravi-test-13\\";"}},"spec":{"idleTimeMins":15,"rules":[{"host":"caddyravi.cedevkubetest1.lightwingtest.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"caddy","port":{"number":80}}}}]}}]}}'
        },
        ports: []
      },
      health_check: {
        protocol: 'http',
        path: '/',
        port: 80,
        timeout: 30,
        id: ''
      },
      opts: {
        preserve_private_ip: false,
        delete_cloud_resources: false,
        always_use_private_ip: false
      },
      metadata: {
        custom_domain_providers: null,
        target_group_details: null,
        access_details: {
          backgroundTasks: {
            selected: false
          },
          dnsLink: {
            selected: false
          },
          ipaddress: {
            selected: false
          },
          rdp: {
            selected: false
          },
          ssh: {
            selected: false
          }
        },
        cloud_provider_details: {
          name: 'Lightwing Non prod old'
        },
        service_errors: null,
        kubernetes_connector_id: 'Ravi_test_14',
        health_check_details: null
      },
      access_point_id: null,
      status: 'created',
      created_at: '2021-07-28T07:40:38.420773Z',
      updated_at: '2021-07-28T07:40:38.420773Z',
      account_identifier: 'kmpySmUISimoRrJL6NL73w'
    }
  ]
}

const mockedCumulativeSavingsData = {
  actual_cost: [],
  days: [],
  potential_cost: [],
  savings: [],
  savings_percent: 0,
  total_active_services: 1,
  total_cost: 0,
  total_potential: 0,
  total_savings: 0
}

jest.mock('services/lw', () => ({
  useAllServiceResources: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false,
    error: null
  })),
  useGetServices: jest.fn().mockImplementation(() => ({
    data: listData,
    loading: false,
    error: null,
    refetch: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: listData,
        loading: false
      })
    )
  })),
  useHealthOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useRequestsOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useSavingsOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useGetServiceDiagnostics: jest.fn().mockImplementation(() => ({
    data: null
  })),
  useCumulativeServiceSavings: jest.fn().mockImplementation(() => ({
    data: { response: mockedCumulativeSavingsData },
    loading: false
  })),
  useToggleAutostoppingRule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDeleteService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useGatewaySessionReport: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve(() => jest.fn()) })),
  useListStaticSchedules: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    refetch: jest.fn(() => Promise.resolve({ response: {} }))
  })),
  useCreateStaticSchedules: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDeleteStaticSchedule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

describe('Test COGatewayList', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on a row should open info drawer', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )

    const row = container.querySelector('.TableV2--row.TableV2--clickable')
    // const delete =
    expect(row).toBeDefined()
    act(() => {
      fireEvent.click(row!)
    })
    expect(container).toMatchSnapshot()
  })

  test('clicking on refresh button refetch all rules', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )

    const refreshIcon = getByTestId('refreshIconContainer')
    expect(refreshIcon).toBeDefined()
    act(() => {
      fireEvent.click(refreshIcon!)
    })
    expect(container).toMatchSnapshot()
  })

  describe('render based on the content', () => {
    test('render page loader on initial loading', () => {
      jest.spyOn(lwServices, 'useGetServices').mockImplementation(
        () =>
          ({
            data: null,
            loading: false,
            error: null,
            refetch: jest.fn()
          } as any)
      )
      const { container } = render(
        <TestWrapper>
          <COGatewayList />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})

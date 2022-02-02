/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchPerspectiveTimeSeriesDocument,
  FetchPerspectiveDetailsSummaryDocument,
  FetchViewFieldsDocument,
  FetchperspectiveGridDocument,
  FetchPerspectiveBudgetDocument,
  PerspectiveRecommendationsDocument
} from 'services/ce/services'
import PerspectiveDetailsPage from '../PerspectiveDetailsPage'

import ChartResponseData from './ChartDataResponse.json'
import SummaryResponseData from './SummaryResponse.json'
import ViewFieldResponseData from './ViewFieldResponse.json'
import PerspectiveResponseData from './PerspectiveData.json'
import ReportResponseData from './ReportResponseData.json'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetLicensesAndSummary: jest.fn().mockImplementation(() => ({
    data: {
      edition: 'FREE',
      licenseType: 'TRIAL',
      moduleType: 'CE',
      maxExpiryTime: 1642680031232,
      totalSpendLimit: 2500
    },
    refetch: jest.fn(),
    error: null,
    loading: false
  }))
}))

jest.mock('services/ce', () => ({
  ...(jest.requireActual('services/ce') as any),
  useGetLastMonthCost: jest.fn().mockImplementation(() => ({
    data: { resource: 100 },
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useGetForecastCost: jest.fn().mockImplementation(() => ({
    data: { resource: 100 },
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useGetPerspective: jest.fn().mockImplementation(() => {
    return { data: PerspectiveResponseData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetReportSetting: jest.fn().mockImplementation(() => {
    return { data: ReportResponseData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetCCMLicenseUsage: jest.fn().mockImplementation(() => {
    return {
      data: {
        className: '.CELicenseUsageDTO',
        accountIdentifier: 'ACCOUNT_ID',
        module: 'CE',
        timestamp: 1641370431232,
        activeSpend: { count: 22, displayName: '' }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Perspective details Page', () => {
  test('should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        if (query === FetchPerspectiveBudgetDocument) {
          return fromValue({
            data: {
              budgetSummary: {
                id: 'OgqEcGrMTY6yw1pLWmjmpQ',
                name: 'GCP All',
                budgetAmount: 2000000.0,
                actualCost: 785774.63,
                timeLeft: 9,
                timeUnit: 'days',
                timeScope: 'monthly',
                __typename: 'BudgetSummary'
              }
            }
          })
        }
        if (query === PerspectiveRecommendationsDocument) {
          return fromValue({
            data: {
              recommendationStatsV2: {
                totalMonthlyCost: 479.8999999999999,
                totalMonthlySaving: 283.86,
                count: 145,
                __typename: 'RecommendationOverviewStats'
              }
            }
          })
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveDetailsPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should be able to render no data page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue({
            data: {
              perspectiveTimeSeriesStats: {
                stats: []
              }
            }
          })
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({
            data: {
              perspectiveGrid: {
                data: []
              }
            }
          })
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveDetailsPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

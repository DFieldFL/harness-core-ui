/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { act } from 'react-test-renderer'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DynatraceMockHealthSourceData } from '@cv/pages/health-source/connectors/Dynatrace/tests/mock'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DynatraceCustomMetrics from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics'
import type { DynatraceCustomMetricsProps } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.type'
import type { MultiItemsSideNavProps } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import { DYNATRACE_CUSTOM_METRICS_PROPS_MOCK } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/tests/mock'
import type { NameIdDescriptionProps } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTagsConstants'
import * as cvService from 'services/cv'
import type { QueryContentProps } from '@cv/components/QueryViewer/types'
import type { SelectHealthSourceServicesProps } from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices.types'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const healthSourceServicesRenderMock = jest.fn()
jest.mock(
  '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices',
  () => (props: SelectHealthSourceServicesProps) => {
    useEffect(() => {
      healthSourceServicesRenderMock(props.metricPackResponse)
    }, [])
    return <></>
  }
)
const nameIdRenderMock = jest.fn()
jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  __esModule: true,
  NameId: (props: NameIdDescriptionProps) => {
    // whenever createdMetrics is changed, call mock so test can validate passed props
    useEffect(() => {
      nameIdRenderMock()
    }, [props])
    return <></>
  }
}))
const queryContentRenderMock = jest.fn()
jest.mock('@cv/components/QueryViewer/QueryViewer', () => ({
  __esModule: true,
  QueryContent: (props: QueryContentProps) => {
    useEffect(() => {
      queryContentRenderMock(props.query)
    })
    return (
      <>
        <button name={'fetchRecordsButton'} onClick={props.handleFetchRecords} />
      </>
    )
  }
}))

const createdMetricsValidationMock = jest.fn()
jest.mock('@cv/components/MultiItemsSideNav/MultiItemsSideNav', () => ({
  __esModule: true,
  MultiItemsSideNav: (props: MultiItemsSideNavProps) => {
    const { createdMetrics } = props
    // whenever createdMetrics is changed, call mock so test can validate passed props
    useEffect(() => {
      createdMetricsValidationMock(createdMetrics)
    }, [createdMetrics])
    return <></>
  }
}))

jest.mock('@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart.tsx', () => () => {
  return <></>
})

function WrapperComponent(props: DynatraceCustomMetricsProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={DynatraceMockHealthSourceData} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DynatraceCustomMetrics {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate Dynatrace Custom Metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest
      .spyOn(cvService, 'useGetDynatraceSampleData')
      .mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest.spyOn(cvService, 'useGetAllDynatraceServiceMetrics').mockReturnValue({
      data: {
        data: [
          {
            displayName: 'CPU per request',
            metricId: 'builtin:service.cpu.perRequest'
          }
        ]
      },
      refetch: jest.fn()
    } as any)
  })

  test('Ensure that existing metrics are transformed and passed to MultiItemsSideNav correctly', async () => {
    render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    expect(createdMetricsValidationMock).toHaveBeenNthCalledWith(1, ['mapped_metric_1', 'mapped_metric_2'])
  })
  test('Ensure that QueryContent is rendered with proper query', async () => {
    const { container } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    const queryContainerPanel = container.querySelector('[data-testid="querySpecificationsAndMapping-summary"]')
    // need to open accordion panel, so query content can be loaded
    if (queryContainerPanel) {
      act(() => {
        fireEvent.click(queryContainerPanel)
      })
    }
    // validate that query content component is called with expected metricSelector
    await waitFor(() => expect(queryContentRenderMock).toHaveBeenNthCalledWith(1, 'metric_selector_mock'))
  })

  test('Ensure that correct metricPacks are passed to SelectHealthSourceServices component', async () => {
    const metricPacksMock = { data: { data: ['mock_1', 'mock_2'] }, refetch: jest.fn() } as any
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue(metricPacksMock)
    const { container } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    const riskProfileContainer = container.querySelector('[data-testid="riskProfile-summary"]')
    if (riskProfileContainer) {
      act(() => {
        fireEvent.click(riskProfileContainer)
      })
    }
    // validate that query content component is called with expected metricSelector
    await waitFor(() => expect(healthSourceServicesRenderMock).toHaveBeenNthCalledWith(1, metricPacksMock))
  })

  test('should trigger sample data fetch when fetch records is clicked', async () => {
    const getSampleDataMock = jest.fn()
    getSampleDataMock.mockReturnValueOnce({ data: [] })
    jest.spyOn(cvService, 'useGetDynatraceSampleData').mockReturnValue({ mutate: getSampleDataMock } as any)

    const { container } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    const queryContainer = container.querySelector('[data-testid="querySpecificationsAndMapping-summary"]')
    if (queryContainer) {
      act(() => {
        fireEvent.click(queryContainer)
      })
    }
    const fetchRecordsMockButton = container.querySelector('button[name="fetchRecordsButton"]')
    if (fetchRecordsMockButton) {
      act(() => {
        fireEvent.click(fetchRecordsMockButton)
      })
    }
    await waitFor(() => expect(getSampleDataMock).toHaveBeenCalledTimes(1))
  })
})

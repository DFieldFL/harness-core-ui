/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import type * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ErrorTrackingAnalysis from '@cv/components/ErrorTrackingAnalysis/ErrorTrackingAnalysis'
import {
  mockedClustersData,
  mockedHealthSourcesData
} from '@cv/pages/monitored-service/components/ServiceHealth/components/MetricsAndLogs/__tests__/MetricsAndLogs.mock'
import { ErrorTrackingAnalysisProps, ErrorTrackingEvents } from '../ErrorTrackingAnalysis.types'
import { mockedLogAnalysisData as mockedErrorTrackingAnalysisData } from './ErrorTrackingAnalysis.mocks'

const WrapperComponent = (props: ErrorTrackingAnalysisProps): JSX.Element => {
  return (
    <TestWrapper>
      <ErrorTrackingAnalysis {...props} />
    </TestWrapper>
  )
}

jest.mock('highcharts-react-official', () => () => <></>)
const fetchLogAnalysis = jest.fn()
const fetchClusterData = jest.fn()
let useGetAllLogsClusterDataQueryParams: cvServices.GetAllLogsClusterDataQueryParams | undefined
let useGetAllLogsDataQueryParams: cvServices.GetAllLogsDataQueryParams | undefined

jest.mock('services/cv', () => ({
  useGetAllErrorTrackingLogsData: jest.fn().mockImplementation(props => {
    useGetAllLogsDataQueryParams = props.queryParams
    return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
  }),
  useGetAllHealthSourcesForMonitoredServiceIdentifier: jest.fn().mockImplementation(() => {
    return { data: mockedHealthSourcesData, error: null, loading: false }
  }),
  useGetAllLogsClusterData: jest.fn().mockImplementation(props => {
    useGetAllLogsClusterDataQueryParams = props.queryParams
    return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
  })
}))

describe('Unit tests for ErrorTrackingAnalysisContainer', () => {
  const props = {
    monitoredServiceIdentifier: 'monitored_service_identifier',
    serviceIdentifier: 'service-identifier',
    environmentIdentifier: 'env-identifier',
    startTime: 1630594988077,
    endTime: 1630595011443
  }
  test('Verify if ErrorTrackingAnalysisContainer renders', async () => {
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if Error Tracking Cluster Chart and Error Tracking Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...props} />)

    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(
        mockedErrorTrackingAnalysisData.resource.content.length
      )
    )
  })

  test('Verify if Filtering by cluster type works correctly', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent {...props} />)

    const clusterTypeFilterDropdown = container.querySelector(
      'input[placeholder="pipeline.verification.logs.filterByClusterType"]'
    ) as HTMLInputElement

    expect(clusterTypeFilterDropdown).toBeTruthy()

    // verify default filter is unknownEvent
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.unknownEvent')

    // Clicking the filter dropdown
    const selectCaret = container
      .querySelector(`[placeholder="pipeline.verification.logs.filterByClusterType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })

    // Selecting Known event cluster type
    const typeToSelect = await getByText('pipeline.verification.logs.knownEvent')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.knownEvent')

    // Verifying if correct number of records are shown for Known event type.
    const knownClusterTypeMockedData = mockedErrorTrackingAnalysisData.resource.content.filter(
      el => el.logData.tag === 'KNOWN'
    )
    await waitFor(() => expect(getAllByText('Known')).toHaveLength(knownClusterTypeMockedData.length))

    // Selecting UnKnown event cluster type
    const unknownEventTypeSelected = await getByText('pipeline.verification.logs.unknownEvent')
    act(() => {
      fireEvent.click(unknownEventTypeSelected)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.unknownEvent')

    // Verifying if correct number of records are shown for unKnown event type.
    const unknownClusterTypeMockedData = mockedErrorTrackingAnalysisData.resource.content.filter(
      el => el.logData.tag === 'UNKNOWN'
    )
    await waitFor(() => expect(getAllByText('Unknown')).toHaveLength(unknownClusterTypeMockedData.length))
  })

  test('it should not pass field clusterTypes to BE for event type All', () => {
    render(<WrapperComponent {...props} />)

    const clusterTypeFilterDropdown = screen.getByPlaceholderText(
      'pipeline.verification.logs.filterByClusterType'
    ) as HTMLInputElement

    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.unknownEvent')
    expect(useGetAllLogsClusterDataQueryParams?.clusterTypes).toEqual([ErrorTrackingEvents.UNKNOWN])
    expect(useGetAllLogsDataQueryParams?.clusterTypes).toEqual([ErrorTrackingEvents.UNKNOWN])

    userEvent.click(clusterTypeFilterDropdown)
    userEvent.click(screen.getByText('pipeline.verification.logs.allEvents'))

    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.allEvents')
    expect(useGetAllLogsClusterDataQueryParams).not.toHaveProperty('clusterTypes')
    expect(useGetAllLogsDataQueryParams).not.toHaveProperty('clusterTypes')
  })
})

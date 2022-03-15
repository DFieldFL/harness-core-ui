/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ErrorTrackingAnalysis from '@cv/components/ErrorTrackingAnalysis/ErrorTrackingAnalysis'
import {
  mockedClustersData,
  mockedHealthSourcesData
} from '@cv/pages/monitored-service/components/ServiceHealth/components/MetricsAndLogs/__tests__/MetricsAndLogs.mock'
import { ErrorTrackingAnalysisProps, ErrorTrackingEvents } from '../ErrorTrackingAnalysis.types'
import { mockedErrorTrackingAnalysisData } from './ErrorTrackingAnalysis.mocks'

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

const mockProps = {
  monitoredServiceIdentifier: 'monitored_service_identifier',
  serviceIdentifier: 'service-identifier',
  environmentIdentifier: 'env-identifier',
  startTime: 1630594988077,
  endTime: 1630595011443
}

describe('Unit tests for ErrorTrackingAnalysisContainer', () => {
  test('Verify if ErrorTrackingAnalysisContainer renders', () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
    })

    const { container } = render(<WrapperComponent {...mockProps} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if Error Tracking Cluster Chart and Error Tracking Record Table is rendered correctly', async () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
    })

    render(<WrapperComponent {...mockProps} />)

    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(
        mockedErrorTrackingAnalysisData.resource.content.length
      )
    )
  })

  test('Verify if Filtering by cluster type works correctly', async () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
    })
    const { container, getByText, getAllByText } = render(<WrapperComponent {...mockProps} />)

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
    let useGetAllLogsClusterDataQueryParams: cvServices.GetAllLogsClusterDataQueryParams | undefined
    let useGetAllLogsDataQueryParams: cvServices.GetAllLogsDataQueryParams | undefined

    jest
      .spyOn(cvServices, 'useGetAllErrorTrackingData')
      .mockImplementation((props: cvServices.UseGetAllErrorTrackingDataProps): any => {
        useGetAllLogsDataQueryParams = props.queryParams
        return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
      })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest
      .spyOn(cvServices, 'useGetAllLogsClusterData')
      .mockImplementation((props: cvServices.UseGetAllLogsClusterDataProps): any => {
        useGetAllLogsClusterDataQueryParams = props.queryParams
        return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
      })

    render(<WrapperComponent {...mockProps} />)

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

  test('Unit tests for ErrorTrackingAnalysisContainer no data', () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: undefined, loading: false, error: null, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
    })

    render(<WrapperComponent {...mockProps} />)

    expect(screen.getByText('cv.monitoredServices.noAvailableData'))
  })

  test('Unit tests for ErrorTrackingAnalysisContainer error in response', async () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: undefined, loading: false, error: { message: 'There is a problem' }, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
    })

    render(<WrapperComponent {...mockProps} />)

    expect(screen.getByText('There is a problem')).toBeDefined()

    const retryButton = await waitFor(() => screen.getByText('Retry'))

    expect(retryButton).toBeDefined()

    userEvent.click(retryButton)

    await waitFor(() => expect(screen.getByText('Retry')).toBeDefined())
    expect(fetchLogAnalysis).toBeCalled()
  })

  test('Unit tests for ErrorTrackingClusterContainer no data', () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return { data: undefined, error: null, loading: false, refetch: fetchClusterData }
    })

    render(<WrapperComponent {...mockProps} />)

    expect(screen.getByText('cv.monitoredServices.noAvailableData')).toBeDefined()
  })

  test('Unit tests for ErrorTrackingClusterContainer error in response', async () => {
    jest.spyOn(cvServices, 'useGetAllErrorTrackingData').mockImplementation((): any => {
      return { data: mockedErrorTrackingAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
    })

    jest.spyOn(cvServices, 'useGetAllHealthSourcesForMonitoredServiceIdentifier').mockImplementation((): any => {
      return { data: mockedHealthSourcesData, error: null, loading: false }
    })

    jest.spyOn(cvServices, 'useGetAllLogsClusterData').mockImplementation((): any => {
      return {
        data: undefined,
        error: { message: 'a new problem has occurred' },
        loading: false,
        refetch: fetchClusterData
      }
    })

    render(<WrapperComponent {...mockProps} />)

    expect(screen.getByText('a new problem has occurred')).toBeDefined()

    const retryButton = await waitFor(() => screen.getByText('Retry'))

    expect(retryButton).toBeDefined()

    userEvent.click(retryButton)

    await waitFor(() => expect(screen.getByText('Retry')).toBeDefined())
    expect(fetchClusterData).toBeCalled()
  })
})

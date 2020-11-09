import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uikit'
import { Classes } from '@blueprintjs/core'
import type { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import * as framework from 'framework/route/RouteMounter'
import CVServicesPage from '../CVServicesPage'

jest.mock('@cv/components/ActivitiesTimelineView/ActivitiesTimelineViewSection', () => () => (
  <Container className="drilldownview" />
))
jest.mock('../ServiceHeatMap/ServiceHeatMap', () => () => <Container className="service-heatmap" />)

describe('Unit tests for CV service page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockRouteParams = jest.spyOn(framework, 'useRouteParams')
    mockRouteParams.mockReturnValue({
      params: {
        accountId: 'loading',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      },
      query: {}
    })
  })
  test('Ensure no data is rendered when there are no services', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: []
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)
    useGetCategoryRiskMapSpy.mockReturnValue({
      data: { resource: [] },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText } = render(<CVServicesPage />)
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).not.toBeNull())
    expect(getByText('No analysis!')).not.toBeNull()
  })

  test('Ensure that when an error is encountered the error message is displayed', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: []
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)
    const refetchMock = jest.fn()
    useGetCategoryRiskMapSpy.mockReturnValue({
      data: { resource: undefined },
      error: { message: 'mock error' } as unknown,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText } = render(<CVServicesPage />)
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).toBeNull())
    expect(getByText('mock error')).not.toBeNull()
    const retryButton = getByText('Retry')
    fireEvent.click(retryButton)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure when a service is selected, api is called', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: [
          {
            orgIdentifier: 'harness_test',
            projectIdentifier: 'praveenproject',
            envIdentifier: 'Prod',
            risk: null,
            serviceRisks: [{ serviceIdentifier: 'manager', risk: -1 }]
          }
        ]
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    useGetCategoryRiskMapSpy.mockReturnValue({
      data: { resource: [] },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText } = render(<CVServicesPage />)
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).not.toBeNull())

    const envOption = getByText('Environment: Prod')
    expect(useGetEnvServiceRiskSpy).toHaveBeenCalledTimes(1)
    expect(useGetCategoryRiskMapSpy).toHaveBeenCalledTimes(1)
    await waitFor(() => fireEvent.click(envOption))
    expect(useGetEnvServiceRiskSpy).toHaveBeenCalledTimes(3)
    expect(useGetCategoryRiskMapSpy).toHaveBeenCalledTimes(3)
  })

  test('Ensure that when time range drop down values are selected, either heatmap or metrics view is rendered', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    const useGetCategoryRiskMapSpy = jest.spyOn(cvService, 'useGetCategoryRiskMap')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: [
          {
            orgIdentifier: 'harness_test',
            projectIdentifier: 'praveenproject',
            envIdentifier: 'Prod',
            risk: null,
            serviceRisks: [{ serviceIdentifier: 'manager', risk: -1 }]
          }
        ]
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    useGetCategoryRiskMapSpy.mockReturnValue({
      data: {
        resource: {
          endTimeEpoch: 1598338800000 + 15 * 1000 * 60,
          startTimeEpoch: 1598338800000,
          categoryRisks: [
            { category: 'Performance', risk: 45 },
            { category: 'Errors', risk: 100 },
            { category: 'Resources', risk: 25 }
          ]
        }
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const { container, getByText, getAllByText } = render(<CVServicesPage />)
    await waitFor(() => expect(container.querySelector('[class*="servicesPage"]')).not.toBeNull())
    expect(getAllByText('100').length).toBe(2)

    expect(container.querySelector('[class*="drilldownview"]')).not.toBeNull()
    expect(container.querySelector('[class*="service-heatmap"]')).toBeNull()

    const dropdown = container.querySelector('[class*="bp3-icon-caret-down"]')
    if (!dropdown) {
      throw Error('No drop down rendred')
    }

    fireEvent.click(dropdown)
    let twelveHourOptions
    await waitFor(() => {
      twelveHourOptions = container.querySelector(`[class*="${Classes.MENU}"]`)
      expect(twelveHourOptions).not.toBeNull()
    })

    fireEvent.click(getByText('12 Hours'))
    await waitFor(() => {
      expect(container.querySelector('[class*="rangeSelector"] input')?.getAttribute('value')).toEqual('12 Hours')
      expect(container.querySelector('[class*="service-heatmap"]')).not.toBeNull()
    })
  })
})

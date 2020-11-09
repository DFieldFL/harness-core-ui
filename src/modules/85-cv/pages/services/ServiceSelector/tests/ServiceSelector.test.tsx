import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import * as framework from 'framework/route/RouteMounter'
import * as cvService from 'services/cv'
import ServiceSelector from '../ServiceSelector'

describe('Unit tests for service selector', () => {
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
  test('Ensure that when no data state is rendered when no data is provided', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
    useGetEnvServiceRiskSpy.mockReturnValue({
      data: {
        resource: []
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, unknown, any, unknown>)

    const isEmptyListMock = jest.fn()
    const { container } = render(<ServiceSelector isEmptyList={isEmptyListMock} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const mainContainer = container.querySelector('[class*="main"]')
    expect(mainContainer?.children.length).toBe(1)
  })

  test('Ensure that environments and services are rendered when provided', async () => {
    const useGetEnvServiceRiskSpy = jest.spyOn(cvService, 'useGetEnvServiceRisks')
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

    const onSelectMock = jest.fn()
    const { container } = render(<ServiceSelector onSelect={onSelectMock} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    expect(container.querySelectorAll('[class*="entityRow"]').length).toBe(3)
    const environmentRow = container.querySelector('[class*="environmentRow"]')
    if (!environmentRow) {
      throw Error('Environment row was not rendered.')
    }

    expect(environmentRow.children[0]?.innerHTML).toEqual('Environment: Prod')
    expect(environmentRow.children[1]?.getAttribute('class')).toContain('heatmapColor1')

    const serviceRow = container.querySelector('[class*="serviceRow"]')
    if (!serviceRow) {
      throw Error('Service row was not rendered.')
    }

    expect(serviceRow.children[0]?.innerHTML).toEqual('manager')
    expect(serviceRow.children[1]?.getAttribute('class')).toContain('noRiskScore')

    fireEvent.click(serviceRow)
    await waitFor(() => expect(onSelectMock).toHaveBeenCalledTimes(1))
    expect(onSelectMock).toHaveBeenLastCalledWith('Prod', 'manager')
    expect(serviceRow.getAttribute('data-selected')).toEqual('true')

    const allServices = container.querySelector('[class*="allServiceSelector"]')
    if (!allServices) {
      throw Error('All services option was not rendered.')
    }
    fireEvent.click(allServices)
    await waitFor(() => expect(allServices.getAttribute('data-selected')).toEqual('true'))

    expect(onSelectMock).toHaveBeenCalledWith(undefined, undefined)
  })
})

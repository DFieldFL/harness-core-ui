import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import AppDHealthSourceContainer from '../AppDHealthSourceContainer'
import {
  sourceData,
  appTier,
  applicationName,
  metricPack,
  validationData,
  onSubmitPayload,
  onPreviousPayload
} from './AppDMonitoredSource.mock'
import AppDMonitoredSource from '../AppDHealthSource'

const createModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { sourceType: Connectors.APP_DYNAMICS },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('Unit tests for createAppd monitoring source', () => {
  const refetchMock = jest.fn()

  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetAppDynamicsTiers')
      .mockImplementation(() => ({ loading: false, error: null, data: appTier, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetAppDynamicsApplications')
      .mockImplementation(() => ({ loading: false, error: null, data: applicationName, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: metricPack, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getAppDynamicsMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: validationData.data } as any))
  })

  test('Component renders in edit mode', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDHealthSourceContainer data={sourceData} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    fireEvent.click(getByText('previous'))
    await waitFor(() => expect(onPrevious).toHaveBeenCalledWith(expect.objectContaining(onPreviousPayload)))

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(submitData).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(onSubmitPayload))
    )

    expect(container).toMatchSnapshot()
  })

  test('Validate metric packs', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDMonitoredSource data={{}} onSubmit={submitData} onPrevious={jest.fn()} />
        </SetupSourceTabs>
      </TestWrapper>
    )

    // default all metrics are selected
    container.querySelectorAll('[type="checkbox"]').forEach(metricCheckbox => {
      expect(metricCheckbox).toBeChecked()
    })

    await waitFor(() => expect(getByText('Errors')).toBeTruthy())

    // uncheck all metric pack
    container.querySelectorAll('[type="checkbox"]').forEach(async metricCheckbox => {
      await act(() => {
        fireEvent.click(metricCheckbox)
      })
    })

    await act(() => {
      fireEvent.click(getByText('submit'))
    })
    // metric pack error is visible
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.validations.selectMetricPack')).toBeTruthy())
  })

  test('Validation in create mode', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDHealthSourceContainer data={{}} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    await act(() => {
      fireEvent.click(getByText('submit'))
    })
    await waitFor(() => expect(getByText('cv.healthSource.connectors.AppDynamics.validation.application')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })
})

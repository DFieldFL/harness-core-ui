/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { act } from 'react-test-renderer'
import { fireEvent, render, waitFor } from '@testing-library/react'
import {
  DynatraceHealthSourcePropsMock,
  DynatraceMockHealthSourceData,
  MockDynatraceMetricData,
  mockUseGetDynatraceServices
} from '@cv/pages/health-source/connectors/Dynatrace/tests/mock'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DynatraceHealthSource from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource'
import type { DynatraceHealthSourceProps } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import * as cvService from 'services/cv'
import type { ValidationStatusProps } from '@cv/pages/components/ValidationStatus/ValidationStatus.types'
import * as MonitoredServiceConnectorUtils from '@cv/pages/health-source/connectors/MonitoredServiceConnector.utils'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

jest.mock(
  '@cv/pages/health-source/connectors/MetricPackCustom',
  () => (props: { onChange: (data: { [key: string]: boolean }) => void }) => {
    return (
      <>
        <button
          name={'customMetricCheckboxChangeMock'}
          onClick={() => {
            props.onChange({ Performance: true })
          }}
        />
      </>
    )
  }
)
const validationStatusComponentRenderedMock = jest.fn()
jest.mock('@cv/pages/components/ValidationStatus/ValidationStatus', () => (props: ValidationStatusProps) => {
  useEffect(() => {
    validationStatusComponentRenderedMock()
  }, [])
  useEffect(() => {
    props?.onClick?.()
  }, [props?.onClick])

  return <></>
})

const metricVerificationModalComponentRenderedMock = jest.fn()
jest.mock('@cv/components/MetricsVerificationModal/MetricsVerificationModal', () => () => {
  useEffect(() => {
    metricVerificationModalComponentRenderedMock()
  }, [])
  return <></>
})

const customMetricsComponentRenderMock = jest.fn()
jest.mock('@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics', () => () => {
  useEffect(() => {
    customMetricsComponentRenderMock()
  }, [])
  return <></>
})

function WrapperComponent(props: DynatraceHealthSourceProps): JSX.Element {
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
        <DynatraceHealthSource {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate DynatraceHealthSource', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetDynatraceServices').mockReturnValue(mockUseGetDynatraceServices as any)
  })
  test('should validate proper service is set as chosen', async () => {
    // provided props contain dynatraceMetricData which has selected service with 'mock_service_name'
    const { container } = render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    const serviceSelectElement = container.querySelector('input[value="mock_service_name"]') as HTMLElement
    expect(serviceSelectElement).toBeTruthy()
  })

  test('Should render ValidationStatus component when service is chosen', async () => {
    // provided props contain dynatraceMetricData which has selected service
    render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    expect(validationStatusComponentRenderedMock).toHaveBeenCalledTimes(1)
  })
  test('Should NOT render ValidationStatus component when service is not chosen', async () => {
    const propsWithoutSelectedService: DynatraceHealthSourceProps = {
      ...DynatraceHealthSourcePropsMock,
      dynatraceFormData: {
        ...MockDynatraceMetricData,
        selectedService: {
          label: '',
          value: ''
        }
      }
    }
    render(<WrapperComponent {...propsWithoutSelectedService} />)
    expect(validationStatusComponentRenderedMock).toHaveBeenCalledTimes(0)
  })

  test('Should validate that MetricsVerificationModal is shown', async () => {
    // mock validateMappings and return mocked, no empty validation result
    // this will provide that modal is opened when click on ValidationStatus component occurs
    jest
      .spyOn(MonitoredServiceConnectorUtils, 'validateMetrics')
      .mockReturnValue(Promise.resolve({ validationStatus: 'SUCCESS', validationResult: [{}] as any }))

    const { container } = render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    const onMetricPackChangeButton = container.querySelector(
      'button[name="customMetricCheckboxChangeMock"]'
    ) as HTMLElement
    act(() => {
      fireEvent.click(onMetricPackChangeButton)
    })
    await waitFor(() => expect(metricVerificationModalComponentRenderedMock).toHaveBeenCalledTimes(1))
  })
  test('Should render custom metrics when Add metric link is clicked', async () => {
    const propsWithoutCustomMetrics = {
      ...DynatraceHealthSourcePropsMock,
      dynatraceFormData: { ...DynatraceHealthSourcePropsMock.dynatraceFormData, customMetrics: new Map() }
    }
    const { getByText } = render(<WrapperComponent {...propsWithoutCustomMetrics} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.addMetric')).not.toBeNull())
    act(() => {
      fireEvent.click(getByText('cv.monitoringSources.addMetric'))
    })
    await waitFor(() => expect(customMetricsComponentRenderMock).toHaveBeenCalledTimes(1))
  })
})

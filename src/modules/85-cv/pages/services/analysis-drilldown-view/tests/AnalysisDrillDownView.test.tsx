import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { AnalysisDrillDownView } from '../AnalysisDrillDownView'
import i18n from '../AnalysisDrillDownView.i18n'

jest.mock('../MetricAnalysisView/MetricAnalysisView', () => ({
  MetricAnalysisView: function MockComponent() {
    return <Container className="metricAnalysisView" />
  }
}))
jest.mock('../LogAnalysisView/LogAnalysisView', () => () => <Container className="logAnalysisView" />)

describe('Unit tests for Analysis Drill down view', () => {
  test('Ensure no data card is rendered when timestamps are invalid', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AnalysisDrillDownView startTime={0} endTime={0} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText(i18n.noDataText)).not.toBeNull())
  })

  test('Ensure correct tab is rendered when clicking on a tab', async () => {
    const useGetDataSourceTypesSpy = jest.spyOn(cvService, 'useGetDataSourcetypes')
    useGetDataSourceTypesSpy.mockReturnValue({
      data: {
        resource: [
          {
            dataSourceType: 'APP_DYNAMICS',
            verificationType: 'TIME_SERIES'
          },
          {
            dataSourceType: 'SPLUNK',
            verificationType: 'LOG'
          },
          {
            dataSourceType: 'STACKDRIVER',
            verificationType: 'TIME_SERIES'
          },
          {
            dataSourceType: 'STACKDRIVER',
            verificationType: 'LOG'
          }
        ]
      }
    } as UseGetReturn<any, any, any, any>)
    const { container } = render(
      <TestWrapper>
        <AnalysisDrillDownView startTime={Date.now()} endTime={Date.now()} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.metricAnalysisView')).not.toBeNull())
  })
})

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Container } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import ServiceHeatMap from '../ServiceHeatMap'

const MockData = {
  metaData: {},
  resource: {
    Performance: [
      { startTime: 1606716000000, endTime: 1606770000000 },
      { startTime: 1606770000000, endTime: 1606824000000 },
      { startTime: 1606824000000, endTime: 1606878000000 },
      { startTime: 1606878000000, endTime: 1606932000000 },
      { startTime: 1606932000000, endTime: 1606986000000 },
      { startTime: 1606986000000, endTime: 1607040000000 },
      { startTime: 1607040000000, endTime: 1607094000000 },
      { startTime: 1607094000000, endTime: 1607148000000 },
      { startTime: 1607148000000, endTime: 1607202000000 },
      { startTime: 1607202000000, endTime: 1607256000000 },
      { startTime: 1607256000000, endTime: 1607310000000 },
      { startTime: 1607310000000, endTime: 1607364000000 },
      { startTime: 1607364000000, endTime: 1607418000000 },
      { startTime: 1607418000000, endTime: 1607472000000 },
      { startTime: 1607472000000, endTime: 1607526000000 },
      { startTime: 1607526000000, endTime: 1607580000000 },
      { startTime: 1607580000000, endTime: 1607634000000 },
      { startTime: 1607634000000, endTime: 1607688000000 },
      { startTime: 1607688000000, endTime: 1607742000000 },
      { startTime: 1607742000000, endTime: 1607796000000 },
      { startTime: 1607796000000, endTime: 1607850000000 },
      { startTime: 1607850000000, endTime: 1607904000000 },
      { startTime: 1607904000000, endTime: 1607958000000 },
      { startTime: 1607958000000, endTime: 1608012000000 },
      { startTime: 1608012000000, endTime: 1608066000000 },
      { startTime: 1608066000000, endTime: 1608120000000 },
      { startTime: 1608120000000, endTime: 1608174000000 },
      { startTime: 1608174000000, endTime: 1608228000000, riskScore: 0.10405562457539372 },
      { startTime: 1608228000000, endTime: 1608282000000, riskScore: 0.9031238228333182 },
      { startTime: 1608282000000, endTime: 1608336000000, riskScore: 0.90096938288288 },
      { startTime: 1608336000000, endTime: 1608390000000, riskScore: 0.43872466549120603 },
      { startTime: 1608390000000, endTime: 1608444000000, riskScore: 1.0 },
      { startTime: 1608444000000, endTime: 1608498000000, riskScore: 1.0 },
      { startTime: 1608498000000, endTime: 1608552000000, riskScore: 0.570148130936062 },
      { startTime: 1608552000000, endTime: 1608606000000, riskScore: 0.9022975599059353 },
      { startTime: 1608606000000, endTime: 1608660000000, riskScore: 0.8249941314228657 },
      { startTime: 1608660000000, endTime: 1608714000000, riskScore: 0.9318705443702513 },
      { startTime: 1608714000000, endTime: 1608768000000, riskScore: 0.6604103262689534 },
      { startTime: 1608768000000, endTime: 1608822000000, riskScore: 0.48401219823502395 },
      { startTime: 1608822000000, endTime: 1608876000000, riskScore: 0.25691517450954265 },
      { startTime: 1608876000000, endTime: 1608930000000 },
      { startTime: 1608930000000, endTime: 1608984000000, riskScore: 0.18218308553845963 },
      { startTime: 1608984000000, endTime: 1609038000000, riskScore: 0.20746655534920563 },
      { startTime: 1609038000000, endTime: 1609092000000, riskScore: 0.35256921564555166 },
      { startTime: 1609092000000, endTime: 1609146000000, riskScore: 0.16241500075871484 },
      { startTime: 1609146000000, endTime: 1609200000000, riskScore: 0.14904564747559557 },
      { startTime: 1609200000000, endTime: 1609254000000, riskScore: 1.0 },
      { startTime: 1609254000000, endTime: 1609308000000, riskScore: 0.4240567350065617 },
      { startTime: 1609308000000, endTime: 1609362000000, riskScore: 1.0 }
    ],
    Infrastructure: [
      { startTime: 1606716000000, endTime: 1606770000000 },
      { startTime: 1606770000000, endTime: 1606824000000 },
      { startTime: 1606824000000, endTime: 1606878000000 },
      { startTime: 1606878000000, endTime: 1606932000000 },
      { startTime: 1606932000000, endTime: 1606986000000 },
      { startTime: 1606986000000, endTime: 1607040000000 },
      { startTime: 1607040000000, endTime: 1607094000000 },
      { startTime: 1607094000000, endTime: 1607148000000 },
      { startTime: 1607148000000, endTime: 1607202000000 },
      { startTime: 1607202000000, endTime: 1607256000000 },
      { startTime: 1607256000000, endTime: 1607310000000 },
      { startTime: 1607310000000, endTime: 1607364000000 },
      { startTime: 1607364000000, endTime: 1607418000000 },
      { startTime: 1607418000000, endTime: 1607472000000 },
      { startTime: 1607472000000, endTime: 1607526000000 },
      { startTime: 1607526000000, endTime: 1607580000000 },
      { startTime: 1607580000000, endTime: 1607634000000 },
      { startTime: 1607634000000, endTime: 1607688000000 },
      { startTime: 1607688000000, endTime: 1607742000000 },
      { startTime: 1607742000000, endTime: 1607796000000 },
      { startTime: 1607796000000, endTime: 1607850000000 },
      { startTime: 1607850000000, endTime: 1607904000000 },
      { startTime: 1607904000000, endTime: 1607958000000 },
      { startTime: 1607958000000, endTime: 1608012000000 },
      { startTime: 1608012000000, endTime: 1608066000000 },
      { startTime: 1608066000000, endTime: 1608120000000 },
      { startTime: 1608120000000, endTime: 1608174000000 },
      { startTime: 1608174000000, endTime: 1608228000000 },
      { startTime: 1608228000000, endTime: 1608282000000 },
      { startTime: 1608282000000, endTime: 1608336000000 },
      { startTime: 1608336000000, endTime: 1608390000000 },
      { startTime: 1608390000000, endTime: 1608444000000 },
      { startTime: 1608444000000, endTime: 1608498000000 },
      { startTime: 1608498000000, endTime: 1608552000000 },
      { startTime: 1608552000000, endTime: 1608606000000 },
      { startTime: 1608606000000, endTime: 1608660000000 },
      { startTime: 1608660000000, endTime: 1608714000000 },
      { startTime: 1608714000000, endTime: 1608768000000 },
      { startTime: 1608768000000, endTime: 1608822000000, riskScore: 0.0 },
      { startTime: 1608822000000, endTime: 1608876000000, riskScore: 0.0 },
      { startTime: 1608876000000, endTime: 1608930000000, riskScore: 0.0 },
      { startTime: 1608930000000, endTime: 1608984000000, riskScore: 0.0 },
      { startTime: 1608984000000, endTime: 1609038000000, riskScore: 0.0 },
      { startTime: 1609038000000, endTime: 1609092000000, riskScore: 0.0 },
      { startTime: 1609092000000, endTime: 1609146000000, riskScore: 0.0 },
      { startTime: 1609146000000, endTime: 1609200000000, riskScore: 0.0 },
      { startTime: 1609200000000, endTime: 1609254000000, riskScore: 0.0 },
      { startTime: 1609254000000, endTime: 1609308000000, riskScore: 0.0 },
      { startTime: 1609308000000, endTime: 1609362000000 }
    ],
    Errors: [
      { startTime: 1606716000000, endTime: 1606770000000 },
      { startTime: 1606770000000, endTime: 1606824000000 },
      { startTime: 1606824000000, endTime: 1606878000000 },
      { startTime: 1606878000000, endTime: 1606932000000 },
      { startTime: 1606932000000, endTime: 1606986000000 },
      { startTime: 1606986000000, endTime: 1607040000000 },
      { startTime: 1607040000000, endTime: 1607094000000 },
      { startTime: 1607094000000, endTime: 1607148000000 },
      { startTime: 1607148000000, endTime: 1607202000000 },
      { startTime: 1607202000000, endTime: 1607256000000 },
      { startTime: 1607256000000, endTime: 1607310000000 },
      { startTime: 1607310000000, endTime: 1607364000000 },
      { startTime: 1607364000000, endTime: 1607418000000 },
      { startTime: 1607418000000, endTime: 1607472000000 },
      { startTime: 1607472000000, endTime: 1607526000000 },
      { startTime: 1607526000000, endTime: 1607580000000 },
      { startTime: 1607580000000, endTime: 1607634000000 },
      { startTime: 1607634000000, endTime: 1607688000000 },
      { startTime: 1607688000000, endTime: 1607742000000 },
      { startTime: 1607742000000, endTime: 1607796000000 },
      { startTime: 1607796000000, endTime: 1607850000000 },
      { startTime: 1607850000000, endTime: 1607904000000 },
      { startTime: 1607904000000, endTime: 1607958000000 },
      { startTime: 1607958000000, endTime: 1608012000000 },
      { startTime: 1608012000000, endTime: 1608066000000 },
      { startTime: 1608066000000, endTime: 1608120000000 },
      { startTime: 1608120000000, endTime: 1608174000000 },
      { startTime: 1608174000000, endTime: 1608228000000, riskScore: 0.025641173477816453 },
      { startTime: 1608228000000, endTime: 1608282000000, riskScore: 1.0 },
      { startTime: 1608282000000, endTime: 1608336000000, riskScore: 0.33850723394341536 },
      { startTime: 1608336000000, endTime: 1608390000000, riskScore: 0.16897031098705875 },
      { startTime: 1608390000000, endTime: 1608444000000, riskScore: 0.13229133681415098 },
      { startTime: 1608444000000, endTime: 1608498000000, riskScore: 0.12251913112118024 },
      { startTime: 1608498000000, endTime: 1608552000000, riskScore: 0.12580443445844242 },
      { startTime: 1608552000000, endTime: 1608606000000, riskScore: 0.34296264056828685 },
      { startTime: 1608606000000, endTime: 1608660000000, riskScore: 0.3484675875509534 },
      { startTime: 1608660000000, endTime: 1608714000000, riskScore: 0.294379538825239 },
      { startTime: 1608714000000, endTime: 1608768000000, riskScore: 0.35556952410884995 },
      { startTime: 1608768000000, endTime: 1608822000000, riskScore: 0.24532489635802454 },
      { startTime: 1608822000000, endTime: 1608876000000, riskScore: 0.1338909021885696 },
      { startTime: 1608876000000, endTime: 1608930000000 },
      { startTime: 1608930000000, endTime: 1608984000000, riskScore: 0.0 },
      { startTime: 1608984000000, endTime: 1609038000000, riskScore: 0.0 },
      { startTime: 1609038000000, endTime: 1609092000000, riskScore: 0.0 },
      { startTime: 1609092000000, endTime: 1609146000000, riskScore: 0.0 },
      { startTime: 1609146000000, endTime: 1609200000000, riskScore: 0.0 },
      { startTime: 1609200000000, endTime: 1609254000000, riskScore: 0.07142857142857142 },
      { startTime: 1609254000000, endTime: 1609308000000, riskScore: 0.07172347935276871 },
      { startTime: 1609308000000, endTime: 1609362000000, riskScore: 0.12583337875091208 }
    ]
  },
  responseMessages: []
}

jest.mock('../../analysis-drilldown-view/MetricAnalysisView/MetricAnalysisView', () => ({
  MetricAnalysisView: function MockComponent() {
    return <Container className="metricAnalysisView" />
  }
}))
jest.mock('../../analysis-drilldown-view/LogAnalysisView/LogAnalysisView', () => () => (
  <Container className="logAnalysisView" />
))

describe('Unit tests for Service Heatmap componnt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Ensure modal opens after click on a heat map cell', async () => {
    const useGetHeatmapSpy = jest.spyOn(cvService, 'useGetHeatmap')
    const refetchMock = jest.fn()
    useGetHeatmapSpy.mockReturnValue({
      data: MockData,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, unknown, any, unknown>)
    const { container } = render(
      <TestWrapper
        path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_AccountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <ServiceHeatMap startTime={1604451600000} endTime={1604471400000} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // grap all heatmap squares
    const heatmapCells = container.querySelectorAll('[class~="cell"]')
    expect(heatmapCells).not.toBeNull()
    if (!heatmapCells) {
      throw Error('Heatmap was not rendered.')
    }

    // click on green square with risk score 0 for infrastructure
    fireEvent.click(heatmapCells[29])
    await waitFor(() => expect(document.body.querySelector(`.${Classes.DIALOG}`)).not.toBeNull())
    expect(document.body.querySelector('[class*="categoryAndRiskScore"]')).not.toBeNull()
    expect(document.body.querySelector('[class*="riskInfo"] p')?.innerHTML).toEqual('Performance')
    expect(document.body.querySelector('[class*="largeTile"] p[class*="riskScore"]')?.innerHTML).toEqual('90')

    // click on a cell and empty square for Infrastructure
    fireEvent.click(heatmapCells[50])
    await waitFor(() => expect(document.body.querySelector(`.${Classes.DIALOG}`)).not.toBeNull())
    expect(document.body.querySelector('[class*="categoryAndRiskScore"]')).not.toBeNull()
    expect(document.body.querySelector('[class*="riskInfo"] p')?.innerHTML).toEqual('Infrastructure')
    expect(document.body.querySelector('[class*="largeTile"] p[class*="riskScore"]')?.innerHTML).toBe('')

    // click on a heatap square with score 0 Errors
    fireEvent.click(heatmapCells[143])
    await waitFor(() => expect(document.body.querySelector(`.${Classes.DIALOG}`)).not.toBeNull())
    expect(document.body.querySelector('[class*="categoryAndRiskScore"]')).not.toBeNull()
    expect(document.body.querySelector('[class*="riskInfo"] p')?.innerHTML).toEqual('Errors')
    expect(document.body.querySelector('[class*="largeTile"] p[class*="riskScore"]')?.innerHTML).toBe('0')
  })
})

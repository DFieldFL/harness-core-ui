import type { IconName } from '@wings-software/uicore'
import type { HostData, MonitoringSource } from 'services/cv'
import type { HostTestData } from './DeploymentMetricsAnalysisRow.constants'

export function healthSourceTypeToLogo(healthSourceType: MonitoringSource['type']): IconName {
  switch (healthSourceType) {
    case 'APP_DYNAMICS':
      return 'service-appdynamics'
    case 'NEW_RELIC':
      return 'service-newrelic'
    case 'PROMETHEUS':
      return 'service-prometheus'
    case 'SPLUNK':
      return 'service-splunk'
    case 'STACKDRIVER':
    case 'STACKDRIVER_LOG':
      return 'service-stackdriver'
    default:
      return 'circle'
  }
}

export function riskValueToLineColor(risk?: HostData['risk']): string {
  switch (risk) {
    case 'HIGH':
      return 'var(--red-500)'
    case 'MEDIUM':
      return 'var(--yellow-500)'
    case 'LOW':
      return 'var(--green-500)'
    case 'NO_ANALYSIS':
    case 'NO_DATA':
      return 'var(--grey-300)'
    default:
      return ''
  }
}

export function transformControlAndTestDataToHighChartsSeries(
  controlData: Highcharts.SeriesLineOptions['data'][],
  testData: HostTestData[]
): Highcharts.SeriesLineOptions[][] {
  const highchartsOptions: Highcharts.SeriesLineOptions[][] = []

  for (let index = 0; index < controlData.length; index++) {
    highchartsOptions.push([
      {
        type: 'line',
        data: controlData[index] || [],
        color: 'var(--grey-200)',
        name: testData[index].name
      },
      {
        type: 'line',
        data: testData[index].points || [],
        color: riskValueToLineColor(testData[index].risk),
        name: testData[index].name
      }
    ])
  }

  return highchartsOptions
}

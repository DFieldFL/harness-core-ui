import type Highcharts from 'highcharts'
import type { HostTestData } from './DeploymentMetricsAnalysisRow.constants'

export interface DeploymentMetricsAnalysisRowChartSeries extends Highcharts.SeriesAreasplineOptions {
  baseData: Highcharts.SeriesAreasplineOptions['data']
  actualTestData: HostTestData
}

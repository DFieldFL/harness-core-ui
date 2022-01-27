/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'

export function chartsConfig(
  series: DeploymentMetricsAnalysisRowChartSeries[],
  width: number,
  testData: HostTestData | undefined
): Highcharts.Options {
  return {
    chart: {
      height: 120,
      width,
      type: 'areaspline'
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      tickLength: 0,

      labels: {
        enabled: false
      },

      title: {
        text: testData?.name,
        align: 'low'
      }
    },
    yAxis: {
      gridLineWidth: 0,
      labels: {
        enabled: false
      },
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 3,
        turboThreshold: 50000
      },
      areaspline: {
        fillOpacity: 0.5
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(this: any): string {
        const { baseData, actualTestData } = series[0]

        // eslint-disable-next-line
        // @ts-ignore
        const baseDataValue = baseData?.[this.point.index]?.y
        // eslint-disable-next-line
        // @ts-ignore
        const testDataValue = actualTestData?.points?.[this.point.index]?.y

        return `<section class="serviceGuardTimeSeriesTooltip"><p>Baseline: ${baseDataValue.toFixed(
          2
        )}</p><br/><p>Value: ${testDataValue.toFixed(2)}</p></section>`
      },
      outside: true
    },
    subtitle: undefined,
    series
  }
}

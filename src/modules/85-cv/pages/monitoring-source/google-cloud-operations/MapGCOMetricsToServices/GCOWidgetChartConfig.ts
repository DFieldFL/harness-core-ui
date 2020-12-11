import moment from 'moment'
export function chartsConfig(series: Highcharts.SeriesLineOptions[]): Highcharts.Options {
  return {
    chart: {
      backgroundColor: 'transparent',
      height: 200,
      type: 'line',
      spacing: [5, 2, 5, 2]
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      labels: {
        formatter: function () {
          return moment(this.value).format('h:m a')
        }
      },
      lineWidth: 1,
      showFirstLabel: false,
      showLastLabel: false,
      tickLength: 5,
      tickAmount: 7,
      gridLineWidth: 1,
      gridLineDashStyle: 'Dash',
      title: {
        text: ''
      }
    },
    yAxis: {
      // labels: { enabled: false },
      lineWidth: 1,
      tickLength: 5,
      tickAmount: 5,
      showFirstLabel: false,
      showLastLabel: false,
      gridLineDashStyle: 'Dash',
      gridLineWidth: 1,
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 1.5,
        turboThreshold: 50000
      },
      line: {
        marker: {
          enabled: false
        }
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(this: any): string {
        return `<section class="serviceGuardTimeSeriesTooltip"><p>${moment(this.x).format(
          'M/D/YYYY h:m a'
        )}</p><br/><p>Value: ${this.y.toFixed(2)}</p></section>`
      },
      outside: true
    },
    subtitle: undefined,
    series
  }
}

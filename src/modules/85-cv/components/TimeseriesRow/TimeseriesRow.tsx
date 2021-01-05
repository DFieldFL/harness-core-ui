import React, { useMemo, useState } from 'react'
import { Container, Text, Icon, Color, useModalHook, Button } from '@wings-software/uicore'
import type { FontProps } from '@wings-software/uicore/dist/styled-props/font/FontProps'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import classnames from 'classnames'
import moment from 'moment'
import merge from 'lodash-es/merge'
import { Popover, Menu, MenuItem, Dialog } from '@blueprintjs/core'
import { TimelineBar } from '@common/components/TimelineView/TimelineBar'
import { useStrings } from 'framework/exports'
import styles from './TimeseriesRow.module.scss'

export interface SeriesConfig {
  name?: string
  series: Highcharts.SeriesLineOptions[]
}

export interface TimeseriesRowProps {
  transactionName: React.ReactNode
  metricName?: React.ReactNode
  seriesData?: Array<SeriesConfig>
  chartOptions?: Highcharts.Options
  withContextMenu?: boolean
  className?: string
}

const FONT_SIZE_SMALL: FontProps = {
  size: 'small'
}

export default function TimeseriesRow({
  transactionName,
  metricName,
  seriesData,
  className,
  chartOptions,
  withContextMenu = true
}: TimeseriesRowProps) {
  const { getString } = useStrings()
  const showDetails = useTimeseriesDetailsModal(transactionName, metricName)
  const rows = useMemo(() => {
    return seriesData?.map(data => ({
      name: data.name,
      series: data.series,
      options: chartOptions ? merge(chartsConfig(data.series), chartOptions) : chartsConfig(data.series)
    }))
  }, [seriesData, chartOptions])
  return (
    <Container className={classnames(styles.timeseriesRow, className)}>
      <Container className={styles.labels}>
        <div>
          <div>
            <Text color={Color.BLACK} font={FONT_SIZE_SMALL} width={130} lineClamp={1}>
              {transactionName}
            </Text>
            <Text font={FONT_SIZE_SMALL} width={130} lineClamp={1}>
              {metricName}
            </Text>
          </div>
          <Icon name="star-empty" color={Color.GREY_250} />
        </div>
      </Container>
      <Container className={styles.charts}>
        {rows?.map((data, index) => (
          <React.Fragment key={index}>
            {data.name && <Text>{data.name}</Text>}
            <Container className={styles.chartRow}>
              <Container className={styles.chartContainer}>
                <HighchartsReact highcharts={Highcharts} options={data.options} />
              </Container>
              {withContextMenu && (
                <Popover
                  content={
                    <Menu>
                      <MenuItem
                        icon="fullscreen"
                        text={getString('viewDetails')}
                        onClick={() =>
                          showDetails({
                            name: data.name,
                            series: data.series
                          })
                        }
                      />
                    </Menu>
                  }
                >
                  <Icon name="main-more" className={styles.verticalMoreIcon} color={Color.GREY_350} />
                </Popover>
              )}
            </Container>
          </React.Fragment>
        ))}
      </Container>
    </Container>
  )
}

export function useTimeseriesDetailsModal(transactionName: React.ReactNode, metricName: React.ReactNode) {
  const [range, setRange] = useState<{ startDate: number; endDate: number } | undefined>()
  const [seriesData, setSeriesData] = useState<SeriesConfig>()
  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        usePortal
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus
        onClose={hideModal}
        style={{ width: '80vw', borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}
      >
        <Container className={styles.detailsModal} padding="small" margin="xxxlarge">
          <TimeseriesRow
            transactionName={transactionName}
            metricName={metricName}
            seriesData={seriesData && [seriesData]}
            chartOptions={{
              chart: {
                height: 200,
                marginLeft: 50
              },
              yAxis: {
                labels: {
                  enabled: true,
                  style: {
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--grey-300)'
                  }
                }
              }
            }}
            withContextMenu={false}
          />
          {range && <TimelineBar className={styles.timelineBar} {...range} />}
          <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={styles.crossButton} />
        </Container>
      </Dialog>
    ),
    [seriesData]
  )
  return (data: SeriesConfig, options?: Highcharts.Options) => {
    setRange(extractTimeRange(data, options))
    setSeriesData(data)
    return openModal()
  }
}

export function extractTimeRange(data: SeriesConfig, options?: Highcharts.Options) {
  let start: number = (options?.xAxis as Highcharts.XAxisOptions)?.min ?? 0
  let end: number = (options?.xAxis as Highcharts.XAxisOptions)?.max ?? 0
  if (!start && !end) {
    const seriesWithData = data.series.filter(serie => serie.data?.length)
    if (seriesWithData.length) {
      start = Infinity
      end = -Infinity
      seriesWithData.forEach(serie => {
        serie?.data?.forEach((item: any) => {
          const timestamp = Array.isArray(item) ? item[0] : item.x
          start = Math.min(start, timestamp)
          end = Math.max(end, timestamp)
        })
      })
    }
  }
  if (start && end) {
    return {
      startDate: start,
      endDate: end
    }
  }
}

export function chartsConfig(series: Highcharts.SeriesLineOptions[]): Highcharts.Options {
  return {
    chart: {
      backgroundColor: 'transparent',
      height: 40,
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
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    yAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 1,
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
        return `<section class="serviceeGuardTimeSeriesTooltip"><p>${moment(this.x).format(
          'M/D/YYYY h:mm:ss a'
        )}</p><br/><p>Value: ${this.y}</p></section>`
      },
      outside: true
    },
    subtitle: undefined,
    series
  }
}

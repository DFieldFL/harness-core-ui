import React, { useState, useEffect, useMemo } from 'react'
import { Container, Icon, Color, Pagination } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  useGetAnomalousMetricDashboardData,
  TimeSeriesMetricDataDTO,
  useGetMetricData,
  RestResponsePageTimeSeriesMetricDataDTO,
  MetricData,
  DatasourceTypeDTO
} from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import { PageError } from '@common/components/Page/PageError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  TimeBasedShadedRegion,
  TimeBasedShadedRegionProps
} from '@cv/components/TimeBasedShadedRegion/TimeBasedShadedRegion'
import { useStrings } from 'framework/strings'
import MetricAnalysisRow from './MetricsAnalysisRow/MetricAnalysisRow'
import { getFilterOptions, MetricAnalysisFilter } from './MetricAnalysisFilter/MetricAnalysisFilter'
import { categoryNameToCategoryType } from '../../CVServicePageUtils'
import css from './MetricAnalysisView.module.scss'

const TIME_SERIES_ROW_HEIGHT = 65

export interface MetricAnalysisViewProps {
  startTime: number
  endTime: number
  categoryName?: string
  environmentIdentifier?: string
  serviceIdentifier?: string
  className?: string
  selectedMonitoringSource?: DatasourceTypeDTO['dataSourceType']
  historyStartTime?: number
  showHistorySelection?: boolean
  shadedRegionProps?: Omit<TimeBasedShadedRegionProps, 'parentRef' | 'height'>
}

export function generatePointsForTimeSeries(
  data: RestResponsePageTimeSeriesMetricDataDTO,
  startTime: number,
  endTime: number
): RestResponsePageTimeSeriesMetricDataDTO {
  if (!data?.resource?.content?.length) {
    return data
  }

  const content = data.resource.content
  const timeRange = Math.floor((endTime - startTime) / 60000)
  for (const analysis of content) {
    if (!analysis?.metricDataList?.length) {
      continue
    }

    analysis.metricDataList.sort((a: MetricData, b: MetricData) => {
      if (!a?.timestamp) {
        return b?.timestamp ? -1 : 0
      }
      if (!b?.timestamp) {
        return 1
      }
      return a.timestamp - b.timestamp
    })
    const filledMetricData: MetricData[] = []
    let metricDataIndex = 0

    for (let i = 0; i < timeRange; i++) {
      const currTime = startTime + 60000 * i
      const instantData = analysis.metricDataList[metricDataIndex]
      if (instantData?.timestamp && instantData.timestamp === currTime) {
        filledMetricData.push(analysis.metricDataList[metricDataIndex])
        metricDataIndex++
      } else {
        filledMetricData.push({ timestamp: currTime, value: undefined })
      }
    }

    analysis.metricDataList = filledMetricData
  }

  return data
}

export function MetricAnalysisView(props: MetricAnalysisViewProps): JSX.Element {
  const {
    className,
    startTime,
    endTime,
    historyStartTime,
    categoryName,
    environmentIdentifier,
    serviceIdentifier,
    showHistorySelection,
    selectedMonitoringSource,
    shadedRegionProps
  } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const [filter, setFilter] = useState<string | undefined>()
  const [timeSeriesRowRef, setTimeSeriesRowRef] = useState<HTMLDivElement | null>(null)
  const { getString } = useStrings()
  const finalStartTime = historyStartTime ?? startTime
  const queryParams = useMemo(
    () => ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      serviceIdentifier,
      monitoringCategory: categoryName ? categoryNameToCategoryType(categoryName) : undefined,
      startTime: finalStartTime,
      analysisStartTime: historyStartTime ? startTime : finalStartTime,
      endTime,
      datasourceType: selectedMonitoringSource,
      filter
    }),
    [
      serviceIdentifier,
      environmentIdentifier,
      finalStartTime,
      selectedMonitoringSource,
      endTime,
      categoryName,
      projectIdentifier,
      orgIdentifier,
      filter
    ]
  )
  const [isViewingAnomalousData, setMetricDataView] = useState(false)
  const [needsRefetch, setNeedsRefetch] = useState(true)

  const {
    data: anomalousMetricData,
    error: anomalousError,
    loading: loadingAnomalousData,
    cancel: cancelAnomalousCall,
    refetch: refetchAnomalousData
  } = useGetAnomalousMetricDashboardData({
    queryParams,
    lazy: true,
    resolve: response => generatePointsForTimeSeries(response, finalStartTime, endTime)
  })
  const {
    data: allMetricData,
    error: allMetricDataError,
    loading: loadingAllMetricData,
    cancel: cancelAllMetricDataCall,
    refetch: refetchAllMetricData
  } = useGetMetricData({
    queryParams,
    lazy: true,
    resolve: response => generatePointsForTimeSeries(response, finalStartTime, endTime)
  })

  useEffect(() => {
    if (isViewingAnomalousData) {
      refetchAnomalousData({ queryParams })
    } else {
      refetchAllMetricData({ queryParams })
    }
    setNeedsRefetch(true)
  }, [queryParams])

  if (allMetricDataError || anomalousError) {
    return (
      <PageError
        className={css.error}
        message={allMetricDataError?.message ?? anomalousError?.message}
        onClick={() => {
          if (isViewingAnomalousData) {
            refetchAnomalousData({ queryParams })
          } else {
            refetchAllMetricData({ queryParams })
          }
        }}
      />
    )
  }

  const data = isViewingAnomalousData ? anomalousMetricData : allMetricData
  const { pageSize, totalPages = 0, content, totalItems = 0, pageIndex } = (data?.resource as any) || {}
  const filterOptions = getFilterOptions(getString)

  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.header}>
        <MetricAnalysisFilter
          defaultFilterValue={isViewingAnomalousData ? filterOptions[0] : filterOptions[1]}
          onFilter={filterValue => {
            cancelAllMetricDataCall()
            cancelAnomalousCall()
            setFilter(filterValue)
          }}
          onChangeFilter={() => {
            cancelAllMetricDataCall()
            cancelAnomalousCall()
            setMetricDataView(prevView => {
              const isAnomalousView = !prevView
              if (isAnomalousView && (!anomalousMetricData?.resource?.content?.length || needsRefetch)) {
                refetchAnomalousData()
                setNeedsRefetch(false)
              } else if (!allMetricData?.resource?.content?.length || needsRefetch) {
                refetchAllMetricData()
                setNeedsRefetch(false)
              }
              return isAnomalousView
            })
          }}
        />
        <TimelineBar startDate={finalStartTime} endDate={endTime} className={css.timeline} columnWidth={70} />
      </Container>
      {!totalItems && !loadingAllMetricData && !loadingAnomalousData && (
        <NoDataCard
          message={isViewingAnomalousData ? getString('cv.noAnomalies') : getString('cv.noAnalysis')}
          icon="warning-sign"
          buttonText={getString('retry')}
          className={css.noDataCard}
          onClick={isViewingAnomalousData ? () => refetchAnomalousData() : () => refetchAllMetricData()}
        />
      )}

      {loadingAllMetricData || loadingAnomalousData ? (
        <Container className={css.loading}>
          <Icon name="steps-spinner" size={25} color={Color.GREY_600} />
        </Container>
      ) : (
        content?.map((d: TimeSeriesMetricDataDTO) => {
          const { category, groupName, metricDataList, metricName } = d
          return metricName && groupName && metricDataList?.length ? (
            <MetricAnalysisRow
              key={`${categoryName}-${groupName}-${metricName}`}
              metricName={metricName}
              categoryName={category}
              startTime={finalStartTime}
              endTime={endTime}
              transactionName={groupName}
              analysisData={metricDataList}
              displaySelectedTimeRange={showHistorySelection}
              setTimeSeriesRowRef={setTimeSeriesRowRef}
            />
          ) : null
        })
      )}
      {pageIndex !== -1 && (
        <Pagination
          pageSize={pageSize || 0}
          pageIndex={pageIndex}
          pageCount={totalPages}
          itemCount={totalItems}
          gotoPage={(selectedPageIndex: number) => {
            if (isViewingAnomalousData) {
              refetchAnomalousData({ queryParams: { ...queryParams, page: selectedPageIndex } })
            } else {
              refetchAllMetricData({ queryParams: { ...queryParams, page: selectedPageIndex } })
            }
          }}
        />
      )}
      {shadedRegionProps && !loadingAllMetricData && !loadingAnomalousData && (
        <TimeBasedShadedRegion
          {...shadedRegionProps}
          parentRef={timeSeriesRowRef}
          height={content?.length * TIME_SERIES_ROW_HEIGHT + 60}
        />
      )}
    </Container>
  )
}

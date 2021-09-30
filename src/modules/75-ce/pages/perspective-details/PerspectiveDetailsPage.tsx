import React, { useState, useEffect, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import { Button, Heading, Layout, Container, Text, Color } from '@wings-software/uicore'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import { useGetPerspective } from 'services/ce/'
import {
  useFetchPerspectiveTimeSeriesQuery,
  QlceViewTimeGroupType,
  useFetchPerspectiveDetailsSummaryWithBudgetQuery,
  QlceViewFilterInput,
  QlceViewFilterOperator,
  QlceViewFieldInputInput,
  useFetchperspectiveGridQuery,
  ViewChartType,
  ViewType,
  QlceViewAggregateOperation,
  useFetchPerspectiveTotalCountQuery
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { PageBody } from '@common/components/Page/PageBody'
import { PageSpinner } from '@common/components'
import PerspectiveGrid from '@ce/components/PerspectiveGrid/PerspectiveGrid'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import PerspectiveExplorerGroupBy from '@ce/components/PerspectiveExplorerGroupBy/PerspectiveExplorerGroupBy'
import PersepectiveExplorerFilters from '@ce/components/PersepectiveExplorerFilters/PerspectiveExplorerFilters'
import PerspectiveSummary from '@ce/components/PerspectiveSummary/PerspectiveSummary'
import {
  getViewFilterForId,
  getTimeFilters,
  getGroupByFilter,
  getTimeRangeFilter,
  getFilters,
  DEFAULT_GROUP_BY,
  perspectiveDefaultTimeRangeMapper,
  highlightNode,
  resetNodeState,
  clusterInfoUtil
} from '@ce/utils/perspectiveUtils'
import { AGGREGATE_FUNCTION } from '@ce/components/PerspectiveGrid/Columns'
import {
  DATE_RANGE_SHORTCUTS,
  getGMTStartDateTime,
  getGMTEndDateTime,
  CE_DATE_FORMAT_INTERNAL
} from '@ce/utils/momentUtils'
import EmptyView from '@ce/images/empty-state.svg'
import { CCM_CHART_TYPES } from '@ce/constants'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import css from './PerspectiveDetailsPage.module.scss'

const PAGE_SIZE = 10
interface PerspectiveParams {
  perspectiveId: string
  perspectiveName: string
  accountId: string
}

const PerspectiveHeader: React.FC<{ title: string; viewType: string }> = ({ title, viewType }) => {
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const history = useHistory()
  const { getString } = useStrings()
  const isDefaultPerspective = viewType === ViewType.Default

  const goToEditPerspective: () => void = () => {
    history.push(
      routes.toCECreatePerspective({
        perspectiveId,
        accountId
      })
    )
  }

  return (
    <Layout.Horizontal
      spacing="medium"
      style={{
        alignItems: 'center'
      }}
      flex={true}
      className={css.perspectiveHeader}
    >
      <Container
        style={{
          flexGrow: 1
        }}
      >
        <Breadcrumbs
          links={[
            {
              url: routes.toCEPerspectives({ accountId }),
              label: getString('ce.perspectives.sideNavText')
            },
            {
              label: '',
              url: '#'
            }
          ]}
        />
        <Heading color="grey800" level={2} style={{ flexGrow: 1 }}>
          {title}
        </Heading>
      </Container>

      <Button
        disabled={isDefaultPerspective}
        text={getString('edit')}
        icon="edit"
        intent="primary"
        onClick={goToEditPerspective}
      />
    </Layout.Horizontal>
  )
}

const PerspectiveDetailsPage: React.FC = () => {
  const history = useHistory()
  const { perspectiveId, accountId } = useParams<PerspectiveParams>()
  const { getString } = useStrings()

  const { data: perspectiveRes, loading } = useGetPerspective({
    queryParams: {
      perspectiveId: perspectiveId
    }
  })

  const chartRef = useRef<Highcharts.Chart>()

  const perspectiveData = perspectiveRes?.resource

  const { isClusterOnly, hasClusterAsSource } = clusterInfoUtil(perspectiveData?.dataSources)

  const [gridPageOffset, setGridPageOffset] = useState(0) // This tells us the starting point of next data fetching(used in the api call)
  const [gridPageIndex, setPageIndex] = useState(0) // [Pagination] tells us the current page we are in the grid

  const [chartType, setChartType] = useState<CCM_CHART_TYPES>(CCM_CHART_TYPES.COLUMN)
  const [aggregation, setAggregation] = useState<QlceViewTimeGroupType>(QlceViewTimeGroupType.Day)
  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(DEFAULT_GROUP_BY)
  const [filters, setFilters] = useState<QlceViewFilterInput[]>([])
  const [columnSequence, setColumnSequence] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<{ to: string; from: string }>({
    to: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  useEffect(() => {
    if (perspectiveData) {
      const cType =
        perspectiveData.viewVisualization?.chartType === ViewChartType.StackedTimeSeries
          ? CCM_CHART_TYPES.COLUMN
          : CCM_CHART_TYPES.AREA
      setChartType(cType)
      perspectiveData.viewVisualization?.granularity &&
        setAggregation(perspectiveData.viewVisualization?.granularity as QlceViewTimeGroupType)
      perspectiveData.viewVisualization?.groupBy &&
        setGroupBy(perspectiveData.viewVisualization.groupBy as QlceViewFieldInputInput)

      const dateRange =
        (perspectiveData.viewTimeRange?.viewTimeRangeType &&
          perspectiveDefaultTimeRangeMapper[perspectiveData.viewTimeRange?.viewTimeRangeType]) ||
        DATE_RANGE_SHORTCUTS.LAST_7_DAYS

      setTimeRange({
        to: dateRange[1].format(CE_DATE_FORMAT_INTERNAL),
        from: dateRange[0].format(CE_DATE_FORMAT_INTERNAL)
      })
    }
  }, [perspectiveData])

  const setFilterUsingChartClick: (value: string) => void = value => {
    setFilters(prevFilter => [
      ...prevFilter,
      {
        field: { ...groupBy },
        operator: QlceViewFilterOperator.In,
        values: [value]
      }
    ])
  }

  const [chartResult] = useFetchPerspectiveTimeSeriesQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        ...getFilters(filters)
      ],
      limit: 12,
      groupBy: [getTimeRangeFilter(aggregation), getGroupByFilter(groupBy)]
    }
  })

  const [summaryResult] = useFetchPerspectiveDetailsSummaryWithBudgetQuery({
    variables: {
      isClusterQuery: false,
      aggregateFunction: [
        { operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' },
        { operationType: QlceViewAggregateOperation.Max, columnName: 'startTime' },
        { operationType: QlceViewAggregateOperation.Min, columnName: 'startTime' }
      ],
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        ...getFilters(filters)
      ]
    }
  })

  const getAggregationFunc = () => {
    const af = AGGREGATE_FUNCTION[groupBy.fieldId]
    if (!af) {
      return isClusterOnly ? AGGREGATE_FUNCTION.CLUSTER : AGGREGATE_FUNCTION.DEFAULT
    }

    return af
  }

  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: getAggregationFunc(),
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        ...getFilters(filters)
      ],
      isClusterOnly: isClusterOnly,
      limit: PAGE_SIZE,
      offset: gridPageOffset,
      groupBy: [getGroupByFilter(groupBy)]
    }
  })

  const [perspectiveTotalCountResult] = useFetchPerspectiveTotalCountQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        ...getFilters(filters)
      ],
      groupBy: [getGroupByFilter(groupBy)],
      isClusterQuery: isClusterOnly
    }
  })

  const { data: chartData, fetching: chartFetching } = chartResult
  const { data: gridData, fetching: gridFetching } = gridResults
  const { data: summaryData, fetching: summaryFetching } = summaryResult
  const { data: { perspectiveTotalCount } = {} } = perspectiveTotalCountResult

  const goToWorkloadDetails = (clusterName: string, namespace: string, workloadName: string) => {
    history.push(
      routes.toCEPerspectiveWorkloadDetails({
        accountId,
        perspectiveId,
        perspectiveName: perspectiveData?.name || perspectiveId,
        clusterName,
        namespace,
        workloadName
      })
    )
  }

  const isChartGridEmpty =
    chartData?.perspectiveTimeSeriesStats?.stats?.length === 0 &&
    gridData?.perspectiveGrid?.data?.length === 0 &&
    !chartFetching &&
    !gridFetching

  return (
    <>
      <PageHeader
        title={
          <PerspectiveHeader
            title={perspectiveData?.name || perspectiveId}
            viewType={perspectiveData?.viewType || ViewType.Default}
          />
        }
      />
      <PageBody>
        {loading && <PageSpinner />}
        <PersepectiveExplorerFilters
          setFilters={setFilters}
          filters={filters}
          setAggregation={setAggregation}
          aggregation={aggregation}
          setTimeRange={setTimeRange}
          timeRange={timeRange}
          showHourlyAggr={isClusterOnly}
        />
        <PerspectiveSummary
          data={summaryData?.perspectiveTrendStats as any}
          fetching={summaryFetching}
          forecastedCostData={summaryData?.perspectiveForecastCost as any}
          isDefaultPerspective={!!(perspectiveData?.viewType === ViewType.Default)}
          hasClusterAsSource={hasClusterAsSource}
        />
        <Container margin="xlarge" background="white" className={css.chartGridContainer}>
          {!isChartGridEmpty && (
            <Container padding="small">
              <PerspectiveExplorerGroupBy
                chartType={chartType}
                setChartType={setChartType}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
              />
              <CloudCostInsightChart
                showLegends={true}
                ref={chartRef as any}
                chartType={chartType}
                columnSequence={columnSequence}
                setFilterUsingChartClick={setFilterUsingChartClick}
                fetching={chartFetching}
                data={chartData?.perspectiveTimeSeriesStats as any}
                aggregation={aggregation}
                xAxisPointCount={chartData?.perspectiveTimeSeriesStats?.stats?.length || DAYS_FOR_TICK_INTERVAL + 1}
              />
            </Container>
          )}
          {!isChartGridEmpty && (
            <PerspectiveGrid
              goToWorkloadDetails={goToWorkloadDetails}
              isClusterOnly={isClusterOnly}
              gridData={gridData?.perspectiveGrid?.data as any}
              gridFetching={gridFetching}
              columnSequence={columnSequence}
              highlightNode={
                /* istanbul ignore next */
                id => {
                  highlightNode(chartRef, id)
                }
              }
              resetNodeState={
                /* istanbul ignore next */
                () => {
                  resetNodeState(chartRef)
                }
              }
              setColumnSequence={colSeq => setColumnSequence(colSeq)}
              groupBy={groupBy}
              totalItemCount={perspectiveTotalCount || 0}
              gridPageIndex={gridPageIndex}
              pageSize={PAGE_SIZE}
              fetchData={(pageIndex, pageSize) => {
                setPageIndex(pageIndex)
                setGridPageOffset(pageIndex * pageSize)
              }}
            />
          )}
          {isChartGridEmpty && (
            <Container className={cx(css.chartGridContainer, css.empty)}>
              <img src={EmptyView} />
              <Text
                margin={{
                  top: 'large',
                  bottom: 'xsmall'
                }}
                font="small"
                style={{
                  fontWeight: 600
                }}
                color={Color.GREY_500}
              >
                {getString('ce.pageErrorMsg.noDataMsg')}
              </Text>
              <Text font="small">{getString('ce.pageErrorMsg.perspectiveNoData')}</Text>
            </Container>
          )}
        </Container>
      </PageBody>
    </>
  )
}

export default PerspectiveDetailsPage

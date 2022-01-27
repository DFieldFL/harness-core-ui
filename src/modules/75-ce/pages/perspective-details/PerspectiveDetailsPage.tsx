/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import cronstrue from 'cronstrue'
import cx from 'classnames'
import {
  Button,
  Heading,
  Layout,
  Container,
  Text,
  Color,
  PageHeader,
  PageBody,
  Icon,
  FontVariation
} from '@wings-software/uicore'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import { useGetPerspective, useGetReportSetting } from 'services/ce/'
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
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import EmptyView from '@ce/images/empty-state.svg'
import { CCM_CHART_TYPES, ENFORCEMENT_USAGE_THRESHOLD } from '@ce/constants'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FeatureWarningSubscriptionInfoBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionInfoBanner'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PAGE_EVENTS } from '@ce/TrackingEventsConstants'
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

  const { data, loading } = useGetReportSetting({
    accountIdentifier: accountId,
    queryParams: { perspectiveId }
  })

  const reports = data?.data || []

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
        <Layout.Horizontal spacing="small">
          <Heading color="grey800" level={2}>
            {title}
          </Heading>
          <Container
            padding={{
              top: 'xsmall'
            }}
          >
            {loading ? <Icon name="spinner" color={Color.BLUE_500} /> : null}

            {reports.length ? (
              <Container flex>
                <Icon name="notification" size={14} color={Color.PRIMARY_7} />
                <Text
                  margin={{
                    left: 'xsmall'
                  }}
                  color={Color.GREY_500}
                  font={{ variation: FontVariation.SMALL }}
                >
                  {getString('ce.perspectives.perspectiveReportsTxt', {
                    reportInfo: cronstrue.toString(reports[0].userCron || '')
                  })}
                </Text>
                {reports.length > 1 ? (
                  <Text
                    margin={{
                      left: 'xsmall'
                    }}
                    color={Color.GREY_500}
                    font={{ variation: FontVariation.SMALL }}
                  >
                    {getString('ce.perspectives.perspectiveReportsMoreTxt', {
                      count: reports.length - 1
                    })}
                  </Text>
                ) : null}
              </Container>
            ) : null}
          </Container>
        </Layout.Horizontal>
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

  const { trackPage } = useTelemetry()

  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CE)

  const { data: perspectiveRes, loading } = useGetPerspective({
    queryParams: {
      perspectiveId: perspectiveId,
      accountIdentifier: accountId
    }
  })

  const chartRef = useRef<Highcharts.Chart>()

  const perspectiveData = perspectiveRes?.data

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
    trackPage(PAGE_EVENTS.PERSPECTIVE_DETAILS_PAGE, {})
  }, [])

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
    if (!isClusterOnly) {
      return AGGREGATE_FUNCTION.DEFAULT
    }

    const af = AGGREGATE_FUNCTION[groupBy.fieldId]
    if (!af) {
      return AGGREGATE_FUNCTION.CLUSTER
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

  const goToNodeDetails = (clusterName: string, nodeId: string) => {
    history.push(
      routes.toCEPerspectiveNodeDetails({
        accountId,
        perspectiveId,
        perspectiveName: perspectiveData?.name || perspectiveId,
        clusterName,
        nodeId
      })
    )
  }

  const isChartGridEmpty =
    chartData?.perspectiveTimeSeriesStats?.stats?.length === 0 &&
    gridData?.perspectiveGrid?.data?.length === 0 &&
    !chartFetching &&
    !gridFetching

  const featureEnforced = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)

  const { licenseInformation } = useLicenseStore()
  const isFreeEdition = licenseInformation['CE']?.edition === ModuleLicenseType.FREE

  const totalSpend = limitData.limit?.ccm?.totalSpendLimit || 1
  const activeSpend = usageData.usage?.ccm?.activeSpend?.count || 0

  const usagePercentage = Math.ceil((activeSpend / totalSpend) * 100)

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
          featureEnabled={!isFreeEdition}
          setFilters={setFilters}
          filters={filters}
          setAggregation={setAggregation}
          aggregation={aggregation}
          setTimeRange={setTimeRange}
          timeRange={timeRange}
          showHourlyAggr={isClusterOnly}
        />
        {featureEnforced && usagePercentage > ENFORCEMENT_USAGE_THRESHOLD ? (
          <FeatureWarningSubscriptionInfoBanner
            featureName={FeatureIdentifier.PERSPECTIVES}
            message={getString('ce.perspectives.featureWarningSubInfoText', { usagePercentage: usagePercentage })}
          />
        ) : null}
        <PerspectiveSummary
          data={summaryData?.perspectiveTrendStats as any}
          fetching={summaryFetching}
          forecastedCostData={summaryData?.perspectiveForecastCost as any}
          isDefaultPerspective={!!(perspectiveData?.viewType === ViewType.Default)}
          hasClusterAsSource={hasClusterAsSource}
        />
        <Container
          margin="xlarge"
          background="white"
          className={cx(css.chartGridContainer, { [css.emptyContainer]: isChartGridEmpty })}
        >
          <Container padding="small">
            <PerspectiveExplorerGroupBy
              chartType={chartType}
              setChartType={setChartType}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              timeFilter={getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to))}
            />
            {!isChartGridEmpty && (
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
            )}
          </Container>

          {isChartGridEmpty && (
            <Container className={css.emptyIllustrationContainer}>
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

          <PerspectiveGrid
            goToWorkloadDetails={goToWorkloadDetails}
            goToNodeDetails={goToNodeDetails}
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
        </Container>
      </PageBody>
    </>
  )
}

export default PerspectiveDetailsPage

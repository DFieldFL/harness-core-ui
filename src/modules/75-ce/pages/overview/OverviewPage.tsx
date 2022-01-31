/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { Container, Text, Page } from '@wings-software/uicore'
import { get } from 'lodash-es'
import {
  CcmMetaData,
  StatsInfo,
  useFetchCcmMetaDataQuery,
  useFetchPerspectiveDetailsSummaryQuery
} from 'services/ce/services'
import { getTimeFilters } from '@ce/utils/perspectiveUtils'
import {
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  getGMTEndDateTime,
  getGMTStartDateTime
} from '@ce/utils/momentUtils'
import { AGGREGATE_FUNCTION } from '@ce/components/PerspectiveGrid/Columns'
import OverviewClusterCostBreakdown from '@ce/components/OverviewPage/OverviewClusterCostBreakdown'
import OverviewCloudCost, { OverviewLayout } from '@ce/components/OverviewPage/OverviewCloudCost'
import OverviewSummary from '@ce/components/OverviewPage/OverviewSummary'
import OverviewTopCluster from '@ce/components/OverviewPage/OverviewTopClusters'
import OverviewTopRecommendations from '@ce/components/OverviewPage/OverviewTopRecommendations'
import OverviewCostByProviders from '@ce/components/OverviewPage/OverviewCostByProviders'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import { PageSpinner } from '@common/components'
import OverviewAddCluster from '@ce/components/OverviewPage/OverviewAddCluster'
import { Utils } from '@ce/common/Utils'
import { useCreateConnectorMinimal } from '@ce/components/CreateConnector/CreateConnector'
import NoData from '@ce/components/OverviewPage/OverviewNoData'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FeatureWarningUpgradeBanner from '@common/components/FeatureWarning/FeatureWarningUpgradeBanner'
import { ENFORCEMENT_USAGE_THRESHOLD } from '@ce/constants'
import formatCost from '@ce/utils/formatCost'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import bgImage from './images/CD/overviewBg.png'
import css from './Overview.module.scss'

export interface TimeRange {
  to: string
  from: string
}

interface NoDataOverviewPageProps {
  showConnectorModal?: boolean
}

const NoDataOverviewPage: React.FC<NoDataOverviewPageProps> = (props: NoDataOverviewPageProps) => {
  const { showConnectorModal } = props

  // Only one will be shown at a time.
  // If the props says showConnectorModal = true,
  // the NoDataOverlay will not be shown
  const [showNoDataOverlay, setShowNoDataOverlay] = useState(!showConnectorModal)
  const { openModal, closeModal } = useCreateConnectorMinimal({
    portalClassName: css.excludeSideNavOverlay,
    onSuccess: () => {
      closeModal()
    }
  })

  useEffect(() => {
    showConnectorModal && openModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = (): void => {
    setShowNoDataOverlay(false)
    openModal()
  }

  return (
    <div
      className={css.body}
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}
    >
      {showNoDataOverlay && <NoData onConnectorCreateClick={handleClick} />}
    </div>
  )
}

const OverviewPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  const featureEnforced = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)

  const [summaryResult] = useFetchPerspectiveDetailsSummaryQuery({
    variables: {
      isClusterQuery: false,
      aggregateFunction: AGGREGATE_FUNCTION.COST_AND_TIME,
      filters: [...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to))]
    }
  })

  const { data: summaryData, fetching: summaryFetching } = summaryResult
  const cloudCost = (summaryData?.perspectiveTrendStats?.cost || {}) as StatsInfo
  const forecastedCost = (summaryData?.perspectiveForecastCost?.cost || {}) as StatsInfo

  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()
  const { data: ccmData, fetching: fetchingCCMMetaData } = ccmMetaResult
  const {
    cloudDataPresent,
    clusterDataPresent,
    defaultAwsPerspectiveId,
    defaultAzurePerspectiveId,
    defaultClusterPerspectiveId,
    defaultGcpPerspectiveId
  } = (ccmData?.ccmMetaData || {}) as CcmMetaData

  if (fetchingCCMMetaData) {
    return <PageSpinner />
  }

  if (ccmData && !Utils.accountHasConnectors(ccmData.ccmMetaData as CcmMetaData)) {
    return <NoDataOverviewPage showConnectorModal />
  }

  if (ccmData && !cloudDataPresent && !clusterDataPresent) {
    return <NoDataOverviewPage />
  }

  return (
    <Container className={css.body}>
      <Page.Header
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmOverviewTitle' }}
          >
            Overview
          </Text>
        }
        content={<PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />}
      />
      <Page.Body>
        {featureEnforced ? <CEUsageInfo /> : null}
        <Container padding={{ top: 'medium', right: 'xlarge', bottom: 'medium', left: 'xlarge' }}>
          <div className={css.mainContainer}>
            <div className={css.columnOne}>
              <div className={cx(css.summary, css.noColor)}>
                <OverviewSummary cost={cloudCost} fetching={summaryFetching} name="TotalCost" />
                <OverviewSummary cost={forecastedCost} fetching={summaryFetching} name="ForecastedCost" />
              </div>
              {clusterDataPresent && (
                <OverviewClusterCostBreakdown
                  timeRange={timeRange}
                  defaultClusterPerspectiveId={defaultClusterPerspectiveId}
                />
              )}
              {!clusterDataPresent && cloudDataPresent && (
                <OverviewCloudCost
                  layout={OverviewLayout.VERTICAL}
                  timeRange={timeRange}
                  providers={{
                    defaultAwsPerspectiveId,
                    defaultAzurePerspectiveId,
                    defaultGcpPerspectiveId
                  }}
                />
              )}
              {clusterDataPresent && cloudDataPresent && (
                <OverviewCloudCost
                  layout={OverviewLayout.HORIZONTAL}
                  timeRange={timeRange}
                  providers={{
                    defaultAwsPerspectiveId,
                    defaultAzurePerspectiveId,
                    defaultGcpPerspectiveId
                  }}
                />
              )}
              {!cloudDataPresent && clusterDataPresent && <OverviewTopCluster timeRange={timeRange} />}
            </div>
            <div className={css.columnTwo}>
              <OverviewCostByProviders timeRange={timeRange} clusterDataPresent={clusterDataPresent} />
              {clusterDataPresent && <OverviewTopRecommendations />}
              {/* <div>PUT AUTOSTOPPING COMPONENT HERE</div> */}
            </div>
          </div>
          {!clusterDataPresent && (
            <OverviewAddCluster
              onAddClusterSuccess={() => {
                refetchCCMMetaData({ requestPolicy: 'network-only' })
              }}
            />
          )}
        </Container>
      </Page.Body>
    </Container>
  )
}

// enable this when useGetUsageAndLimit is implemented by the GTM Team
// calculate the percentage utilisation
// Just confirm if we need to show the banner only if the utilisation
// reaches above certain threshold.
//
// Also, there are certain TODOs in this component, complete them
// for full functionality

const CEUsageInfo = () => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CE)
  const isLoading = limitData.loadingLimit || usageData.loadingUsage
  if (isLoading) {
    return null
  }

  const { usage } = usageData
  const { limit } = limitData

  const usageCost = get(usage, 'ccm.activeSpend.count', 0)
  const limitCost = get(limit, 'ccm.totalSpendLimit', 1)

  const usagePercentage = (usageCost / limitCost) * 100
  if (usagePercentage < ENFORCEMENT_USAGE_THRESHOLD) {
    return null
  }

  return (
    <FeatureWarningUpgradeBanner
      featureName={FeatureIdentifier.PERSPECTIVES}
      message={`You have used ${formatCost(Number(usageCost), {
        shortFormat: true
      })} / ${formatCost(Number(limitCost), {
        shortFormat: true
      })} free cloud spend incuded in your current plan. Consider upgrading to manage higher cloud spend.`}
    />
  )
}

export default OverviewPage

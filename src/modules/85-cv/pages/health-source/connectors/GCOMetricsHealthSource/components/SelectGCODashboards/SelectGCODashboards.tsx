/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo } from 'react'
import { StackdriverDashboardDTO, useGetStackdriverDashboards } from 'services/cv'

import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import MetricsDashboardList from '@cv/components/MetricsDashboardList/MetricsDashboardList'
import type { TableDashboardItem } from '@cv/components/MetricsDashboardList/MetricsDashboardList.type'
import { transformGCOMetricHealthSourceToGCOMetricSetupSource } from '../../GCOMetricsHealthSource.utils'

export function SelectGCODashboards(): JSX.Element {
  const { sourceData } = useContext(SetupSourceTabsContext)
  const dashboardItemMapper: (dashboard: StackdriverDashboardDTO) => TableDashboardItem = useCallback(dashboard => {
    return {
      name: dashboard.name,
      id: dashboard.path
    }
  }, [])

  const selectedDashboards = useMemo(() => {
    return (
      sourceData.selectedDashboards ||
      transformGCOMetricHealthSourceToGCOMetricSetupSource(sourceData).selectedDashboards
    )
  }, [sourceData])
  return (
    <MetricsDashboardList<StackdriverDashboardDTO>
      manualQueryInputTitle={'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'}
      dashboardsRequest={useGetStackdriverDashboards({ lazy: true })}
      defaultItemIcon={'service-datadog'}
      tableTitle={'cv.monitoringSources.datadog.selectDashboardsPage.dashboardColumnName'}
      selectedDashboardList={selectedDashboards || []}
      tableItemMapper={dashboardItemMapper}
    />
  )
}

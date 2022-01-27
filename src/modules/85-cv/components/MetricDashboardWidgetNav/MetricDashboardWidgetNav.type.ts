/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturn } from 'restful-react'
import type { StringKeys } from 'framework/strings'

export interface MetricWidget {
  widgetName: string
  dataSets: {
    id: string
    name: string
    query: string | { [key: string]: any }
  }[]
}

export interface MetricDashboardItem {
  itemId: string
  title: string
}

export interface MetricDashboardWidgetNavProps<T> {
  className?: string
  dashboards: MetricDashboardItem[]
  manuallyInputQueries?: string[]
  connectorIdentifier: string
  onSelectMetric: (
    id: string,
    metricName: string,
    query: string,
    widgetName?: string,
    dashboardId?: string,
    dashboardTitle?: string
  ) => void
  showSpinnerOnLoad?: boolean
  addManualQueryTitle: StringKeys
  dashboardWidgetMapper: (dashboardId: string, item: T) => MetricWidget
  dashboardDetailsRequest: UseGetReturn<any, any, any>
}

export interface TreeNodeLabelProps {
  width: number
  label: string | JSX.Element
}

export type NodeDataType = {
  type: string
  data?: any
}

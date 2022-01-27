/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StackdriverDashboardDTO } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface GCOMetricInfo {
  dashboardName?: string
  dashboardPath?: string
  metricName?: string
  query?: string
  environment?: SelectOption
  service?: SelectOption
  metricTags?: { [key: string]: string }
  riskCategory?: string
  higherBaselineDeviation?: boolean
  lowerBaselineDeviation?: boolean
  isManualQuery?: boolean
  tooManyMetrics?: boolean
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  serviceInstanceField?: string
  identifier?: string
}

export interface GCOMetricSetupSource {
  isEdit: boolean
  metricDefinition: Map<string, GCOMetricInfo> // metricName to MapPrometheusQueryToService
  selectedDashboards: StackdriverDashboardDTO[]
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: string
}

export interface GCOMetricsHealthSourceProps {
  data: any
  onSubmit: (formdata: GCOMetricSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export interface ValidationChartProps {
  loading: boolean
  error?: string
  queryValue?: string
  onRetry: () => void
  sampleData?: Highcharts.Options
  setAsTooManyMetrics?: (_: boolean) => void
  isQueryExecuted?: boolean
}

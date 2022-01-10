/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { MetricPackDTO } from 'services/cv'

export interface DynatraceHealthSourceContainerProps {
  data: any
  onSubmit: (formdata: any, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}
export interface DynatraceHealthSourceProps {
  dynatraceFormData: DynatraceFormDataInterface
  onSubmit: (dynatraceMetricData: DynatraceMetricData) => Promise<void>
  onPrevious: () => void
  connectorIdentifier: string
}

export interface DynatraceMetricInfo {
  metricName?: string
  identifier?: string
  groupName?: SelectOption
  metricSelector?: string
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  isNew?: boolean
  isManualQuery?: boolean
}

export interface DynatraceMetricData {
  connectorRef: string
  isEdit?: boolean
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  selectedService: SelectOption
  serviceMethods?: string[]
  metricPacks?: MetricPackDTO[]
  metricData: { [key: string]: boolean }
  customMetrics?: Map<string, DynatraceMetricInfo>
  showCustomMetric?: boolean
}

export interface DynatraceFormDataInterface extends DynatraceMetricData, DynatraceMetricInfo {}

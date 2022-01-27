/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GroupedMetric } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav.types'
import type {
  CreatedMetricsWithSelectedIndex,
  MapAppDynamicsMetric,
  SelectedAndMappedMetrics
} from '../../AppDHealthSource.types'

export interface AppDMappedMetricInterface {
  setMappedMetrics: React.Dispatch<React.SetStateAction<SelectedAndMappedMetrics>>
  selectedMetric: string
  formikValues: MapAppDynamicsMetric
  formikSetField: (key: string, value: any) => void
  connectorIdentifier: string
  mappedMetrics: Map<string, MapAppDynamicsMetric>
  createdMetrics: string[]
  isValidInput: boolean
  setCreatedMetrics: React.Dispatch<React.SetStateAction<CreatedMetricsWithSelectedIndex>>
}

export interface GroupedCreatedMetrics {
  [Key: string]: GroupedMetric[]
}

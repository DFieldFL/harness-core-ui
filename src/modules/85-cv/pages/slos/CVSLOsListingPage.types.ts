/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { MonitoredServiceDTO, RiskCount, SLODashboardWidget } from 'services/cv'
import type { SLOActionTypes } from './CVSLOsListingPage.constants'

export interface CVSLOsListingPageProps {
  monitoredService?: Pick<MonitoredServiceDTO, 'name' | 'identifier'>
}

// SLOCardHeader

export interface SLOCardHeaderProps {
  serviceLevelObjective: SLODashboardWidget
  onDelete: (identifier: string, name: string) => void
  monitoredServiceIdentifier?: string
}

// SLOCardContent

export interface SLOCardContentProps {
  serviceLevelObjective: SLODashboardWidget
}

export enum SLOCardToggleViews {
  SLO = 'SLO',
  ERROR_BUDGET = 'ERROR_BUDGET'
}

export interface GetSLOAndErrorBudgetGraphOptions {
  minXLimit: number
  maxXLimit: number
  type: SLOCardToggleViews
  serviceLevelObjective: SLODashboardWidget
}

export type RiskTypes = 'HEALTHY' | 'OBSERVE' | 'NEED_ATTENTION' | 'UNHEALTHY' | 'EXHAUSTED'

export interface SLODashboardRiskCount {
  displayName?: string
  count?: number
  identifier?: RiskTypes
}

export interface SLORiskFilter extends RiskCount {
  displayColor: string
}

export type SLITypes = 'Availability' | 'Latency' | 'All'
export type SLITypesParams = 'Availability' | 'Latency'
export type TargetTypes = 'Rolling' | 'Calender' | 'All'
export type TargetTypesParams = 'Rolling' | 'Calender'

export interface SLOFilterState {
  userJourney: SelectOption
  monitoredService: SelectOption
  sliTypes: SelectOption
  targetTypes: SelectOption
  sloRiskFilter: SLORiskFilter | null
}

export interface SLOFilterAction {
  type: SLOActionTypes
  payload?: SLOActionPayload
}

export interface SLOActionPayload {
  userJourney?: SelectOption
  monitoredService?: SelectOption
  sliTypes?: SelectOption
  targetTypes?: SelectOption
  sloRiskFilter?: SLORiskFilter | null
}

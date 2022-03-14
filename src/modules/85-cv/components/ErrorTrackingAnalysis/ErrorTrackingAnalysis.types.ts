/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SeriesLineOptions } from 'highcharts'
import type { LogData } from 'services/cv'

export type ErrorTrackingAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesLineOptions[]
  riskScore: number
  riskStatus: LogData['riskStatus']
}

export interface ErrorTrackingAnalysisProps {
  monitoredServiceIdentifier: string
  startTime: number
  endTime: number
}

export enum ErrorTrackingEvents {
  KNOWN = 'KNOWN',
  UNKNOWN = 'UNKNOWN',
  UNEXPECTED = 'UNEXPECTED'
}

export interface ErrorTrackingAnalysisContentProps extends ErrorTrackingAnalysisProps {
  logEvent: ErrorTrackingEvents
  healthSource?: string
}

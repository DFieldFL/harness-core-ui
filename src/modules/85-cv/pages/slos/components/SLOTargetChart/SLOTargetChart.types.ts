/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type Highcharts from 'highcharts'
import type { ServiceLevelIndicatorDTO, TimeGraphResponse } from 'services/cv'

export interface SLOTargetChartProps {
  topLabel?: JSX.Element
  bottomLabel?: JSX.Element
  dataPoints?: Highcharts.SeriesColumnOptions['data']
  customChartOptions?: Highcharts.Options
}

export interface SLOTargetChartWithAPIGetSliGraphProps extends SLOTargetChartProps {
  serviceLevelIndicator: ServiceLevelIndicatorDTO
  monitoredServiceIdentifier?: string
  sliGraphData?: TimeGraphResponse
  loading?: boolean
  error?: string
  retryOnError: (serviceLevelIndicator: ServiceLevelIndicatorDTO, monitoredServiceIdentifier?: string) => void
  debounceFetchSliGraphData?: (
    serviceLevelIndicator: ServiceLevelIndicatorDTO,
    monitoredServiceIdentifier?: string
  ) => Promise<void>
}

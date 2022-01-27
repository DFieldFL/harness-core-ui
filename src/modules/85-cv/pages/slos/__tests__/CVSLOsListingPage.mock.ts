/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageSLODashboardWidget, ResponsePageUserJourneyResponse, SLODashboardWidget } from 'services/cv'
import type { TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import { SLIMetricEnum } from '../components/CVCreateSLO/components/CreateSLOForm/components/SLI/SLI.constants'
import { PeriodTypes, SLITypes } from '../components/CVCreateSLO/CVCreateSLO.types'

export const errorMessage = 'TEST ERROR MESSAGE'

export const pathParams = {
  accountId: 'account_id',
  projectIdentifier: 'project_identifier',
  orgIdentifier: 'org_identifier'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVSLOs({ ...projectPathProps, module: 'cv' }),
  pathParams
}

export const dashboardWidgetsContent: SLODashboardWidget = {
  burnRate: {
    currentRatePercentage: 90
  },
  currentPeriodEndTime: 9000,
  currentPeriodLengthDays: 10,
  currentPeriodStartTime: 8000,
  errorBudgetBurndown: [],
  errorBudgetRemaining: 60,
  errorBudgetRemainingPercentage: 60,
  errorBudgetRisk: RiskValues.HEALTHY,
  healthSourceIdentifier: 'health_source_identifier',
  healthSourceName: 'Health Source Name',
  monitoredServiceIdentifier: 'monitored_service_identifier',
  monitoredServiceName: 'Monitored Service Name',
  sloIdentifier: 'slo_identifier',
  sloPerformanceTrend: [
    { timestamp: 1639993380000, value: 0 },
    { timestamp: 1639993440000, value: 0 }
  ],
  sloTargetPercentage: 60,
  sloTargetType: PeriodTypes.ROLLING,
  tags: {},
  timeRemainingDays: 10,
  title: 'Title',
  totalErrorBudget: 100,
  type: SLITypes.AVAILABILITY,
  serviceIdentifier: 'service',
  environmentIdentifier: 'env',
  environmentName: 'env',
  serviceName: 'serviceName'
}

export const dashboardWidgetsResponse: ResponsePageSLODashboardWidget = {
  data: {
    totalItems: 1,
    totalPages: 1,
    pageIndex: 0,
    pageItemCount: 1,
    pageSize: 4,
    content: [dashboardWidgetsContent]
  }
}

export const userJourneyResponse: ResponsePageUserJourneyResponse = {
  data: {
    content: [
      { userJourney: { name: 'First Journey', identifier: 'First_Journey' } },
      { userJourney: { name: 'Second Journey', identifier: 'Second_Journey' } }
    ]
  }
}

export const initialFormData = {
  name: '',
  identifier: '',
  description: '',
  tags: {},
  userJourneyRef: '',
  monitoredServiceRef: '',
  healthSourceRef: '',
  serviceLevelIndicators: {
    name: '',
    identifier: '',
    type: 'latency',
    spec: {
      type: SLIMetricEnum.RATIO,
      spec: {
        eventType: '',
        metric1: '',
        metric2: ''
      }
    }
  },
  target: {
    type: '',
    sloTargetPercentage: 10,
    spec: {
      periodLength: '',
      startDate: '',
      endDate: ''
    }
  }
}

export const initialStateForDisableTest = {
  userJourney: { label: 'all', value: 'all' },
  monitoredService: { label: 'all', value: 'all' },
  sliTypes: { label: 'all', value: 'all' },
  targetTypes: { label: 'all', value: 'all' },
  sloRiskFilter: null
}

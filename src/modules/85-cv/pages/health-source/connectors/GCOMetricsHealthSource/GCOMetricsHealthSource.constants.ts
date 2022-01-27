/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const OVERALL = 'overall'
export const FieldNames = {
  IDENTIFIER: 'identifier',
  METRIC_TAGS: 'metricTags',
  METRIC_NAME: 'metricName',
  QUERY: 'query',
  SERVICE: 'service',
  ENVIRONMENT: 'environment',
  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',
  SLI: 'sli',
  SERVICE_INSTANCE_FIELD: 'serviceInstanceField'
}

export const DrawerOptions = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true
}

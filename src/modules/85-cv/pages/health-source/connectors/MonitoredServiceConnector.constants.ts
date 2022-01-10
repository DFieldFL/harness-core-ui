/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum HealthSoureSupportedConnectorTypes {
  APP_DYNAMICS = 'APP_DYNAMICS',
  NEW_RELIC = 'NEW_RELIC',
  DYNATRACE = 'DYNATRACE'
}

export const StatusState = {
  NO_DATA: 'NO_DATA',
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS'
}

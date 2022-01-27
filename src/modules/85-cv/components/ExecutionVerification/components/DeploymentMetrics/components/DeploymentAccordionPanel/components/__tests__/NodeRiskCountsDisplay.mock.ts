/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NodeRiskCount, NodeRiskCountDTO } from 'services/cv'

export const riskCountData: NodeRiskCount[] = [
  {
    count: 1,
    displayName: 'Healthy',
    risk: 'HEALTHY'
  },
  {
    count: 0,
    displayName: 'No Data',
    risk: 'NO_DATA'
  },
  {
    count: 10,
    displayName: 'Un Healthy',
    risk: 'UNHEALTHY'
  },
  {
    count: 7,
    displayName: 'Need Attention',
    risk: 'NEED_ATTENTION'
  }
]

export const nodesCountData: NodeRiskCountDTO = {
  anomalousNodeCount: 12,
  nodeRiskCounts: riskCountData,
  totalNodeCount: 21
}

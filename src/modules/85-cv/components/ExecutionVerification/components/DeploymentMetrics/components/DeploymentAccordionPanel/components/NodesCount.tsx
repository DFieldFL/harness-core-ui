/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FontVariation, Layout, Text } from '@wings-software/uicore'
import type { NodeRiskCountDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import NodeRiskCountsDisplay from './NodeRiskCountsDisplay'
import css from './NodesCount.module.scss'

interface NodeCountProps {
  nodeRiskCount?: NodeRiskCountDTO
}

const NodeCount: React.FC<NodeCountProps> = props => {
  const { getString } = useStrings()
  const { nodeRiskCount } = props

  return (
    <Layout.Horizontal className={css.nodeCount}>
      <NodeRiskCountsDisplay nodeDetails={nodeRiskCount?.nodeRiskCounts} />
      <Layout.Horizontal>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} margin={{ right: 'xsmall', left: 'small' }}>
          {nodeRiskCount?.anomalousNodeCount}/{nodeRiskCount?.totalNodeCount}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }}>{getString('pipeline.verification.nodeCountDisplay')}</Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default NodeCount

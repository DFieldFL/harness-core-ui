/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, Container, Layout } from '@wings-software/uicore'
import type { NodeRiskCount } from 'services/cv'
import { RiskValues } from '@cv/utils/CommonUtils'
import css from './NodesCount.module.scss'

interface NodeCountProps {
  nodeDetails?: NodeRiskCount[]
}

const NodeRiskCountsDisplay: React.FC<NodeCountProps> = props => {
  const { nodeDetails } = props

  const { HEALTHY, NEED_ATTENTION, OBSERVE, UNHEALTHY } = RiskValues

  const { nodeCountDisplayHealthy, nodeCountDisplayNeedAttention, nodeCountDisplayObserve, nodeCountDisplayUnhealthy } =
    css

  return (
    <Layout.Horizontal style={{ flexWrap: 'wrap' }}>
      {nodeDetails?.map(node => {
        const { risk, count } = node

        if (!count) {
          // to avoid displaying count 0
          return null
        }

        return (
          <Container
            key={risk}
            data-testid="nodecount_display"
            margin={{ right: 'small' }}
            color={Color.WHITE}
            className={cx(css.nodeCountDisplay, {
              [nodeCountDisplayHealthy]: risk === HEALTHY,
              [nodeCountDisplayNeedAttention]: risk === NEED_ATTENTION,
              [nodeCountDisplayObserve]: risk === OBSERVE,
              [nodeCountDisplayUnhealthy]: risk === UNHEALTHY
            })}
          >
            {count}
          </Container>
        )
      })}
    </Layout.Horizontal>
  )
}

export default NodeRiskCountsDisplay

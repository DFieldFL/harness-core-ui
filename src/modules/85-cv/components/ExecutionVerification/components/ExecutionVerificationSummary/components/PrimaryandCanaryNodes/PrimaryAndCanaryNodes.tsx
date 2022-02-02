/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback } from 'react'
import { isEqual } from 'lodash-es'
import cx from 'classnames'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DeploymentNodes } from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes'
import type { DeploymentNodeAnalysisResult } from '../../../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import css from './PrimaryAndCanaryNodes.module.scss'

interface PrimaryAndCanaryNodesProps {
  primaryNodes: DeploymentNodeAnalysisResult[]
  canaryNodes: DeploymentNodeAnalysisResult[]
  primaryNodeLabel: string
  canaryNodeLabel: string
  onSelectNode?: (selectedNode?: DeploymentNodeAnalysisResult) => void
  isConsoleView?: boolean
}

export function PrimaryAndCanaryNodes(props: PrimaryAndCanaryNodesProps): JSX.Element {
  const { canaryNodes, primaryNodes, onSelectNode, primaryNodeLabel, canaryNodeLabel, isConsoleView } = props
  const { getString } = useStrings()
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  const onNodeSelect = useCallback(
    (newlySelectedNode?: DeploymentNodeAnalysisResult) => {
      setSelectedNode(newlySelectedNode)
      onSelectNode?.(newlySelectedNode)
    },
    [setSelectedNode]
  )
  const onSelectCallback = onSelectNode ? onNodeSelect : undefined

  return (
    <Container
      className={cx(css.main, {
        [css.flexLayout]: !isConsoleView
      })}
    >
      <Container className={css.primaryNodes}>
        <Text>{primaryNodeLabel?.toLocaleUpperCase()}</Text>
        <Text className={css.details}>
          {primaryNodes.length} {getString('pipeline.nodes')}
        </Text>
        <DeploymentNodes nodes={primaryNodes} selectedNode={selectedNode} />
      </Container>
      <Container className={css.canaryNodes}>
        <Text>{canaryNodeLabel?.toLocaleUpperCase()}</Text>
        <Text className={css.details}>
          {canaryNodes.length} {getString('pipeline.nodes')}
        </Text>
        <DeploymentNodes
          nodes={canaryNodes}
          selectedNode={selectedNode}
          onClick={node => {
            onSelectCallback?.(isEqual(node, selectedNode) ? undefined : node)
          }}
          nodeType="canary"
        />
      </Container>
    </Container>
  )
}

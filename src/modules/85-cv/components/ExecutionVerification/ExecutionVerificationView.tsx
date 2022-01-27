/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Container, Tabs, Tab, NoDataCard, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ExecutionNode } from 'services/pipeline-ng'
import { DeploymentMetrics } from './components/DeploymentMetrics/DeploymentMetrics'
import { ExecutionVerificationSummary } from './components/ExecutionVerificationSummary/ExecutionVerificationSummary'
import type { DeploymentNodeAnalysisResult } from './components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import LogAnalysisContainer from './components/LogAnalysisContainer/LogAnalysisView.container'
import { getActivityId, getDefaultTabId } from './ExecutionVerificationView.utils'
import css from './ExecutionVerificationView.module.scss'

interface ExecutionVerificationViewProps {
  step: ExecutionNode
}

export function ExecutionVerificationView(props: ExecutionVerificationViewProps): JSX.Element {
  const { step } = props
  const { getString } = useStrings()
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  const activityId = useMemo(() => getActivityId(step), [step])
  const { type } = useQueryParams<{ type?: string }>()
  const defaultTabId = useMemo(() => getDefaultTabId(getString, type), [type])

  const content = activityId ? (
    <Tabs id="AnalysisTypeTabs" defaultSelectedTabId={defaultTabId}>
      <Tab
        id={getString('pipeline.verification.analysisTab.metrics')}
        title={getString('pipeline.verification.analysisTab.metrics')}
        panelClassName={css.mainTabPanel}
        panel={
          <Layout.Horizontal style={{ height: '100%' }}>
            <ExecutionVerificationSummary
              displayAnalysisCount={false}
              step={step}
              className={css.executionSummary}
              onSelectNode={setSelectedNode}
              isConsoleView
            />
            <DeploymentMetrics step={step} selectedNode={selectedNode} activityId={activityId} />
          </Layout.Horizontal>
        }
      />
      <Tab
        id={getString('pipeline.verification.analysisTab.logs')}
        title={getString('pipeline.verification.analysisTab.logs')}
        panel={<LogAnalysisContainer step={step} hostName={selectedNode?.hostName} />}
      />
    </Tabs>
  ) : (
    <Container className={css.noAnalysis}>
      <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
    </Container>
  )
  return <Container className={css.main}>{content}</Container>
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import cx from 'classnames'
import type { DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import TestsSummaryView from './components/TestSummaryView/TestsSummaryView'
import CVProgressBar from './components/CVProgressBar/CVProgressBar'
import { PrimaryAndCanaryNodes } from '../ExecutionVerificationSummary/components/PrimaryandCanaryNodes/PrimaryAndCanaryNodes'
import VerificationStatusCard from './components/VerificationStatusCard/VerificationStatusCard'
import type { DeploymentNodeAnalysisResult } from './components/DeploymentNodes/DeploymentNodes.constants'
import css from './DeploymentProgressAndNodes.module.scss'

export interface DeploymentProgressAndNodesProps {
  deploymentSummary?: DeploymentVerificationJobInstanceSummary
  onSelectNode?: (node?: DeploymentNodeAnalysisResult) => void
  className?: string
  isConsoleView?: boolean
}

export function DeploymentProgressAndNodes(props: DeploymentProgressAndNodesProps): JSX.Element {
  const { deploymentSummary, onSelectNode, className, isConsoleView } = props
  const { getString } = useStrings()
  const deploymentNodesData = useMemo(() => {
    if (deploymentSummary?.additionalInfo?.type === 'CANARY') {
      const {
        primary: before = [],
        canary: after = [],
        trafficSplitPercentage,
        primaryInstancesLabel: labelBefore,
        canaryInstancesLabel: labelAfter
      } = deploymentSummary.additionalInfo as any
      return {
        before,
        after,
        percentageBefore: Math.round(trafficSplitPercentage?.preDeploymentPercentage),
        percentageAfter: Math.round(trafficSplitPercentage?.postDeploymentPercentage),
        labelBefore,
        labelAfter
      }
    }
  }, [deploymentSummary])
  const baselineSummaryData = useMemo(() => {
    if (deploymentSummary && deploymentSummary.additionalInfo && deploymentSummary.additionalInfo.type === 'TEST') {
      const { baselineDeploymentTag, baselineStartTime, currentDeploymentTag, currentStartTime } =
        deploymentSummary.additionalInfo as any
      return {
        baselineTestName: baselineDeploymentTag,
        baselineTestDate: baselineStartTime,
        currentTestName: currentDeploymentTag,
        currentTestDate: currentStartTime
      }
    }
  }, [deploymentSummary])

  const renderContent = () => {
    if (deploymentSummary?.progressPercentage === 0 && deploymentSummary.status === 'IN_PROGRESS') {
      return <Text className={css.waitAFew}>{getString('pipeline.verification.waitForAnalysis')}</Text>
    }

    if (deploymentNodesData) {
      return (
        <PrimaryAndCanaryNodes
          primaryNodes={deploymentNodesData.before || []}
          canaryNodes={deploymentNodesData.after || []}
          primaryNodeLabel={deploymentNodesData.labelBefore}
          canaryNodeLabel={deploymentNodesData.labelAfter}
          onSelectNode={onSelectNode}
          isConsoleView={isConsoleView}
        />
      )
    }

    if (baselineSummaryData) {
      return <TestsSummaryView {...baselineSummaryData} />
    }
  }

  return (
    <Container className={cx(css.main, className)}>
      {deploymentSummary && (
        <Container
          className={cx(css.durationAndStatus, {
            [css.flexLayout]: !isConsoleView
          })}
        >
          <Container>
            <Text
              font={{ size: 'small' }}
              data-name={getString('pipeline.startedOn')}
              margin={{ top: 'xsmall', bottom: 'xsmall' }}
            >
              {getString('pipeline.startedOn')}: {moment(deploymentSummary.startTime).format('MMM D, YYYY h:mm A')}
            </Text>
            <Text font={{ size: 'small' }} data-name={getString('duration')}>
              {getString('duration')} {moment.duration(deploymentSummary.durationMs, 'ms').humanize()}
            </Text>
          </Container>
          {deploymentSummary && !isConsoleView && <VerificationStatusCard status={deploymentSummary.status} />}
        </Container>
      )}
      <CVProgressBar
        value={deploymentSummary?.progressPercentage ?? 0}
        status={deploymentSummary?.status}
        className={css.progressBar}
      />
      {deploymentSummary && isConsoleView && <VerificationStatusCard status={deploymentSummary.status} />}
      {renderContent()}
    </Container>
  )
}

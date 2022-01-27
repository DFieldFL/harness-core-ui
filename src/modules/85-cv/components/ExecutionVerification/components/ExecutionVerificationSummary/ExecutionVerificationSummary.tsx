/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Container, Icon, Color, Text, PageError } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useGetDeploymentActivitySummary } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { ManualInterventionTab } from '@pipeline/components/execution/StepDetails/tabs/ManualInterventionTab/ManualInterventionTab'
import { allowedStrategiesAsPerStep } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StepMode } from '@pipeline/utils/stepUtils'
import { Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { StageType } from '@pipeline/utils/stageHelpers'
import { SummaryOfDeployedNodes } from './components/SummaryOfDeployedNodes/SummaryOfDeployedNodes'
import { getErrorMessage } from '../DeploymentMetrics/DeploymentMetrics.utils'
import { DeploymentProgressAndNodes } from '../DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import type { VerifyExecutionProps } from './ExecutionVerificationSummary.types'
import { getActivityId } from '../../ExecutionVerificationView.utils'
import css from './ExecutionVerificationSummary.module.scss'

const POLLING_INTERVAL = 15000

export function ExecutionVerificationSummary(props: VerifyExecutionProps): JSX.Element {
  const { step, displayAnalysisCount = true, className, onSelectNode, stageType, isConsoleView } = props
  const { accountId } = useParams<ProjectPathProps>()
  const [pollingIntervalId, setPollingIntervalId] = useState(-1)
  const [showSpinner, setShowSpinner] = useState(true)
  const activityId = useMemo(() => getActivityId(step), [step])
  const { data, error, refetch } = useGetDeploymentActivitySummary({
    queryParams: { accountId },
    activityId,
    lazy: true
  })
  const { deploymentVerificationJobInstanceSummary = {} } = data?.resource || {}
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const failureStrategies = allowedStrategiesAsPerStep(stageType || StageType.DEPLOY)[StepMode.STEP].filter(
    st => st !== Strategy.ManualIntervention
  )

  useEffect(() => {
    if (!activityId) {
      setPollingIntervalId(oldIntervalId => {
        clearInterval(oldIntervalId)
        return -1
      })
      return
    }

    let intervalId = pollingIntervalId
    clearInterval(intervalId)

    if (step?.status === 'Running' || step?.status === 'AsyncWaiting') {
      // eslint-disable-next-line
      // @ts-ignore
      intervalId = setInterval(refetch, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }

    refetch()
    return () => clearInterval(intervalId)
  }, [activityId, step?.status])

  useEffect(() => {
    setShowSpinner(Boolean(activityId))
  }, [activityId])

  useEffect(() => {
    if ((data || error) && showSpinner) setShowSpinner(false)
  }, [data, error])

  if (showSpinner) {
    return (
      <Container
        className={cx(css.main, className, {
          [css.fullWidth]: !isConsoleView
        })}
      >
        <Icon name="steps-spinner" className={css.loading} color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container
        className={cx(css.main, className, {
          [css.fullWidth]: !isConsoleView
        })}
      >
        <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
      </Container>
    )
  }

  if (isManualInterruption) {
    return <ManualInterventionTab step={step} allowedStrategies={failureStrategies} />
  }

  return (
    <Container
      className={cx(css.main, className, {
        [css.fullWidth]: !isConsoleView
      })}
    >
      {step.failureInfo?.message && (
        <Text
          font={{ size: 'small', weight: 'bold' }}
          className={css.failureMessage}
          lineClamp={4}
          color={Color.RED_500}
        >
          {step.failureInfo.message}
        </Text>
      )}
      <DeploymentProgressAndNodes
        deploymentSummary={deploymentVerificationJobInstanceSummary}
        className={css.details}
        onSelectNode={onSelectNode}
        isConsoleView={isConsoleView}
      />
      {displayAnalysisCount && (
        <SummaryOfDeployedNodes
          metricsInViolation={deploymentVerificationJobInstanceSummary?.timeSeriesAnalysisSummary?.numAnomMetrics || 0}
          totalMetrics={deploymentVerificationJobInstanceSummary?.timeSeriesAnalysisSummary?.totalNumMetrics || 0}
          logClustersInViolation={
            deploymentVerificationJobInstanceSummary?.logsAnalysisSummary?.anomalousClusterCount || 0
          }
          totalLogClusters={deploymentVerificationJobInstanceSummary?.logsAnalysisSummary?.totalClusterCount || 0}
        />
      )}
    </Container>
  )
}

import React, { useState } from 'react'
// import cx from 'classnames'
import { Card, Icon } from '@wings-software/uicore'
// import * as BP from '@blueprintjs/core'
import { Link, useParams } from 'react-router-dom'

import { isObject } from 'lodash-es'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { UserLabel, Duration, TimeAgo } from '@common/exports'
// import { ExecutionStatusLabel, ExecutionStageGraph, RenderStageButtonInfo } from '@pipeline/exports'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { String } from 'framework/exports'

import routes from '@common/RouteDefinitions'
// import { ExecutionServiceTooltip } from './ExecutionServiceTooltip'
// import ExecutionActionButtons from './ExecutionActionButtons/ExecutionActionButtons'
// import ExecutionCardMenu from './ExecutionCardMenu/ExecutionCardMenu'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import MiniExecutionGraph from './MiniExecutionGraph/MiniExecutionGraph'
import ServicesDeployed from './ExecutionDetails/ServicesDeployed'
import BuildInfo from './ExecutionDetails/BuildInfo/BuildInfo'
import { CommitsList } from './CommitsList/CommitsList'
// TODO: remove hardcoded types
import type { CIBuildCommit, CIBuildResponseDTO } from './ExecutionDetails/Types/types'
import css from './ExecutionCard.module.scss'

export interface ExecutionCardProps {
  pipelineExecution: PipelineExecutionSummary
}

export default function ExecutionCard(props: ExecutionCardProps): React.ReactElement {
  const { pipelineExecution } = props
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const [showCommits, setShowCommits] = useState(false)

  const HAS_CD = isObject(pipelineExecution?.moduleInfo?.cd)
  const HAS_CI = isObject(pipelineExecution?.moduleInfo?.ci)

  // TODO: remove type cast
  const ciBuildData = (pipelineExecution?.moduleInfo?.ci?.ciExecutionInfoDTO as unknown) as CIBuildResponseDTO
  const ciBranchName = (pipelineExecution?.moduleInfo?.ci?.branch as unknown) as string

  const getCommits = (build: CIBuildResponseDTO): CIBuildCommit[] => {
    switch (build.event) {
      case 'branch':
        return build?.branch?.commits || []
      case 'pullRequest':
        return build?.pullRequest?.commits || []
      default:
        return []
    }
  }

  return (
    <Card elevation={0} className={css.card}>
      <div className={css.icons} data-ci={HAS_CI} data-cd={HAS_CD}>
        {HAS_CI ? <Icon name="ci-main" /> : null}
        {HAS_CD ? <Icon name="cd-main" size={20} /> : null}
      </div>
      <div>
        <div className={css.content}>
          <div>
            <Link
              className={css.title}
              to={routes.toExecutionPipelineView({
                orgIdentifier,
                pipelineIdentifier: pipelineExecution?.pipelineIdentifier || '',
                executionIdentifier: pipelineExecution?.planExecutionId || '',
                projectIdentifier,
                accountId,
                module
              })}
            >
              <span className={css.pipelineName}>{pipelineExecution?.name}</span>
              <String
                className={css.executionId}
                stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
                vars={pipelineExecution}
              />
            </Link>
            {HAS_CI ? (
              <>
                <div className={css.ciData}>
                  <String className={css.sectionTitle} stringID="buildText" />
                  <BuildInfo
                    toggleCommits={() => {
                      setShowCommits(!showCommits)
                    }}
                    showCommits={showCommits}
                    buildData={ciBuildData}
                    branchName={ciBranchName}
                    className={css.buildInfo}
                  />
                </div>
                {showCommits ? <CommitsList commits={getCommits(ciBuildData)} /> : null}
              </>
            ) : null}
            {HAS_CD ? (
              <div className={css.cdData}>
                <String className={css.sectionTitle} stringID="deploymentText" />
                <ServicesDeployed pipelineExecution={pipelineExecution} />
              </div>
            ) : null}
          </div>
          <MiniExecutionGraph pipelineExecution={pipelineExecution} />
          <div className={css.actions}>
            <ExecutionStatusLabel status={pipelineExecution.status} />
            <ExecutionActions
              executionStatus={pipelineExecution.status}
              params={{
                accountId,
                orgIdentifier,
                pipelineIdentifier: pipelineExecution?.pipelineIdentifier || '',
                executionIdentifier: pipelineExecution?.planExecutionId || '',
                projectIdentifier,
                module
              }}
            />
          </div>
        </div>
        <div className={css.footer}>
          <div className={css.triggerInfo}>
            <UserLabel name={pipelineExecution.executionTriggerInfo?.triggeredBy?.identifier || 'Anonymous'} />
            <String
              className={css.triggerType}
              stringID={`execution.triggerType.${pipelineExecution.executionTriggerInfo?.triggerType ?? 'MANUAL'}`}
            />
          </div>
          <div className={css.timers}>
            <Duration
              icon="time"
              iconProps={{ size: 12 }}
              startTime={pipelineExecution?.startTs}
              endTime={pipelineExecution?.endTs}
            />
            <TimeAgo iconProps={{ size: 12 }} icon="calendar" time={pipelineExecution?.startTs || 0} />
          </div>
        </div>
      </div>
    </Card>
  )
}

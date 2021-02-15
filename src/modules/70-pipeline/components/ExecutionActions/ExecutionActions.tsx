import React from 'react'
import { Button, Popover, ButtonProps } from '@wings-software/uicore'
import { Menu, MenuItem } from '@blueprintjs/core'
import { Link, useHistory } from 'react-router-dom'

import { useHandleInterrupt } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionComplete, isExecutionActive, isExecutionPaused } from '@pipeline/utils/statusHelpers'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import i18n from './ExecutionActions.i18n'
import css from './ExecutionActions.module.scss'

const commonButtonProps: ButtonProps = {
  minimal: true,
  small: true
}

export interface ExecutionActionsProps {
  executionStatus?: ExecutionStatus
  params: PipelineType<{
    orgIdentifier: string
    projectIdentifier: string
    pipelineIdentifier: string
    executionIdentifier: string
    accountId: string
  }>
  refetch?(): Promise<void>
}

export default function ExecutionActions(props: ExecutionActionsProps): React.ReactElement {
  const { executionStatus, params } = props
  const { orgIdentifier, executionIdentifier, accountId, projectIdentifier, pipelineIdentifier, module } = params
  const { mutate: interrupt } = useHandleInterrupt({ planExecutionId: executionIdentifier })
  const { showSuccess } = useToaster()
  const history = useHistory()

  const reRunPipeline = (): void => {
    history.push(
      `${routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })}?executionId=${executionIdentifier}`
    )
  }

  const canPause = isExecutionActive(executionStatus) && !isExecutionPaused(executionStatus)
  const canAbort = isExecutionActive(executionStatus)
  const canRerun = isExecutionComplete(executionStatus)
  const canResume = isExecutionPaused(executionStatus)

  async function abortPipleine(): Promise<void> {
    try {
      await interrupt({} as never, {
        queryParams: {
          orgIdentifier,
          accountIdentifier: accountId,
          projectIdentifier,
          interruptType: 'Abort'
        }
      })
      // await refetch()
      showSuccess(i18n.abortedMessage)
    } catch (_) {
      //
    }
  }

  async function pausePipleine(): Promise<void> {
    try {
      await interrupt({} as never, {
        queryParams: {
          orgIdentifier,
          accountIdentifier: accountId,
          projectIdentifier,
          interruptType: 'Pause'
        }
      })
      // await refetch()
      showSuccess(i18n.pausedMessage)
    } catch (_) {
      //
    }
  }

  async function resumePipleine(): Promise<void> {
    try {
      await interrupt({} as never, {
        queryParams: {
          orgIdentifier,
          accountIdentifier: accountId,
          projectIdentifier,
          interruptType: 'Resume'
        }
      })
      // await refetch()
      showSuccess(i18n.resumedMessage)
    } catch (_) {
      //
    }
  }

  function killEvent(e: React.MouseEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()
  }

  // TODO: disable not implemented features in ci module
  const disableInCIModule = module === 'ci'

  return (
    <div className={css.main} onClick={killEvent}>
      {!disableInCIModule && canResume ? <Button icon="play" onClick={resumePipleine} {...commonButtonProps} /> : null}
      {canRerun ? <Button icon="repeat" {...commonButtonProps} onClick={reRunPipeline} /> : null}
      {!disableInCIModule && canPause ? <Button icon="pause" onClick={pausePipleine} {...commonButtonProps} /> : null}
      {!disableInCIModule && canAbort ? <Button icon="stop" onClick={abortPipleine} {...commonButtonProps} /> : null}
      <Popover position="bottom-right" minimal>
        <Button icon="more" {...commonButtonProps} className={css.more} />
        <Menu>
          <Link
            className="bp3-menu-item"
            to={routes.toPipelineStudio({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
          >
            Edit Pipeline
          </Link>
          <MenuItem text="Re-run" disabled={!canRerun} onClick={reRunPipeline} />
          <MenuItem text="Pause" onClick={pausePipleine} disabled={disableInCIModule || !canPause} />
          <MenuItem text="Abort" onClick={abortPipleine} disabled={disableInCIModule || !canAbort} />
          <MenuItem text="Resume" onClick={resumePipleine} disabled={disableInCIModule || !canResume} />
          <MenuItem text="Download logs" disabled={disableInCIModule} />
        </Menu>
      </Popover>
    </div>
  )
}

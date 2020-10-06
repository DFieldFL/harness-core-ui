import React from 'react'
import { Button, Popover, ButtonProps } from '@wings-software/uikit'
import { Menu, MenuItem } from '@blueprintjs/core'

import type { PipelineExecutionSummaryDTO } from 'services/cd-ng'

import css from './ExecutionActions.module.scss'

type ExecutionStatus = PipelineExecutionSummaryDTO['executionStatus']

const commonButtonProps: ButtonProps = {
  minimal: true,
  small: true
}

export interface ExecutionActionsProps {
  executionStatus: ExecutionStatus
}

const COMPLETED_PIPELINE_STATUS: ExecutionStatus[] = ['ABORTED', 'EXPIRED', 'FAILED', 'SUCCESS']

export default function ExecutionActions(props: ExecutionActionsProps): React.ReactElement {
  const { executionStatus } = props

  return (
    <div className={css.main}>
      {executionStatus === 'PAUSED' ? <Button icon="play" {...commonButtonProps} /> : null}
      {COMPLETED_PIPELINE_STATUS.includes(executionStatus) ? <Button icon="redo" {...commonButtonProps} /> : null}
      {executionStatus === 'RUNNING' ? <Button icon="pause" {...commonButtonProps} /> : null}
      {executionStatus === 'RUNNING' ? <Button icon="stop" {...commonButtonProps} /> : null}
      <Popover position="bottom-right" minimal>
        <Button icon="more" {...commonButtonProps} className={css.more} />
        <Menu>
          <MenuItem text="Edit Pipeline" />
          <MenuItem text="Run" disabled={executionStatus === 'RUNNING'} />
          <MenuItem text="Re-run" disabled={!COMPLETED_PIPELINE_STATUS.includes(executionStatus)} />
          <MenuItem text="Pause" disabled={executionStatus !== 'RUNNING'} />
          <MenuItem text="Abort" disabled={executionStatus !== 'RUNNING'} />
          <MenuItem text="Resume" disabled={executionStatus !== 'RUNNING'} />
          <MenuItem text="Download logs" />
        </Menu>
      </Popover>
    </div>
  )
}

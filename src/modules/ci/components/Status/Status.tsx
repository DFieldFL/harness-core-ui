import React from 'react'
import classNames from 'classnames'
import { ExecutionStatus } from '../common/status'
import type { DivAttributesProps } from '../common/props'
import css from './Status.module.scss'

export interface StatusProps extends DivAttributesProps {
  status: ExecutionStatus
}

function status2ClassName(status: ExecutionStatus): string {
  switch (status) {
    case ExecutionStatus.SUCCESS:
    case ExecutionStatus.SUCCEEDED:
      return css.statusSuccess
    case ExecutionStatus.FAILED:
    case ExecutionStatus.ERRORED:
      return css.statusFailed
    case ExecutionStatus.RUNNING:
      return css.statusInProgress
    case ExecutionStatus.WAITING:
      return css.statusPending
    default:
      return ''
  }
}

const Status: React.FC<StatusProps> = props => {
  const { status, className, children, ...restProps } = props

  return (
    <div className={classNames(css.status, status2ClassName(status), className)} {...restProps}>
      {children}
    </div>
  )
}

export default Status

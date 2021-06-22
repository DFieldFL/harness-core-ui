import React from 'react'
import moment from 'moment'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'

export function roundNumber(value?: number, precision = 2) {
  if (typeof value !== 'number') {
    return value
  }
  if (Number.isInteger(precision) && precision >= 0) {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

export function formatDuration(value?: number | string) {
  if (typeof value === 'string') {
    value = Number.parseInt(value)
  }
  if (typeof value !== 'number') {
    return
  }
  let signPrefix = undefined
  let h = 0
  let m = 0
  let s = 0
  if (value < 0) {
    signPrefix = '-'
    value = Math.abs(value)
  }
  if (value >= 3600) {
    h = Math.floor(value / 3600)
    value = value % 3600
  }
  if (value >= 60) {
    m = Math.floor(value / 60)
    value = value % 60
  }
  s = value

  if (h > 0) {
    // truncate seconds for large intervals
    s = 0
  }

  const labelStyle = {
    fontSize: '0.7em',
    marginRight: '0.2em'
  }
  return (
    <>
      {signPrefix}
      {h > 0 && (
        <span>
          {h}
          <span style={labelStyle}>h</span>
        </span>
      )}
      {m > 0 && (
        <span style={{ fontSize: h > 0 ? '0.8em' : '1em' }}>
          {m}
          <span style={labelStyle}>m</span>
        </span>
      )}
      {s > 0 && (
        <span style={{ fontSize: m > 0 ? '0.8em' : '1em' }}>
          {s}
          <span style={labelStyle}>s</span>
        </span>
      )}
    </>
  )
}

export function diffStartAndEndTime(startTime?: number, endTime?: number): string | undefined {
  if (startTime && startTime > -1 && endTime && endTime > -1) {
    const diffMins = moment(endTime).diff(startTime, 'minutes')
    if (diffMins === 0) {
      return `${moment(endTime).diff(startTime, 'seconds')}s`
    } else if (diffMins < 180) {
      return `${diffMins}m`
    } else {
      return `${moment(endTime).diff(startTime, 'hours')}h`
    }
  }
}

export const FailedStatus: Partial<Record<ExecutionStatus, ExecutionStatus>> = {
  Failed: 'Failed',
  Aborted: 'Aborted',
  Expired: 'Expired',
  IgnoreFailed: 'IgnoreFailed',
  Errored: 'Errored'
}

export const ActiveStatus: Partial<Record<ExecutionStatus, ExecutionStatus>> = {
  Running: 'Running',
  AsyncWaiting: 'AsyncWaiting',
  TaskWaiting: 'TaskWaiting',
  TimedWaiting: 'TimedWaiting',
  Paused: 'Paused',
  InterventionWaiting: 'InterventionWaiting',
  ApprovalWaiting: 'ApprovalWaiting',
  ResourceWaiting: 'ResourceWaiting'
}

export function mapToExecutionStatus(status?: string): ExecutionStatus | undefined {
  switch (status) {
    case 'INTERVENTIONWAITING':
      return 'InterventionWaiting'
    case 'APPROVALWAITING':
      return 'ApprovalWaiting'
    case 'RESOURCEWAITING':
      return 'ResourceWaiting'
    case 'NOTSTARTED':
      return 'NotStarted'
    case 'QUEUED':
      return 'Queued'
    case 'SKIPPED':
      return 'Skipped'
    case 'RUNNING':
      return 'Running'
    case 'ASYNCWAITING':
      return 'AsyncWaiting'
    case 'TASKWAITING':
      return 'TaskWaiting'
    case 'TIMEDWAITING':
      return 'TimedWaiting'
    case 'PAUSED':
      return 'Paused'
    case 'PAUSING':
      return 'Pausing'
    case 'DISCONTINUING':
      return 'Discontinuing'
    case 'SUSPENDED':
      return 'Suspended'
    case 'FAILED':
      return 'Failed'
    case 'ABORTED':
      return 'Aborted'
    case 'EXPIRED':
      return 'Expired'
    case 'IGNOREFAILED':
      return 'IgnoreFailed'
    case 'ERRORED':
      return 'Errored'
    case 'APPROVALREJECTED':
      return 'ApprovalRejected'
    case 'SUCCESS':
      return 'Success'
  }
}

import type { IconName, SelectOption } from '@wings-software/uikit'

// TODO: should be replaced with type-shape of the box (like: Stage, Step, Approval)
export enum ExecutionPipelineNodeType {
  DIAMOND = 'DIAMOND',
  NORMAL = 'NORMAL'
}

// TODO: should be replaced or same as DTO
export enum ExecutionPipelineItemStatus {
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
  SUCCESS = 'Success',
  ABORTED = 'Aborted',
  ERROR = 'Error',
  PAUSED = 'Paused',
  PAUSING = 'Pausing',
  WAITING = 'Waiting',
  ABORTING = 'Aborting',
  RUNNING = 'Running',
  QUEUED = 'Queued',
  ROLLBACK = 'Rollback',
  SKIPPED = 'Skipped',
  STARTING = 'Starting',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired',
  NOT_STARTED = 'NotStarted',
  ASYNC_WAITING = 'AsyncWaiting'
}

export interface StageOptions extends SelectOption {
  value: string
  disabled?: boolean
}

export interface ExecutionPipelineItem<T> {
  identifier: string
  name: string
  type: ExecutionPipelineNodeType
  status: ExecutionPipelineItemStatus
  icon: IconName
  showInLabel?: boolean // Default = false
  cssProps?: React.CSSProperties
  data?: T
  pipeline?: ExecutionPipeline<T>
}

export interface ExecutionPipelineGroupInfo<T> {
  identifier: string
  name: string
  data: T
  cssProps?: React.CSSProperties
  icon: IconName
  status: ExecutionPipelineItemStatus
  isOpen: boolean
  items: Array<ExecutionPipelineNode<T>>
}
export interface ExecutionPipelineNode<T> {
  item?: ExecutionPipelineItem<T>
  parallel?: Array<ExecutionPipelineNode<T>>
  group?: ExecutionPipelineGroupInfo<T>
}

export interface ExecutionPipeline<T> {
  items: Array<ExecutionPipelineNode<T>>
  identifier: string
  status?: ExecutionPipelineItemStatus
}

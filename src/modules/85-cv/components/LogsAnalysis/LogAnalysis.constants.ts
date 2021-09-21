export const pageSize = 7
export const initialPageNumber = 0

export const POLLING_INTERVAL = 30000

export enum StepStatus {
  Running = 'Running',
  AsyncWaiting = 'AsyncWaiting'
}

export enum LogEvents {
  KNOWN_EVENT = 'KNOWN_EVENT',
  UNKNOWN_EVENT = 'UNKNOWN_EVENT',
  UNEXPECTED_FREQUENCY = 'UNEXPECTED_FREQUENCY'
}

const LOCALE = 'en'

/**
 * Format a timestamp to short format time (i.e: 7:41 AM)
 * @param timestamp Timestamp
 * @param timeStyle Optional DateTimeFormat's `timeStyle` option.
 */
export function formatTime(timestamp: number, timeStyle = 'short'): string {
  return new Intl.DateTimeFormat(LOCALE, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore: TS built-in type for DateTimeFormat is not correct
    timeStyle
  }).format(new Date(timestamp))
}

/**
 * Format a timestamp to medium format date (i.e: Jan 1, 2021)
 * @param timestamp Timestamp
 * @param dateStyle Optional DateTimeFormat's `dateStyle` option.
 */
export function formatDate(timestamp: number, dateStyle = 'medium'): string {
  return new Intl.DateTimeFormat(LOCALE, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore: TS built-in type for DateTimeFormat is not correct
    dateStyle
  }).format(new Date(timestamp))
}

export enum FFDetailPageTab {
  TARGETING = 'targeting',
  ACTIVITY = 'activity'
}

export const CF_LOCAL_STORAGE_ENV_KEY = 'cf_selected_env'
export const DEFAULT_ENV = { label: '', value: '' }
export const CF_DEFAULT_PAGE_SIZE = 15
export const ADIT_LOG_EMPTY_ENTRY_ID = '00000000-0000-0000-0000-000000000000'

export const AuditLogObjectType = {
  FeatureActivation: 'FeatureActivation' as 'FeatureActivation',
  Segment: 'Segment' as 'Segment'
}

export const AuditLogAction = {
  FeatureActivationCreated: 'FeatureActivationCreated',
  SegmentCreated: 'SegmentCreated',
  FeatureActivationPatched: 'FeatureActivationPatched'
}

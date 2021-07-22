import type { MonitoredServiceResponse } from 'services/cv'
import type { MonitoredServiceRef } from '@cv/pages/monitored-service/component/MonitoredService.types'
import type { RowData } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface HealthSourceTableInterface {
  value: Array<RowData>
  breadCrumbRoute?: {
    routeTitle: string
  }
  monitoredServiceRef: MonitoredServiceRef
  serviceRef: string
  environmentRef: string
  onSuccess: (value: MonitoredServiceResponse) => void
  onDelete?: (value: MonitoredServiceResponse) => void
  isEdit?: boolean
  shouldRenderAtVerifyStep?: boolean
  isRunTimeInput?: boolean
}

import type { MonitoredServiceRef } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import type {
  HealthSource,
  AppDynamicsHealthSourceSpec,
  MonitoredServiceResponse,
  PrometheusHealthSourceSpec,
  NewRelicHealthSourceSpec,
  StackdriverMetricHealthSourceSpec,
  SplunkHealthSourceSpec,
  ChangeSourceDTO,
  DatadogMetricHealthSourceSpec
} from 'services/cv'
import type { DatadogLogsHealthSpec } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/DatadogLogsHealthSource.type'
import type { GCOLogsHealthSourceSpec } from '../connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/types'

export interface UpdatedHealthSource extends Omit<HealthSource, 'spec'> {
  spec:
    | AppDynamicsHealthSourceSpec
    | GCOLogsHealthSourceSpec
    | PrometheusHealthSourceSpec
    | NewRelicHealthSourceSpec
    | StackdriverMetricHealthSourceSpec
    | SplunkHealthSourceSpec
    | DatadogMetricHealthSourceSpec
    | DatadogLogsHealthSpec
}

export interface RowData extends HealthSource {
  serviceRef?: string
  environmentRef?: string
}

export interface SourceDataInterface {
  isEdit: boolean
  serviceRef: string
  environmentRef: string
  monitoredServiceRef: MonitoredServiceRef
  rowData?: RowData | null
  tableData?: Array<RowData>
  modalOpen?: boolean
  createHeader?: () => JSX.Element
  onClose?: (val: any) => void
  sourceType?: string
  connectorRef?: string
  healthSourceName?: string
  healthSourceIdentifier?: string
  healthSourceList?: Array<RowData>
  changeSources?: ChangeSourceDTO[]
}

export interface HealthSourceDrawerInterface {
  rowData?: RowData | null
  tableData: Array<RowData>
  serviceRef: string
  environmentRef: string
  monitoredServiceRef: MonitoredServiceRef
  onSuccess: (data: MonitoredServiceResponse | UpdatedHealthSource) => void
  modalOpen: boolean
  createHeader: () => JSX.Element
  onClose: (val: any) => void
  isEdit: boolean
  shouldRenderAtVerifyStep?: boolean
  changeSources: ChangeSourceDTO[]
}

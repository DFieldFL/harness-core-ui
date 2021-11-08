import type { FormikProps } from 'formik'
import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import type {
  ChangeSourceDTO,
  HarnessCDCurrentGenChangeSourceSpec,
  MonitoredServiceDTO,
  PagerDutyChangeSourceSpec
} from 'services/cv'

export interface UpdatedChangeSourceDTO extends Omit<ChangeSourceDTO, 'spec'> {
  spec: PagerDutyChangeSourceSpec | HarnessCDCurrentGenChangeSourceSpec
}

export interface ChangeSoureDrawerInterface {
  isEdit: boolean
  rowdata: UpdatedChangeSourceDTO
  tableData: UpdatedChangeSourceDTO[]
  onSuccess: (value: UpdatedChangeSourceDTO[]) => void
  hideDrawer?: () => void
  monitoredServiceType?: MonitoredServiceDTO['type']
}
export interface CardSelectOption extends Item {
  category?: string
  string?: string
}

export interface ChangeSourceProps {
  formik: FormikProps<UpdatedChangeSourceDTO>
  isEdit?: boolean
}

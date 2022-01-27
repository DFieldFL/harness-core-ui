import type { UseActionCreatorReturn } from '../LogsState/actions'
import type { State } from '../LogsState/types'

export interface CommonLogsProps {
  state: State
  actions: UseActionCreatorReturn
}

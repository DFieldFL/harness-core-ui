/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import type { RestResponseSetHealthSourceDTO } from 'services/cv'

export interface HealthSourceMultiSelectDropDownProps {
  onChange: (selectedHealthSources: MultiSelectOption[]) => void
  className?: string
  verificationType?: string
  data: RestResponseSetHealthSourceDTO | null
  error: GetDataError<unknown> | null
  loading: boolean
  selectedValues: MultiSelectOption[]
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { DropdownData } from './HealthSourceDropDown.types'

export const getDropdownOptions = (
  { loading, error, data, verificationType }: DropdownData,
  getString: UseStringsReturn['getString']
): SelectOption[] | [] => {
  if (loading) {
    return [{ value: '', label: getString('loading') }]
  }
  if (error) {
    return []
  }

  const options = []
  for (const source of data?.resource || []) {
    if (source?.identifier && source?.name && source?.verificationType === verificationType) {
      options.push({
        label: source.name,
        value: source.identifier as string,
        icon: { name: getIconBySourceType(source?.type as string) as IconName }
      })
    }
  }

  return options
}

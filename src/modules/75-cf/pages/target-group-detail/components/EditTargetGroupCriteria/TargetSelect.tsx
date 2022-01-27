/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactNode, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FormInput, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetAllTargets, UseGetAllTargetsProps } from 'services/cf'
import targetToSelectOption from '@cf/utils/targetToSelectOption'

import css from './TargetSelect.module.scss'

export interface TargetSelectProps {
  environment: string
  fieldName: string
  label: ReactNode
}

const TargetSelect: FC<TargetSelectProps> = ({ environment, fieldName, label }) => {
  const { getString } = useStrings()
  const {
    accountId: accountIdentifier,
    orgIdentifier: org,
    projectIdentifier: project
  } = useParams<Record<string, string>>()

  const queryParams: UseGetAllTargetsProps['queryParams'] = {
    environment,
    accountIdentifier,
    org,
    project,
    pageSize: 100,
    sortByField: 'name'
  }

  const { data: targets, refetch: refetchTargets } = useGetAllTargets({
    queryParams,
    debounce: 300
  })

  const targetOptions = useMemo<SelectOption[]>(
    () => (targets?.targets || []).map(targetToSelectOption),
    [targets?.targets]
  )

  return (
    <FormInput.MultiSelect
      name={fieldName}
      label={label}
      className={css.input}
      items={targetOptions}
      multiSelectProps={{
        allowCreatingNewItems: false,
        placeholder: getString('cf.segmentDetail.searchTarget'),
        onQueryChange: async query => await refetchTargets({ queryParams: { ...queryParams, targetName: query } })
      }}
    />
  )
}

export default TargetSelect

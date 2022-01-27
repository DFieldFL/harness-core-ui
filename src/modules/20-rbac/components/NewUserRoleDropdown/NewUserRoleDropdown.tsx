/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Menu } from '@blueprintjs/core'
import { Select, SelectOption } from '@wings-software/uicore'
import { isAssignmentFieldDisabled } from '@rbac/utils/utils'
import type { ResourceGroupOption, RoleOption } from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import RbacMenuItem from '../MenuItem/MenuItem'
import css from './NewUserRoleDropdown.module.scss'

export interface NewUserRoleDropdownProps {
  value: RoleOption | ResourceGroupOption
  roles: RoleOption[]
  handleChange: (value: SelectOption) => void
}

const planEnforcedRoles = ['_feature_flag_manage_role']

const NewUserRoleDropdown = (props: NewUserRoleDropdownProps): ReactElement => {
  const { value, roles, handleChange } = props
  const { getString } = useStrings()

  const isFeatureEnforcementEnabled = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)

  return (
    <Select
      itemRenderer={(item: SelectOption, { handleClick }): React.ReactElement => {
        if (isFeatureEnforcementEnabled && planEnforcedRoles.includes(item.value as string)) {
          return (
            <RbacMenuItem
              onClick={handleClick}
              key={item.value as string}
              text={item.label}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.MAUS]
                }
              }}
            />
          )
        } else {
          return <Menu.Item key={item.value as string} text={item.label} onClick={handleClick} />
        }
      }}
      items={roles}
      value={value}
      popoverClassName={css.selectPopover}
      inputProps={{
        placeholder: getString('rbac.usersPage.selectRole')
      }}
      disabled={isAssignmentFieldDisabled(value)}
      onChange={handleChange}
    />
  )
}

export default NewUserRoleDropdown

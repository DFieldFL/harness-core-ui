/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import type { Experiences } from '@common/constants/Utils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface UseUpdateLSDefaultExperienceReturn {
  updateLSDefaultExperience: (experience: Experiences) => void
}
export function useUpdateLSDefaultExperience(): UseUpdateLSDefaultExperienceReturn {
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()

  function updateLSDefaultExperience(experience: Experiences): void {
    const defaultExperienceMap = currentUserInfo.accounts?.reduce((previousValue, account) => {
      const newExperience = account.uuid === accountId ? experience : account.defaultExperience
      return {
        ...previousValue,
        [account.uuid as string]: newExperience
      }
    }, {})

    localStorage.setItem('defaultExperienceMap', JSON.stringify(defaultExperienceMap))
  }

  return { updateLSDefaultExperience }
}

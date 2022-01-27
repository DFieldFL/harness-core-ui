/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import UsageInfoCard from './UsageInfoCard'

interface ActiveUsersProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ subscribedUsers, activeUsers, rightHeader }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ciUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
  const hasBar = true
  const leftFooter = getString('common.totalHarnessUser')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const CIUsageInfo: React.FC = () => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CI)

  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  if (usageErrorMsg) {
    return <PageError message={usageErrorMsg} onClick={() => refetchUsage?.()} />
  }

  if (limitErrorMsg) {
    return <PageError message={limitErrorMsg} onClick={() => refetchLimit?.()} />
  }

  return (
    <Layout.Horizontal spacing="large">
      <ActiveUsers
        rightHeader={usage?.ci?.activeCommitters?.displayName || ''}
        subscribedUsers={limit?.ci?.totalDevelopers || 0}
        activeUsers={usage?.ci?.activeCommitters?.count || 0}
      />
    </Layout.Horizontal>
  )
}

export default CIUsageInfo

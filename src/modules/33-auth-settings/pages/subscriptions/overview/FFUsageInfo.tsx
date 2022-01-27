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
import { ModuleName } from 'framework/types/ModuleName'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import UsageInfoCard from './UsageInfoCard'

export interface FFUsageInfoProps {
  subscribedUsers: number
  activeUsers: number
  subscribedMonthlyUsers: number
  activeMonthlyUsers: number
  month: string
  featureFlags: number
}

interface FeatureFlagsUsersCardProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
  errors: {
    usageErrorMsg?: string
    limitErrorMsg?: string
  }
  refetches: {
    refetchUsage?: () => void
    refetchLimit?: () => void
  }
}
const FeatureFlagsUsersCard: React.FC<FeatureFlagsUsersCardProps> = ({
  subscribedUsers,
  activeUsers,
  rightHeader,
  errors,
  refetches
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ffUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Instance tooltip placeholder'
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }

  const { usageErrorMsg, limitErrorMsg } = errors
  const { refetchUsage, refetchLimit } = refetches
  if (usageErrorMsg) {
    return <PageError message={usageErrorMsg} onClick={refetchUsage} />
  }

  if (limitErrorMsg) {
    return <PageError message={limitErrorMsg} onClick={refetchLimit} />
  }

  return <UsageInfoCard {...props} />
}

interface FeatureFlagsProps {
  featureFlags: number
  refetch?: () => void
  error?: string
}

const FeatureFlags: React.FC<FeatureFlagsProps> = ({ featureFlags, error, refetch }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.purpose.cf.continuous')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
  const rightHeader = getString('common.current')
  const hasBar = false
  const props = { usage: featureFlags, leftHeader, tooltip, rightHeader, hasBar }

  if (error) {
    return <PageError message={error} onClick={refetch} />
  }

  return <UsageInfoCard {...props} />
}

const FFUsageInfo: React.FC = () => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF)

  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  return (
    <Layout.Horizontal spacing="large">
      <FeatureFlagsUsersCard
        errors={{ usageErrorMsg, limitErrorMsg }}
        refetches={{
          refetchUsage,
          refetchLimit
        }}
        subscribedUsers={limit?.ff?.totalClientMAUs || 0}
        activeUsers={usage?.ff?.activeClientMAUs?.count || 0}
        rightHeader={usage?.ff?.activeClientMAUs?.displayName || ''}
      />
      <FeatureFlags featureFlags={limit?.ff?.totalFeatureFlagUnits || 0} error={limitErrorMsg} refetch={refetchLimit} />
    </Layout.Horizontal>
  )
}

export default FFUsageInfo

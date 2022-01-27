/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FeatureWarningSubscriptionInfoBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionInfoBanner'
import FeatureWarningSubscriptionUpgradeBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionUpgradeBanner'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ModuleName } from 'framework/types/ModuleName'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

const DeveloperLimitBanner = (): ReactElement => {
  const { getString } = useStrings()
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF)

  const isFeatureEnforcementEnabled = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)

  const license = useLicenseStore()

  const isPaidTeamOrEnterpriseSubscription =
    (license.licenseInformation.CF?.edition === 'ENTERPRISE' || license.licenseInformation.CF?.edition === 'TEAM') &&
    license.licenseInformation.CF?.licenseType === 'PAID'

  const developerUsageCount = Number(usageData.usage?.ff?.activeFeatureFlagUsers?.count)
  const developerPlanLimit = Number(limitData.limit?.ff?.totalFeatureFlagUnits)

  const developerUsagePercentage = Math.trunc((developerUsageCount / developerPlanLimit) * 100)

  const showInfoBanner =
    isPaidTeamOrEnterpriseSubscription &&
    developerPlanLimit > 0 &&
    developerUsagePercentage >= 90 &&
    developerUsagePercentage < 100

  const showWarningBanner =
    isPaidTeamOrEnterpriseSubscription && developerPlanLimit > 0 && developerUsagePercentage >= 100

  if (!isFeatureEnforcementEnabled) {
    return <></>
  }

  return (
    <>
      {isPaidTeamOrEnterpriseSubscription && (
        <>
          {showInfoBanner && (
            <FeatureWarningSubscriptionInfoBanner
              featureName={FeatureIdentifier.DEVELOPERS}
              message={getString('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')}
            />
          )}
          {showWarningBanner && (
            <FeatureWarningSubscriptionUpgradeBanner
              featureName={FeatureIdentifier.DEVELOPERS}
              message={getString('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')}
            />
          )}
        </>
      )}
    </>
  )
}

export default DeveloperLimitBanner

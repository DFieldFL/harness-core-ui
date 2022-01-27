/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import type {
  GetLicensesAndSummaryQueryParams,
  CILicenseSummaryDTO,
  CFLicenseSummaryDTO,
  CELicenseSummaryDTO,
  CDLicenseSummaryDTO
} from 'services/cd-ng'
import { useDeepCompareEffect } from '@common/hooks'
import { useGetLicenseUsage as useGetFFUsage } from 'services/cf'
import { useGetUsage as useGetCIUsage } from 'services/ci'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetCCMLicenseUsage } from 'services/ce'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

interface UsageAndLimitReturn {
  limitData: LimitReturn
  usageData: UsageReturn
}

interface UsageReturn {
  usage?: UsageProps
  loadingUsage?: boolean
  usageErrorMsg?: string
  refetchUsage?: () => void
}

interface UsageProp {
  count?: number
  displayName?: string
}

interface UsageProps {
  ci?: {
    activeCommitters?: UsageProp
  }
  ff?: {
    activeClientMAUs?: UsageProp
    activeFeatureFlagUsers?: UsageProp
  }
  ccm?: {
    activeSpend?: UsageProp
  }
}

interface LimitProps {
  ci?: {
    totalDevelopers?: number
  }
  ff?: {
    totalClientMAUs?: number
    totalFeatureFlagUnits?: number
  }
  cd?: {
    totalServiceInstances?: number
    totalWorkload?: number
  }
  ccm?: {
    totalSpendLimit?: number
  }
}

interface LimitReturn {
  limit?: LimitProps
  loadingLimit?: boolean
  limitErrorMsg?: string
  refetchLimit?: () => void
}

function useGetLimit(module: ModuleName): LimitReturn {
  const { accountId } = useParams<AccountPathProps>()

  function getLimitByModule(): LimitProps | undefined {
    let moduleLimit
    switch (module) {
      case ModuleName.CI: {
        moduleLimit = {
          ci: {
            totalDevelopers: (limitData?.data as CILicenseSummaryDTO)?.totalDevelopers
          }
        }
        break
      }
      case ModuleName.CF: {
        const cfData = limitData?.data as CFLicenseSummaryDTO
        moduleLimit = {
          ff: {
            totalClientMAUs: cfData?.totalClientMAUs,
            totalFeatureFlagUnits: cfData?.totalFeatureFlagUnits
          }
        }
        break
      }
      case ModuleName.CD: {
        const cdData = limitData?.data as CDLicenseSummaryDTO
        moduleLimit = {
          cd: {
            totalServiceInstances: cdData?.totalServiceInstances,
            totalWorkload: cdData?.totalWorkload
          }
        }
        break
      }
      case ModuleName.CE: {
        moduleLimit = {
          ccm: {
            totalSpendLimit: (limitData?.data as CELicenseSummaryDTO)?.totalSpendLimit
          }
        }
      }
    }
    return moduleLimit
  }

  const {
    data: limitData,
    loading: loadingLimit,
    error: limitError,
    refetch: refetchLimit
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: module as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId
  })

  const [limitReturn, setLimitReturn] = useState<LimitReturn>({})

  const limit = getLimitByModule()

  useDeepCompareEffect(() => {
    setLimitReturn({
      limit,
      limitErrorMsg: limitError?.message,
      loadingLimit,
      refetchLimit
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitData, loadingLimit, limitError])

  return limitReturn
}

const timestamp = moment.now()

function useGetCCMTimeStamp(): number {
  const { licenseInformation } = useLicenseStore()
  return licenseInformation?.CE?.startTime || 0
}

function useGetUsage(module: ModuleName): UsageReturn {
  const { accountId } = useParams<AccountPathProps>()
  const [usageData, setUsageData] = useState<UsageReturn>({})
  const {
    data: ciUsageData,
    loading: loadingCIUsage,
    error: ciUsageError,
    refetch: refetchCIUsage
  } = useGetCIUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CI
  })

  const {
    data: ffUsageData,
    loading: loadingFFUsage,
    error: ffUsageError,
    refetch: refetchFFUsage
  } = useGetFFUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CF
  })

  const {
    data: ccmUsageData,
    loading: loadingCCMUsage,
    error: ccmUsageError,
    refetch: refetchCCMUsage
  } = useGetCCMLicenseUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp: useGetCCMTimeStamp()
    },
    lazy: module !== ModuleName.CE
  })

  function setUsageByModule(): void {
    switch (module) {
      case ModuleName.CI:
        setUsageData({
          usage: {
            ci: {
              activeCommitters: ciUsageData?.data?.activeCommitters
            }
          },
          loadingUsage: loadingCIUsage,
          usageErrorMsg: ciUsageError?.message,
          refetchUsage: refetchCIUsage
        })
        break
      case ModuleName.CF:
        setUsageData({
          usage: {
            ff: {
              activeClientMAUs: ffUsageData?.activeClientMAUs,
              activeFeatureFlagUsers: ffUsageData?.activeFeatureFlagUsers
            }
          },
          loadingUsage: loadingFFUsage,
          usageErrorMsg: ffUsageError?.message,
          refetchUsage: refetchFFUsage
        })
        break
      case ModuleName.CE:
        setUsageData({
          usage: {
            ccm: {
              activeSpend: ccmUsageData?.data?.activeSpend
            }
          },
          loadingUsage: loadingCCMUsage,
          usageErrorMsg: ccmUsageError?.message,
          refetchUsage: refetchCCMUsage
        })
        break
    }
  }

  useDeepCompareEffect(() => {
    setUsageByModule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ciUsageData,
    ciUsageError,
    loadingCIUsage,
    ffUsageData,
    ffUsageError,
    loadingFFUsage,
    ccmUsageData,
    ccmUsageError,
    loadingCCMUsage
  ])

  return usageData
}

export function useGetUsageAndLimit(module: ModuleName): UsageAndLimitReturn {
  const limit = useGetLimit(module)
  const usage = useGetUsage(module)
  return { limitData: limit, usageData: usage }
}

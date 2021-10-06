import React, { ReactElement, useState } from 'react'
import cx from 'classnames'

import { Button, Layout } from '@wings-software/uicore'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { StringsMap } from 'stringTypes'

import SubscriptionOverview from './overview/SubscriptionOverview'
import SubscriptionBanner from './SubscriptionBanner'
import SubscriptionPlans from './plans/SubscriptionPlans'
import css from './SubscriptionsPage.module.scss'

export enum SUBSCRIPTION_TAB_NAMES {
  OVERVIEW,
  PLANS,
  BILLING
}
export interface SubscriptionTabInfo {
  name: SUBSCRIPTION_TAB_NAMES
  label: keyof StringsMap
}

export const SUBSCRIPTION_TABS: SubscriptionTabInfo[] = [
  {
    name: SUBSCRIPTION_TAB_NAMES.OVERVIEW,
    label: 'common.subscriptions.tabs.overview'
  },
  {
    name: SUBSCRIPTION_TAB_NAMES.PLANS,
    label: 'common.subscriptions.tabs.plans'
  }
  // {
  //   name: SUBSCRIPTION_TAB_NAMES.BILLING,
  //   label: 'common.subscriptions.tabs.billing'
  // }
]

interface TrialInformation {
  days: number
  expiryDate: string
  isExpired: boolean
  expiredDays: number
  edition: Editions
  isFree: boolean
}

interface SubscriptionTabProps {
  accountName?: string
  trialInfo: TrialInformation
  hasLicense?: boolean
  selectedModule: ModuleName
  licenseData?: ModuleLicenseDTO
  refetchGetLicense: () => void
}

const SubscriptionTab = ({
  accountName,
  trialInfo,
  selectedModule,
  hasLicense,
  licenseData,
  refetchGetLicense
}: SubscriptionTabProps): ReactElement => {
  const { PLANS_ENABLED } = useFeatureFlags()

  const [selectedSubscriptionTab, setSelectedSubscriptionTab] = useState<SubscriptionTabInfo>(SUBSCRIPTION_TABS[0])
  const { getString } = useStrings()

  const { isFree, edition, isExpired, expiredDays, days } = trialInfo

  function getBanner(): React.ReactElement | null {
    if ((!isExpired && licenseData?.licenseType !== 'TRIAL' && expiredDays > 14) || isFree) {
      return null
    }

    return (
      <SubscriptionBanner
        module={selectedModule}
        edition={edition}
        days={days}
        expiredDays={expiredDays}
        isExpired={isExpired}
      />
    )
  }

  function getSubscriptionTabButtons(): React.ReactElement[] {
    const tabs = SUBSCRIPTION_TABS.map(tab => {
      function handleTabClick(): void {
        setSelectedSubscriptionTab(tab)
      }

      const isSelected = tab === selectedSubscriptionTab
      const buttonClassnames = cx(css.subscriptionTabButton, isSelected && css.selected)

      return (
        <Button className={buttonClassnames} key={tab.label} round onClick={handleTabClick}>
          {getString(tab.label)}
        </Button>
      )
    })

    // show Plans tab only when feature flag is on
    if (!PLANS_ENABLED) {
      tabs.splice(1, 1)
    }

    return tabs
  }

  function getTabComponent(): React.ReactElement | null {
    switch (selectedSubscriptionTab.name) {
      case SUBSCRIPTION_TAB_NAMES.PLANS:
        return <SubscriptionPlans module={selectedModule} />
      case SUBSCRIPTION_TAB_NAMES.OVERVIEW:
      default:
        return (
          <SubscriptionOverview
            accountName={accountName}
            module={selectedModule}
            licenseData={licenseData}
            trialInformation={trialInfo}
            refetchGetLicense={refetchGetLicense}
          />
        )
    }
  }

  return (
    <React.Fragment>
      {hasLicense && getBanner()}
      <Layout.Horizontal className={css.subscriptionTabButtons} spacing="medium">
        {getSubscriptionTabButtons()}
      </Layout.Horizontal>
      {getTabComponent()}
    </React.Fragment>
  )
}

export default SubscriptionTab

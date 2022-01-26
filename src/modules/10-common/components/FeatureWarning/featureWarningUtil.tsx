/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { capitalize } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Text, Color, FontVariation, Layout } from '@harness/uicore'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import routes from '@common/RouteDefinitions'
import { useFeatureModule } from '@common/hooks/useFeatures'
import type { ModuleType } from 'framework/featureStore/featureStoreUtil'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import css from './FeatureWarning.module.scss'

export interface LicenseStatusProps {
  [key: string]: LICENSE_STATE_VALUES
}

export interface FeatureInfoBannerProps {
  featureName: FeatureIdentifier
  message: string
}

export interface ExplorePlansBtnProps {
  featureName?: FeatureIdentifier
  size?: ButtonSize
  className?: string
}

export function getPlanModule(licenseStatus: LicenseStatusProps, moduleType?: ModuleType): Module | undefined {
  switch (moduleType) {
    case 'CD':
    case 'CI':
    case 'CF':
    case 'CE':
      return moduleType.toLowerCase() as Module
    default:
      return getDefaultPlanModule(licenseStatus)
  }
}

function getDefaultPlanModule(licenseStatus: LicenseStatusProps): Module | undefined {
  const { CD_LICENSE_STATE, CI_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } = licenseStatus
  if (CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'cd'
  }
  if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'ci'
  }
  if (FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'cf'
  }
  if (CCM_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'ce'
  }
  return undefined
}

// this is to find the plan page that a feature goes to
function useGetFeaturePlanModule(featureName?: FeatureIdentifier): Module | undefined {
  const moduleType = useFeatureModule(featureName)
  const { CD_LICENSE_STATE, CI_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } = useLicenseStore()
  const licenseStatus = {
    CD_LICENSE_STATE,
    CI_LICENSE_STATE,
    FF_LICENSE_STATE,
    CCM_LICENSE_STATE
  }
  return getPlanModule(licenseStatus, moduleType)
}

export const ExplorePlansBtn = ({ featureName, size, className }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const planModule = useGetFeaturePlanModule(featureName)
  return (
    <Button
      className={className}
      variation={ButtonVariation.PRIMARY}
      size={size || ButtonSize.SMALL}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        history.push(routes.toSubscriptions({ accountId, moduleCard: planModule, tab: 'PLANS' }))
      }}
    >
      {getString('common.explorePlans')}
    </Button>
  )
}

function useRedirectToOverviewPage(
  featureName?: FeatureIdentifier
): (e: React.MouseEvent<Element, MouseEvent>) => void {
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const planModule = useGetFeaturePlanModule(featureName)
  return (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    history.push(routes.toSubscriptions({ accountId, moduleCard: planModule, tab: 'OVERVIEW' }))
  }
}

export const ViewUsageLink = ({ size, featureName }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const redirectToOverviewPage = useRedirectToOverviewPage(featureName)
  return (
    <Button
      data-name="view-usage-link"
      variation={ButtonVariation.LINK}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
        redirectToOverviewPage(e)
      }}
    >
      {capitalize(getString('common.viewUsage'))}
    </Button>
  )
}

export const ViewUsageBtn = ({ featureName, size }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const redirectToOverviewPage = useRedirectToOverviewPage(featureName)
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
        redirectToOverviewPage(e)
      }}
    >
      {capitalize(getString('common.viewUsage'))}
    </Button>
  )
}

export const UpgradeRequiredText = ({ message }: { message: string }): ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
      <Text
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.SMALL, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, padding: { right: 'small' }, size: 25 }}
      >
        {getString('common.feature.upgradeRequired.title').toUpperCase()}
      </Text>
      <Text color={Color.PRIMARY_10} font={{ variation: FontVariation.SMALL }}>
        {message}
      </Text>
    </Layout.Horizontal>
  )
}

export const RequestUpgradeBtn = ({ featureName, size }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const redirectToOverviewPage = useRedirectToOverviewPage(featureName)
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
        redirectToOverviewPage(e)
      }}
    >
      {getString('common.feature.keepGettingShipDone.requestUpgrade')}
    </Button>
  )
}

export const ManageSubscriptionBtn = ({ featureName, size }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const redirectToOverviewPage = useRedirectToOverviewPage(featureName)
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
        redirectToOverviewPage(e)
      }}
    >
      {getString('common.manageSubscription')}
    </Button>
  )
}

export const ExploreSaasPlansBtn = ({ size }: { size?: ButtonSize }): ReactElement => {
  const { getString } = useStrings()

  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.SMALL}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        window.open('https://harness.io/pricing/', '_blank')
      }}
    >
      {getString('common.exploreSaaSPlans')}
    </Button>
  )
}

export const WarningInfo = ({ message }: { message: string }): ReactElement => {
  return (
    <Text
      icon="info-message"
      color={Color.PRIMARY_10}
      font={{ variation: FontVariation.SMALL }}
      iconProps={{ padding: { right: 'small' }, size: 20, className: css.infoIcon }}
    >
      {message}
    </Text>
  )
}

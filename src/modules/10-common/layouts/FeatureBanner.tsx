/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Layout, ButtonSize, Text, Color, FontVariation } from '@harness/uicore'
import { defaultTo, capitalize } from 'lodash-es'
import cx from 'classnames'
import routes from '@common/RouteDefinitions'

import featuresFactory from 'framework/featureStore/FeaturesFactory'
import type { FeatureProps } from 'framework/featureStore/FeaturesFactory'
import type { Module } from 'framework/types/ModuleName'
import { useFeatures } from '@common/hooks/useFeatures'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import { useModuleInfo } from '@common/hooks/useModuleInfo'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { BannerType } from './Constants'
import css from './layouts.module.scss'

export const BANNER_KEY = 'feature_banner_dismissed'

function goToPage(e: React.MouseEvent<Element, MouseEvent>, pushToPage: () => void): void {
  e.preventDefault()
  e.stopPropagation()
  pushToPage()
}

const InfoText = ({ message }: { message: React.ReactNode }): React.ReactElement => {
  return (
    <Text
      icon="info-message"
      color={Color.PRIMARY_10}
      font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
      iconProps={{ padding: { right: 'medium' }, size: 25, className: css.infoIcon }}
    >
      {message}
    </Text>
  )
}

const OverUseInfoText = ({ message }: { message: React.ReactNode }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Text
        icon="warning-sign"
        color={Color.PRIMARY_10}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
        iconProps={{ size: 25, color: Color.YELLOW_900 }}
        padding={{ right: 'medium' }}
      >
        {getString('common.overuse')}
      </Text>
      <Text color={Color.PRIMARY_10} font={{ variation: FontVariation.SMALL }}>
        {message}
      </Text>
    </Layout.Horizontal>
  )
}

export const LevelUpText = ({ message }: { message: React.ReactNode }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Text
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, size: 25 }}
        padding={{ right: 'medium' }}
        className={css.btn}
      >
        {getString('common.levelUp')}
      </Text>
      <Text color={Color.PRIMARY_10} font={{ variation: FontVariation.SMALL }}>
        {message}
      </Text>
    </Layout.Horizontal>
  )
}

const ManageSubscriptionBtn = ({ size, module }: { size?: ButtonSize; module: Module }): React.ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
        goToPage(e, () => history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: 'OVERVIEW' })))
      }
      className={css.btn}
    >
      {getString('common.manageSubscription')}
    </Button>
  )
}

const ExplorePlansBtn = ({ size, module }: { size?: ButtonSize; module: Module }): React.ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
        goToPage(e, () => history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: 'PLANS' })))
      }
      className={css.btn}
    >
      {getString('common.explorePlans')}
    </Button>
  )
}

const ViewUsageLink = ({ size, module }: { size?: ButtonSize; module: Module }): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  return (
    <Button
      data-name="view-usage-link"
      variation={ButtonVariation.LINK}
      size={size || ButtonSize.SMALL}
      onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
        goToPage(e, () => history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: 'OVERVIEW' })))
      }
      className={css.btn}
    >
      {capitalize(getString('common.viewUsage'))}
    </Button>
  )
}

function getBannerBodyByType(type: BannerType, message: React.ReactNode, module: Module): React.ReactElement {
  switch (type) {
    case BannerType.INFO:
      return (
        <Layout.Horizontal width="95%" padding={{ left: 'huge' }} spacing="large">
          <InfoText message={message} />
          <ManageSubscriptionBtn module={module} />
        </Layout.Horizontal>
      )
    case BannerType.LEVEL_UP:
      return (
        <Layout.Horizontal width="95%" padding={{ left: 'huge' }} spacing="large">
          <LevelUpText message={message} />
          <ViewUsageLink module={module} />
          <ExplorePlansBtn module={module} />
        </Layout.Horizontal>
      )
    case BannerType.OVERUSE:
      return (
        <Layout.Horizontal width="95%" padding={{ left: 'huge' }} spacing="large">
          <OverUseInfoText message={message} />
          <ManageSubscriptionBtn module={module} />
        </Layout.Horizontal>
      )
    default:
      return <></>
  }
}

function getBannerClassNameByType(type: BannerType): string {
  switch (type) {
    case BannerType.INFO:
      return css.info
    case BannerType.LEVEL_UP:
      return css.levelUp
    case BannerType.OVERUSE:
      return css.overUse
    default:
      return ''
  }
}

export default function FeatureBanner(): React.ReactElement | null {
  const { module } = useModuleInfo()
  const isFeatureEnforceEnabled = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)
  const [activeModuleFeatures, setActiveModuleFeatures] = React.useState<FeatureProps | null>(null)
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<Partial<Record<Module, boolean>>>(
    BANNER_KEY,
    {},
    window.sessionStorage
  )
  const features = useFeatures({ featuresRequest: { featureNames: defaultTo(activeModuleFeatures?.features, []) } })

  React.useEffect(() => {
    if (module) {
      const moduleFeatures = featuresFactory.getFeaturesByModule(module)
      setActiveModuleFeatures(moduleFeatures || null)
    }
  }, [module])

  const { message, bannerType } = activeModuleFeatures?.renderMessage(features) || {}

  if (!isFeatureEnforceEnabled || !message || !bannerType || !module || isBannerDismissed[module]) {
    return null
  }

  return (
    <div className={cx(css.featuresBanner, getBannerClassNameByType(bannerType))}>
      {getBannerBodyByType(bannerType, message, module)}
      <Button
        variation={ButtonVariation.ICON}
        size={ButtonSize.LARGE}
        icon="cross"
        data-testid="feature-banner-dismiss"
        onClick={() => setIsBannerDismissed(prev => (module ? { ...prev, [module]: true } : prev))}
      />
    </div>
  )
}

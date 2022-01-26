/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Color, FontVariation, Layout, Text } from '@harness/uicore'
import { capitalize } from 'lodash-es'
import type { IconName } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { FeatureDescriptor, CustomFeatureDescriptor } from 'framework/featureStore/FeatureDescriptor'
import { useFeatureRequiredPlans } from '@common/hooks/useFeatures'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { StringsMap } from 'stringTypes'
import type { CheckFeatureReturn, ModuleType } from 'framework/featureStore/featureStoreUtil'
import { ExplorePlansBtn } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

interface FeatureTooltipProps {
  features: Map<FeatureIdentifier, CheckFeatureReturn>
  warningMessage?: React.ReactNode
}

const FeatureText = ({ feature, module }: { feature: CheckFeatureReturn; module: ModuleType }): React.ReactElement => {
  const { getString } = useStrings()
  const { count, featureName } = feature.featureDetail || {}
  const requiredPlans = useFeatureRequiredPlans(featureName)
  if (featureName) {
    const featureNameStr = capitalize(featureName.split('_').join(' '))
    const customFeatureDescription = CustomFeatureDescriptor[featureName]
    const featureDescription = FeatureDescriptor[featureName] ? FeatureDescriptor[featureName] : featureNameStr
    const isCore = module === 'CORE'
    const limitDescription = (
      <Text padding={{ bottom: 'small', left: 'large' }} color={Color.WHITE}>
        {getString('common.feature.levelUp.limitMessage.description' as keyof StringsMap, {
          limits: count
        })}
        &nbsp;
        {featureDescription}
        {getString('common.feature.levelUp.limitMessage.thisMonth')}
      </Text>
    )
    if (!isCore && count) {
      return customFeatureDescription ? (
        <Text padding={{ bottom: 'small', left: 'large' }} color={Color.WHITE}>
          {customFeatureDescription}
        </Text>
      ) : (
        limitDescription
      )
    }
    const requiredPlansStr = requiredPlans.length > 0 ? requiredPlans.join(' or ') : 'upgrade'
    const upgradeDescription = getString('common.feature.levelUp.planMessage' as keyof StringsMap, {
      plan: requiredPlansStr
    })
    return (
      <Text padding={{ bottom: 'small' }} color={Color.WHITE}>
        {upgradeDescription}
        {featureDescription}
      </Text>
    )
  }
  return <></>
}

const FeatureTooltip = ({ features, warningMessage }: FeatureTooltipProps): ReactElement => {
  const { getString } = useStrings()
  const firstDisabledFeature = [...features.keys()].find(key => features.get(key)?.enabled === false)

  function getGroupDisabledFeatures(): Map<ModuleType, CheckFeatureReturn[]> {
    return [...features.values()].reduce((group, feature) => {
      const module = feature.featureDetail?.moduleType
      const featureDisabled = !feature.enabled
      if (featureDisabled) {
        if (module && ['CD', 'CI', 'CE', 'CF'].includes(module)) {
          group.set(module, [...(group.get(module) || []), feature])
        } else {
          group.set('CORE', [...(group.get('CORE') || []), feature])
        }
      }
      return group
    }, new Map<ModuleType, CheckFeatureReturn[]>())
  }

  function getGroupedTooltips(): React.ReactNode {
    const groupedDisabledFeatures = getGroupDisabledFeatures()

    function getHeader(module: ModuleType): React.ReactNode | undefined {
      let icon, id
      switch (module) {
        case 'CD':
          icon = 'cd-main'
          id = 'common.purpose.cd.continuous'
          break

        case 'CI':
          icon = 'ci-main'
          id = 'common.purpose.ci.continuous'
          break
        case 'CF':
          icon = 'cf-main'
          id = 'common.purpose.cf.continuous'
          break
        case 'CE':
          icon = 'ce-main'
          id = 'common.purpose.ce.continuous'
          break
      }
      return (
        icon &&
        id && (
          <Text
            icon={icon as IconName}
            color={Color.WHITE}
            iconProps={{ color: Color.WHITE }}
            font={{ weight: 'semi-bold' }}
            padding={{ bottom: 'small' }}
          >
            {getString(id as keyof StringsMap)}
          </Text>
        )
      )
    }

    const haslimits = [...groupedDisabledFeatures.values()].find(value =>
      value.find(feature => feature.featureDetail?.limit !== undefined)
    )

    return (
      <Layout.Vertical spacing="large">
        {haslimits && (
          <Text color={Color.WHITE} padding={{ bottom: 'large' }}>
            {getString('common.feature.levelUp.description')}&nbsp;&#127937;
          </Text>
        )}
        {[...groupedDisabledFeatures.keys()].map(key => {
          const disabledFeatures = groupedDisabledFeatures.get(key)
          return (
            <Layout.Vertical key={key} padding={{ bottom: 'large' }}>
              <Layout.Vertical padding={{ bottom: 'small' }}>
                {getHeader(key)}
                {disabledFeatures?.map(feature => (
                  <FeatureText key={feature.featureDetail?.featureName} feature={feature} module={key} />
                ))}
              </Layout.Vertical>
              <ExplorePlansBtn featureName={disabledFeatures?.[0].featureDetail?.featureName} className={css.btn} />
            </Layout.Vertical>
          )
        })}
      </Layout.Vertical>
    )
  }

  function getTooltipBody(): React.ReactNode {
    // return customized warning message
    if (warningMessage) {
      return (
        <>
          <Text font={{ size: 'small' }} color={Color.WHITE} padding={{ bottom: 'large' }}>
            {warningMessage}
          </Text>
          <ExplorePlansBtn featureName={firstDisabledFeature} className={css.btn} />
        </>
      )
    }

    // group by module messages if there are any
    return getGroupedTooltips()
  }

  return (
    <Layout.Vertical padding="medium" className={css.tooltip}>
      <Text
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, size: 25 }}
        padding={{ bottom: 'xsmall' }}
      >
        {getString('common.levelUp')}
      </Text>
      {getTooltipBody()}
    </Layout.Vertical>
  )
}

export default FeatureTooltip

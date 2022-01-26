/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { ButtonSize, Color, FontVariation, Layout, Text, Popover } from '@harness/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { capitalize } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { FeatureDescriptor, CustomFeatureDescriptor } from 'framework/featureStore/FeatureDescriptor'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useFeatureRequiredPlans } from '@common/hooks/useFeatures'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ExplorePlansBtn } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

interface FeatureWarningTooltipProps {
  featureName: FeatureIdentifier
  warningMessage?: string
}
export interface FeatureWarningProps {
  featureName: FeatureIdentifier
  warningMessage?: string
  className?: string
}

export interface ExplorePlansBtnProps {
  module?: Module
  size?: ButtonSize
}

interface WarningTextProps {
  tooltip?: ReactElement
}

export const WarningText = ({ tooltip }: WarningTextProps): ReactElement => {
  const { getString } = useStrings()
  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER} content={tooltip} position={'bottom'}>
      <Text
        className={css.warning}
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.SMALL, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, padding: { right: 'small' }, size: 25 }}
      >
        {getString('common.feature.upgradeRequired.title').toUpperCase()}
      </Text>
    </Popover>
  )
}

export const FeatureWarningTooltip = ({ featureName, warningMessage }: FeatureWarningTooltipProps): ReactElement => {
  const { getString } = useStrings()
  const featureNameStr = capitalize(featureName.split('_').join(' '))
  const featureDescription = FeatureDescriptor[featureName] ? FeatureDescriptor[featureName] : featureNameStr
  const customFeatureDescription = CustomFeatureDescriptor[featureName]
  const requiredPlans = useFeatureRequiredPlans(featureName)
  const requiredPlansStr = requiredPlans.length > 0 ? requiredPlans.join(' or ') : 'upgrade'
  const upgradeDescription = getString('common.feature.levelUp.planMessage', {
    plan: requiredPlansStr
  })

  function getBody(): React.ReactNode {
    if (warningMessage || customFeatureDescription) {
      return (
        <Text font={{ size: 'small' }} color={Color.WHITE}>
          {warningMessage || customFeatureDescription}
        </Text>
      )
    }
    return (
      <Text font={{ size: 'small' }} color={Color.WHITE}>
        {upgradeDescription} {featureDescription}
      </Text>
    )
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
      <Layout.Vertical spacing="small">
        {getBody()}
        <ExplorePlansBtn featureName={featureName} className={css.btn} />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export const FeatureWarningWithTooltip = ({ featureName, warningMessage }: FeatureWarningProps): ReactElement => {
  const tooltip = <FeatureWarningTooltip featureName={featureName} warningMessage={warningMessage} />
  return <WarningText tooltip={tooltip} />
}

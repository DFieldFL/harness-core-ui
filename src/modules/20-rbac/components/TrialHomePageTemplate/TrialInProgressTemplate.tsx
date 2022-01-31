/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Color, Container, Heading, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PageNames } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import css from './TrialInProgressTemplate.module.scss'

interface TrialInProgressTemplateProps {
  title: string
  bgImageUrl: string
  isTrialInProgress?: boolean
  trialInProgressProps: TrialInProgressProps
}

interface TrialInProgressProps {
  description: string
  startBtn: {
    description: string
    onClick: () => void
  }
}

const TrialInProgressComponent: React.FC<TrialInProgressProps> = trialInProgressProps => {
  const { description, startBtn } = trialInProgressProps
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="small">
      <Text className={css.description} padding={{ bottom: 'xxlarge' }} width={500}>
        {description}
      </Text>
      <Layout.Horizontal spacing="small">
        {startBtn.description === getString('createProject') ? (
          <RbacButton
            featuresProps={{
              featuresRequest: {
                featureNames: [FeatureIdentifier.MULTIPLE_PROJECTS]
              }
            }}
            width={200}
            height={45}
            intent="primary"
            text={startBtn.description}
            onClick={startBtn.onClick}
          />
        ) : (
          <Button width={200} height={45} intent="primary" text={startBtn.description} onClick={startBtn.onClick} />
        )}
        <Text font={{ size: 'medium' }} color={Color.BLACK} padding={'small'}>
          {getString('orSelectExisting')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const TrialInProgressTemplate: React.FC<TrialInProgressTemplateProps> = ({
  title,
  bgImageUrl,
  trialInProgressProps
}) => {
  const { getString } = useStrings()
  const { module } = useModuleInfo()
  useTelemetry({
    pageName: PageNames.TrialInProgress,
    category: Category.SIGNUP,
    properties: { module: module || '' }
  })

  return (
    <Container style={{ background: `transparent url(${bgImageUrl}) no-repeat` }} className={css.container}>
      <Layout.Vertical spacing="medium">
        <Layout.Horizontal spacing="small">
          <Heading font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
            {title}
          </Heading>
          <Text
            padding={'xsmall'}
            border={{ radius: 3 }}
            color={Color.WHITE}
            background={Color.ORANGE_500}
            font={{ align: 'center' }}
          >
            {getString('common.trialInProgress')}
          </Text>
        </Layout.Horizontal>
        <TrialInProgressComponent {...trialInProgressProps} />
      </Layout.Vertical>
    </Container>
  )
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  ButtonVariation,
  Color,
  Container,
  FlexExpander,
  Heading,
  Layout,
  Link as ExternalLink,
  Text
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { useToaster } from '@common/exports'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceCenter } from '@resource-center/components/ResourceCenter/ResourceCenter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import css from './HomePageTemplate.module.scss'

interface CTAProps {
  text?: string
  onClick?: () => void
}

interface HomePageTemplate {
  title: string
  subTitle: string
  bgImageUrl: string
  documentText: string
  projectCreateSuccessHandler: (data?: Project) => void
  documentURL?: string
  ctaProps?: CTAProps
  disableAdditionalCta?: boolean
}

export const HomePageTemplate: React.FC<HomePageTemplate> = ({
  title,
  bgImageUrl,
  subTitle,
  documentText,
  documentURL = 'https://ngdocs.harness.io/',
  projectCreateSuccessHandler
}) => {
  const { updateAppStore } = useAppStore()

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler,
    onWizardComplete: data => {
      closeProjectModal()
      if (data) {
        updateAppStore({ selectedProject: data })
        projectCreateSuccessHandler(data)
      }
    }
  })

  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const { contactSales } = useQueryParams<{ contactSales?: string }>()
  const rcEnabled = useFeatureFlag(FeatureFlag.RESOURCE_CENTER_ENABLED)
  useEffect(
    () => {
      if (contactSales === 'success') {
        showSuccess(getString('common.banners.trial.contactSalesForm.success'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contactSales]
  )

  return (
    <>
      <Container className={css.container} style={{ background: `transparent url(${bgImageUrl}) no-repeat` }}>
        <Layout.Vertical spacing="medium">
          <Heading font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
            {title}
          </Heading>
          <Text color={'var(--grey-500)'} className={css.subTitle}>
            {subTitle}
          </Text>
          <ExternalLink
            className={css.link}
            color={'var(--primary-6)'}
            font={{ size: 'normal' }}
            href={documentURL}
            target="_blank"
          >
            {documentText}
          </ExternalLink>
          <Layout.Horizontal spacing="large" flex>
            <RbacButton
              variation={ButtonVariation.PRIMARY}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.MULTIPLE_PROJECTS]
                }
              }}
              large
              onClick={() => openProjectModal()}
            >
              {getString('createProject')}
            </RbacButton>
            <Text font={{ size: 'medium' }} color={Color.BLACK}>
              {getString('orSelectExisting')}
            </Text>
            <FlexExpander />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
      {rcEnabled && <ResourceCenter />}
    </>
  )
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Button, Container } from '@wings-software/uicore'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import css from './SetupSourceLayout.module.scss'

export interface FooterCTAProps {
  onNext?: () => Promise<void> | void
  onPrevious?: () => Promise<void> | void
  isSubmit?: boolean
  className?: string
}

export interface SetupSourceLayoutProps {
  content: React.ReactNode
  leftPanelContent?: React.ReactNode
  rightPanelContent?: React.ReactNode
  footerCTAProps?: FooterCTAProps
  centerOnlyLayout?: boolean
}

export function FooterCTA(props: FooterCTAProps): JSX.Element {
  const { onNext, onPrevious, isSubmit, className } = props
  const { getString } = useStrings()
  const { projectIdentifier } = useParams<ProjectPathProps>()
  return (
    <Container className={cx(css.footerCta, className)}>
      {onPrevious && (
        <Button icon="chevron-left" onClick={() => onPrevious()} minimal>
          {getString('previous')}
        </Button>
      )}
      {onNext && (
        <RbacButton
          icon="chevron-right"
          className={css.nextButton}
          intent="primary"
          permission={{
            permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
            resource: {
              resourceType: ResourceType.MONITOREDSERVICE,
              resourceIdentifier: projectIdentifier
            }
          }}
          onClick={() => onNext()}
        >
          {isSubmit ? getString('submit') : getString('next')}
        </RbacButton>
      )}
    </Container>
  )
}

export function SetupSourceLayout(props: SetupSourceLayoutProps): JSX.Element {
  const { content, leftPanelContent, rightPanelContent, centerOnlyLayout = false, footerCTAProps } = props
  return (
    <Container className={css.main}>
      <Container className={css.contentContainer}>
        {!centerOnlyLayout && <Container className={css.leftPanel}>{leftPanelContent}</Container>}
        <Container className={css.content}>{content}</Container>
        {!centerOnlyLayout && <Container className={css.rightPanel}>{rightPanelContent}</Container>}
      </Container>
      {footerCTAProps && <FooterCTA {...footerCTAProps} />}
    </Container>
  )
}

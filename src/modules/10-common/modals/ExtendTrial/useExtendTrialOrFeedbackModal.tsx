/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Button } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { FeedBackForm, ExtendTrialForm } from './ExtendTrialOrFeedbackForm'
import cfExtendTrialImg from './images/cf-extend-trial.svg'
import ciExtendTrialImg from './images/ci-extend-trial.svg'
import cdExtendTrialImg from './images/cd-extend-trial.svg'
import ceExtendTrialImg from './images/ce-extend-trial.svg'
import css from './useExtendTrialOrFeedbackModal.module.scss'

export interface FeedbackFormValues {
  experience?: string
  suggestion?: string
}

export const enum FORM_TYPE {
  EXTEND_TRIAL = 'EXTEND_TRIAL',
  FEEDBACK = 'FEEDBACK'
}

interface UseExtendTrialOrFeedbackModalProps {
  onCloseModal?: () => void
  onSubmit: (values: FeedbackFormValues) => void
  module: string
  moduleDescription: string
  bgImg?: string
  expiryDateStr: string
  formType: FORM_TYPE
  loading: boolean
}

interface UseExtendTrialOrFeedbackModalReturn {
  openExtendTrialOrFeedbackModal: () => void
  closeExtendTrialOrFeedbackModal: () => void
}

const getBgImg = (module: string): string => {
  switch (module.toUpperCase()) {
    case 'CI':
      return ciExtendTrialImg
    case 'CF':
      return cfExtendTrialImg
    case 'CD':
      return cdExtendTrialImg
    case 'CE':
      return ceExtendTrialImg
  }
  return ''
}

const ExtendTrialOrFeedbackDialog: React.FC<UseExtendTrialOrFeedbackModalProps> = ({
  expiryDateStr,
  onCloseModal,
  onSubmit,
  moduleDescription,
  formType,
  module,
  loading
}) => {
  return (
    <Layout.Horizontal>
      <Container
        width="45%"
        className={css.left}
        style={{
          background: `transparent url(${getBgImg(module)}) no-repeat`
        }}
      />
      <Container className={css.right} width="55%">
        {formType === FORM_TYPE.EXTEND_TRIAL ? (
          <ExtendTrialForm
            expiryDateStr={expiryDateStr}
            moduleDescription={moduleDescription}
            onCloseModal={() => {
              onCloseModal?.()
            }}
            onSubmit={onSubmit}
            loading={loading}
          />
        ) : (
          <FeedBackForm
            moduleDescription={moduleDescription}
            onCloseModal={() => {
              onCloseModal?.()
            }}
            onSubmit={onSubmit}
            loading={loading}
          />
        )}
      </Container>
    </Layout.Horizontal>
  )
}

export const useExtendTrialOrFeedbackModal = (
  props: UseExtendTrialOrFeedbackModalProps
): UseExtendTrialOrFeedbackModalReturn => {
  const onCloseModal = (): void => {
    props.onCloseModal?.(), hideModal()
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        onClose={onCloseModal}
        className={cx(css.dialog, Classes.DIALOG, css.feedback)}
      >
        <ExtendTrialOrFeedbackDialog {...props} onCloseModal={onCloseModal} />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={onCloseModal}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  return {
    openExtendTrialOrFeedbackModal: showModal,
    closeExtendTrialOrFeedbackModal: hideModal
  }
}

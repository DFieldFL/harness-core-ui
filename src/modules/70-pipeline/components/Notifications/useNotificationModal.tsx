import React, { useCallback, useState } from 'react'
import { useModalHook, StepWizard, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { NotificationRules } from 'services/pipeline-ng'
import { useStrings } from 'framework/exports'
import Overview from './Steps/Overview'
import PipelineEvents from './Steps/PipelineEvents'
import NotificationMethods from './Steps/NotificationMethods'
import css from './useNotificationModal.module.scss'

export interface UseNotificationModalProps {
  onCloseModal?: () => void
  onCreateOrUpdate?: (data?: NotificationRules, index?: number) => void
}

export interface UseNotificationModalReturn {
  openNotificationModal: (NotificationRules?: NotificationRules) => void
  closeNotificationModal: () => void
}

enum Views {
  CREATE,
  EDIT
}

export const useNotificationModal = ({
  onCreateOrUpdate,
  onCloseModal
}: UseNotificationModalProps): UseNotificationModalReturn => {
  const [view, setView] = useState(Views.CREATE)
  const [index, setIndex] = useState<number>()
  const [NotificationData, setNotificationData] = useState<NotificationRules>()
  const { getString } = useStrings()
  const wizardCompleteHandler = async (wizardData?: NotificationRules): Promise<void> => {
    onCreateOrUpdate?.(wizardData, index)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
          onCloseModal ? onCloseModal() : null
        }}
        className={cx(Classes.DIALOG, css.dialog)}
      >
        <StepWizard<NotificationRules>
          onCompleteWizard={wizardCompleteHandler}
          icon="notifications"
          title={getString('newNotification')}
        >
          <Overview name={getString('pipeline-notifications.nameOftheRule')} data={NotificationData} />
          <PipelineEvents name={getString('pipeline-notifications.pipelineEvents')} />
          <NotificationMethods name={getString('pipeline-notifications.notificationMethod')} />
        </StepWizard>
        <Button
          minimal
          icon="cross"
          className={css.crossIcon}
          iconProps={{ size: 18 }}
          onClick={() => {
            setView(Views.CREATE)
            hideModal()
            onCloseModal ? onCloseModal() : null
          }}
        />
      </Dialog>
    ),
    [view, NotificationData]
  )

  const open = useCallback(
    (_notification?: NotificationRules, _index?: number) => {
      setNotificationData(_notification)
      if (_notification) {
        setIndex(_index)
        setView(Views.EDIT)
      } else setView(Views.CREATE)
      showModal()
    },
    [showModal]
  )

  return {
    openNotificationModal: (notificationRules?: NotificationRules, _index?: number) => open(notificationRules, _index),
    closeNotificationModal: hideModal
  }
}

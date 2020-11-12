import React from 'react'
import { useModalHook, Button } from '@wings-software/uikit'
import { Dialog } from '@blueprintjs/core'

import {
  NotificationType,
  EmailNotificationConfiguration,
  SlackNotificationConfiguration,
  PagerDutyNotificationConfiguration
} from '@notifications/interfaces/Notifications'

import ConfigureEmailNotifications from './views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import ConfigureSlackNotifications from './views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import ConfigurePagerDutyNotifications from './views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'

import css from './ConfigureNotificationsModal.module.scss'

type FormSuccess = (
  notificationConfiguration:
    | EmailNotificationConfiguration
    | SlackNotificationConfiguration
    | PagerDutyNotificationConfiguration
) => void

export interface UseConfigureNotificationsModalProps {
  type: NotificationType
  onSuccess: FormSuccess
}

export interface UseConfigureNotificationsModalReturn {
  showModal: () => void
  hideModal: () => void
}

interface ModalBodyProps {
  type: NotificationType
  onSuccess: FormSuccess
  hideModal: () => void
}

const ModalBody: React.FC<ModalBodyProps> = ({ type, onSuccess, hideModal }) => {
  switch (type) {
    case NotificationType.Email:
      return <ConfigureEmailNotifications onSuccess={onSuccess} hideModal={hideModal} />
    case NotificationType.Slack:
      return <ConfigureSlackNotifications onSuccess={onSuccess} hideModal={hideModal} />
    case NotificationType.PagerDuty:
      return <ConfigurePagerDutyNotifications onSuccess={onSuccess} hideModal={hideModal} />
  }
}

const useConfigureNotificationsModal = (
  props: UseConfigureNotificationsModalProps
): UseConfigureNotificationsModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        className={css.dialog}
      >
        <ModalBody type={props.type} onSuccess={props.onSuccess} hideModal={hideModal} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    []
  )

  return {
    showModal,
    hideModal
  }
}

export default useConfigureNotificationsModal

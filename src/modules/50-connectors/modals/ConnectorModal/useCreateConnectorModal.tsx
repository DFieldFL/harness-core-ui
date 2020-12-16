import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uikit'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import { CreateConnectorWizard } from '@connectors/components/CreateConnectorWizard/CreateConnectorWizard'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO, ConnectorRequestBody } from 'services/cd-ng'
import css from '../../components/CreateConnectorWizard/CreateConnectorWizard.module.scss'

export interface UseCreateConnectorModalProps {
  onSuccess?: (data?: ConnectorRequestBody) => void
  onClose?: () => void
}

export interface UseCreateConnectorModalReturn {
  openConnectorModal: (
    isEditMode: boolean,
    type: ConnectorInfoDTO['type'],
    connectorInfo: ConnectorInfoDTO | void,
    modalProps?: IDialogProps
  ) => void
  hideConnectorModal: () => void
}

const useCreateConnectorModal = (props: UseCreateConnectorModalProps): UseCreateConnectorModalReturn => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [type, setType] = useState(Connectors.KUBERNETES_CLUSTER)
  const [connectorInfo, setConnectorInfo] = useState<ConnectorInfoDTO | void>()
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    style: {
      width: 1175,
      minHeight: 640,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams()

  const handleSuccess = (data?: ConnectorRequestBody): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <CreateConnectorWizard
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          type={type}
          isEditMode={isEditMode}
          connectorInfo={connectorInfo}
          onSuccess={data => {
            props.onClose?.()
            hideModal()
            handleSuccess(data)
          }}
          hideLightModal={hideModal}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [type, isEditMode, connectorInfo]
  )

  return {
    openConnectorModal: (
      isEditing: boolean,
      connectorType: ConnectorInfoDTO['type'],
      connectorDetails: ConnectorInfoDTO | void,
      _modalProps?: IDialogProps | undefined
    ) => {
      setConnectorInfo(connectorDetails)
      setIsEditMode(isEditing)
      setType(connectorType)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideConnectorModal: hideModal
  }
}

export default useCreateConnectorModal

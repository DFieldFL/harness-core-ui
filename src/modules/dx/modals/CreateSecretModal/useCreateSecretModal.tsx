import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useModalHook, Button } from '@wings-software/uikit'
import { Dialog } from '@blueprintjs/core'

import { useListSecretManagers } from 'services/cd-ng'

import CreateTextSecret from './views/CreateTextSecret'
import CreateFileSecret from './views/CreateFileSecret'

import css from './useCreateSecretModal.module.scss'

export enum SecretType {
  TEXT,
  FILE
}

export interface UseCreateSecretModalProps {
  type: SecretType
}

export interface UseCreateSecretModalReturn {
  openCreateSecretModal: (type: SecretType) => void
  closeCreateSecretModal: () => void
}

const useCreateSecretModal = (): UseCreateSecretModalReturn => {
  const [type, setType] = useState<SecretType>(SecretType.TEXT)
  const { accountId } = useParams()
  const { data: secretsManagersApiResponse, refetch: getSecretsManagers } = useListSecretManagers({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        className={css.dialog}
      >
        {type === SecretType.TEXT ? (
          <CreateTextSecret secretsManagers={secretsManagersApiResponse?.data || []} onSuccess={() => hideModal()} />
        ) : (
          <CreateFileSecret secretsManagers={secretsManagersApiResponse?.data || []} onSuccess={() => hideModal()} />
        )}
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [type]
  )

  return {
    openCreateSecretModal: (_type: SecretType) => {
      setType(_type)
      getSecretsManagers()
      showModal()
    },
    closeCreateSecretModal: hideModal
  }
}

export default useCreateSecretModal

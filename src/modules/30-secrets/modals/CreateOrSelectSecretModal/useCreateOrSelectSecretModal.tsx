/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { pick } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getReference } from '@common/utils/utils'
import CreateOrSelectSecret from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper, ConnectorInfoDTO } from 'services/cd-ng'
import { ReferenceSelectDialogTitle } from '@common/components/ReferenceSelect/ReferenceSelect'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { SecretFormData } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import useCreateUpdateSecretModal from '../CreateSecretModal/useCreateUpdateSecretModal'
import css from './useCreateOrSelectSecretModal.module.scss'

export interface UseCreateOrSelectSecretModalProps {
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  handleInlineSSHSecretCreation?: () => void
}

export interface UseCreateOrSelectSecretModalReturn {
  openCreateOrSelectSecretModal: () => void
  closeCreateOrSelectSecretModal: () => void
}

const useCreateOrSelectSecretModal = (
  props: UseCreateOrSelectSecretModalProps,
  inputs?: any[]
): UseCreateOrSelectSecretModalReturn => {
  const { getString } = useStrings()
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: data => {
      const secret = {
        ...data,
        scope: getScopeFromDTO<SecretFormData>(data)
      }
      /* istanbul ignore next */
      props.onSuccess?.({
        ...pick(secret, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier']),
        referenceString: getReference(secret.scope, secret.identifier) as string
      })
      hideModal()
    }
  })

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={ReferenceSelectDialogTitle({
          componentName: getString('secretType'),
          createNewLabel:
            props.type === 'SSHKey'
              ? getString('secrets.secret.newSSHCredential')
              : props.type === 'SecretText'
              ? // || secretType.value === 'SecretText'
                getString('secrets.secret.newSecretText')
              : getString('secrets.secret.newSecretFile'),
          createNewHandler: () => {
            if (props.type === 'SSHKey') {
              props.handleInlineSSHSecretCreation?.()
              hideModal()
            } else {
              openCreateSecretModal(
                props.type === 'SecretText'
                  ? // || secretType.value === 'SecretText'
                    'SecretText'
                  : 'SecretFile'
              )
            }
          }
        })}
        className={cx(css.createSelectSecret, css.dialog)}
      >
        <CreateOrSelectSecret
          {...props}
          onCancel={hideModal}
          onSuccess={data => {
            const secret = {
              ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier']),
              referenceString: getReference(getScopeFromDTO(data), data.identifier) as string
            }
            /* istanbul ignore next */
            props.onSuccess?.(secret)
            hideModal()
          }}
          connectorTypeContext={props.connectorTypeContext}
          handleInlineSSHSecretCreation={() => {
            props.handleInlineSSHSecretCreation?.()
            hideModal()
          }}
        />
      </Dialog>
    )
  }, inputs || [])

  return {
    openCreateOrSelectSecretModal: () => {
      showModal()
    },
    closeCreateOrSelectSecretModal: hideModal
  }
}

export default useCreateOrSelectSecretModal

import React, { useCallback, useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import type { ResourceGroupDTO } from 'services/platform'
import ResourceGroupModalFrom from './views/ResourceGroupModalForm'

export interface UseResourceGroupModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
}

export interface UseResourceGroupModalReturn {
  openResourceGroupModal: () => void
  closeResourceGroupModal: () => void
}

export const useResourceGroupModal = ({ onSuccess }: UseResourceGroupModalProps): UseResourceGroupModalReturn => {
  const [resourceGroupData, setResourceGroupData] = useState<ResourceGroupDTO>()
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        title={
          resourceGroupData
            ? getString('resourceGroup.updateResourceGroupDialogTitle')
            : getString('resourceGroup.newResourceGroup')
        }
        onClose={() => {
          hideModal()
        }}
      >
        <ResourceGroupModalFrom
          data={resourceGroupData}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          editMode={!!resourceGroupData}
        />
      </Dialog>
    ),
    [resourceGroupData]
  )
  const open = useCallback(
    (_resourceGroup?: ResourceGroupDTO) => {
      setResourceGroupData(_resourceGroup)
      showModal()
    },
    [showModal]
  )
  return {
    openResourceGroupModal: (resourceGroup?: ResourceGroupDTO) => open(resourceGroup),
    closeResourceGroupModal: hideModal
  }
}

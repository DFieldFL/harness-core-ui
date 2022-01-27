import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import EditTargetGroupCriteriaDialog, {
  EditTargetGroupCriteriaDialogProps
} from '../components/EditTargetGroupCriteria/EditTargetGroupCriteriaDialog'

const useEditTargetGroupCriteriaDialog = (
  targetGroup: EditTargetGroupCriteriaDialogProps['targetGroup'],
  onUpdate: EditTargetGroupCriteriaDialogProps['onUpdate']
): ReturnType<typeof useModalHook> => {
  const [openModal, hideModal] = useModalHook(() => (
    <EditTargetGroupCriteriaDialog hideModal={hideModal} targetGroup={targetGroup} onUpdate={onUpdate} />
  ))

  return [openModal, hideModal]
}

export default useEditTargetGroupCriteriaDialog

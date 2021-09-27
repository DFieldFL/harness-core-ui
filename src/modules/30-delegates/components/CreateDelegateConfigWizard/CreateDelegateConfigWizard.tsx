import React from 'react'
import { useParams } from 'react-router'
import { StepWizard } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { tagsType } from '@common/utils/types'
import type { DelegateProfileDetailsNg, UseAddDelegateProfileNgV2Props } from 'services/cd-ng'
import { useAddDelegateProfileNgV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import DelegateConfigOverviewStep from './steps/DelegateConfigOverviewStep'
import DelegateConfigScriptStep from './steps/DelegateConfigScriptStep'

export interface dataObj {
  name?: string
  description?: string
  script?: string
  tags?: tagsType
  identifier?: string
}

import css from './CreateDelegateConfigWizard.module.scss'

interface CreateDelegateConfigWizardProps {
  onClose: () => void
  onSuccess: () => void
}

export const CreateDelegateConfigWizard: React.FC<CreateDelegateConfigWizardProps> = ({ onClose, onSuccess }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: addDelegateProfile } = useAddDelegateProfileNgV2({
    accountId
  } as UseAddDelegateProfileNgV2Props)
  const { showSuccess, showError } = useToaster()

  const onFinish = async (delegateProfileData: DelegateProfileDetailsNg): Promise<void> => {
    try {
      await addDelegateProfile(delegateProfileData)
      showSuccess(getString('delegates.newDelegateConfigWizard.successMessage'))
      onSuccess()
    } catch (error) {
      showError(error.message)
    } finally {
      onClose()
    }
  }

  const { getString } = useStrings()
  return (
    <StepWizard className={css.delegateConfigWizard} title="Delegate Configuration">
      <DelegateConfigOverviewStep name={getString('overview')} />
      <DelegateConfigScriptStep name={getString('delegates.newDelegateConfigWizard.scriptTitle')} onFinish={onFinish} />
    </StepWizard>
  )
}

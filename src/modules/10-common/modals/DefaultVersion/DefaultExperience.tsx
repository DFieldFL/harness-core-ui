/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useUpdateLSDefaultExperience } from '@common/hooks/useUpdateLSDefaultExperience'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { Experiences } from '@common/constants/Utils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import DefaultExperienceForm from './views/DefaultExperienceForm'
import css from './DefaultExperience.module.scss'

interface Props {
  refetchAcct: () => void
  defaultExperience?: Experiences
}

interface ModalReturn {
  openDefaultExperienceModal: (_currentExperience: Experiences) => void
  closeDefaultExperienceModal: () => void
}

export const useDefaultExperienceModal = ({ defaultExperience, refetchAcct }: Props): ModalReturn => {
  const [currentExperience, setCurrentExperience] = React.useState<Experiences>(defaultExperience || Experiences.NG)
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: updateDefaultExperience, loading } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { updateLSDefaultExperience } = useUpdateLSDefaultExperience()

  const handleSubmit = async (): Promise<void> => {
    try {
      await updateDefaultExperience({
        defaultExperience: currentExperience
      })
      updateLSDefaultExperience(currentExperience)
      refetchAcct()
    } catch (error) {
      showError(error.data?.message || getString('somethingWentWrong'))
    }
    hideModal()
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen title="" onClose={hideModal} enforceFocus={false} className={cx(css.dialog, Classes.DIALOG)}>
        <DefaultExperienceForm
          onSubmit={handleSubmit}
          loading={loading}
          currentExperience={currentExperience}
          setCurrentExperience={setCurrentExperience}
        />
      </Dialog>
    ),
    [currentExperience, loading]
  )

  const open = React.useCallback(
    (_currentExperience: Experiences) => {
      setCurrentExperience(_currentExperience)
      showModal()
    },
    [showModal]
  )

  return {
    openDefaultExperienceModal: open,
    closeDefaultExperienceModal: hideModal
  }
}

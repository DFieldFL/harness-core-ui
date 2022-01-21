/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation } from '@wings-software/uicore'
import React from 'react'
import type { GitopsProviderResponse } from 'services/cd-ng'
import CreateProvider from '../CreateProvider/CreateProvider'

import css from './NewProviderModal.module.scss'

interface NewProviderModalProps {
  provider: GitopsProviderResponse | null
  isEditMode: boolean
  onClose(): void
  onUpdateMode?(mode: boolean): void
  onLaunchArgoDashboard?: (provider: GitopsProviderResponse) => void
}

const NewProviderModal: React.FC<NewProviderModalProps> = props => {
  return (
    <div className={css.addNewProviderModal}>
      <div className={css.providerModalContainer}>
        <CreateProvider onUpdateMode={props.onUpdateMode} {...props} />
      </div>

      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={() => {
          props.onClose()
        }}
        className={css.crossIcon}
      />
    </div>
  )
}

export default NewProviderModal

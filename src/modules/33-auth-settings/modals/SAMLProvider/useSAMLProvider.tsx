/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { SAMLSettings } from 'services/cd-ng'
import SAMLProviderForm from './views/SAMLProviderForm'
interface Props {
  onSuccess: () => void
}

interface UseSAMLProviderReturn {
  openSAMlProvider: (_samlProvider?: SAMLSettings) => void
  closeSAMLProvider: () => void
}

export const useSAMLProviderModal = ({ onSuccess }: Props): UseSAMLProviderReturn => {
  const [samlProvider, setSamlProvider] = React.useState<SAMLSettings>()
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        title={samlProvider ? getString('authSettings.editSAMLProvider') : getString('authSettings.addSAMLProvider')}
        enforceFocus={false}
        onClose={hideModal}
        style={{ minWidth: 'max-content' }}
      >
        <SAMLProviderForm
          samlProvider={samlProvider}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={hideModal}
        />
      </Dialog>
    ),
    [samlProvider]
  )

  const open = (_samlProvider?: SAMLSettings): void => {
    setSamlProvider(_samlProvider)
    showModal()
  }

  return {
    openSAMlProvider: open,
    closeSAMLProvider: hideModal
  }
}

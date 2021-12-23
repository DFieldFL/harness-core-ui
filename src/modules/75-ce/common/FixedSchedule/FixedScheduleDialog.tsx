/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'

interface FixedScheduleDialogProps {
  onClose?: () => void
}

const FixedScheduleDialog: React.FC<FixedScheduleDialogProps> = props => {
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      style={{
        width: 630,
        minHeight: 550,
        padding: 40,
        position: 'relative'
      }}
    >
      {props.children}
      <Button
        minimal
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={props.onClose}
        style={{ position: 'absolute', right: 'var(--spacing-small)', top: 'var(--spacing-small)' }}
        data-testid={'scheduleDialogCloseBtn'}
      />
    </Dialog>
  )
}

export default FixedScheduleDialog

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Menu, Popover, Position } from '@blueprintjs/core'
import { Button, ButtonVariation, Icon, useConfirmationDialog } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import type { ContextMenuActionsProps } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import css from './ContextMenuActions.module.scss'

export default function ContextMenuActions({
  onEdit,
  onCopy,
  onDelete,
  titleText,
  contentText,
  confirmButtonText,
  deleteLabel,
  copyLabel,
  editLabel,
  RbacPermissions
}: ContextMenuActionsProps): JSX.Element {
  const { getString } = useStrings()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { openDialog } = useConfirmationDialog({
    titleText,
    contentText,
    confirmButtonText: confirmButtonText ?? getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        onDelete?.()
      }
    }
  })

  return (
    <Popover
      isOpen={popoverOpen}
      onInteraction={next => {
        setPopoverOpen(next)
      }}
      position={Position.BOTTOM}
      content={
        <Menu>
          {!!onEdit && (
            <RbacMenuItem
              icon="edit"
              text={editLabel ?? <String stringID="edit" />}
              onClick={onEdit}
              permission={RbacPermissions?.edit}
            />
          )}
          {!!onCopy && (
            <RbacMenuItem
              className={css.bp3MenuItem}
              icon={<Icon className={css.contextCopyIcon} name="copy-alt" />}
              text={copyLabel ?? <String stringID="common.copy" />}
              onClick={onCopy}
            />
          )}
          {!!onDelete && (
            <RbacMenuItem
              icon="trash"
              text={deleteLabel ?? <String stringID="delete" />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                openDialog()
              }}
              permission={RbacPermissions?.delete}
            />
          )}
        </Menu>
      }
    >
      <Button
        minimal
        icon="Options"
        color={Color.GREY_350}
        onClick={e => {
          e.stopPropagation()
          if (!!onEdit || !!onDelete) {
            setPopoverOpen(!popoverOpen)
          }
        }}
        variation={ButtonVariation.ICON}
      />
    </Popover>
  )
}

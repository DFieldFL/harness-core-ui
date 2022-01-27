/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Icon, IconName } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'

import { Duration } from '@common/components/Duration/Duration'

import css from './GroupHeader.module.scss'

export type LogViewerAccordionStatus =
  | 'SUCCESS'
  | 'FAILURE'
  | 'RUNNING'
  | 'NOT_STARTED'
  | 'LOADING'
  | 'QUEUED'
  | 'EXPIRED'

export interface GroupHeaderProps {
  title: React.ReactNode
  onGoToTop: (event: React.MouseEvent<Element, MouseEvent>) => void
  onGoToBottom: (event: React.MouseEvent<Element, MouseEvent>) => void
  startTime?: number
  endTime?: number
  id: string
  status: LogViewerAccordionStatus
  isOpen?: boolean
  onSectionClick?(id: string, props: GroupHeaderProps): boolean | void
}

const statusIconMap: Record<LogViewerAccordionStatus, IconName> = {
  SUCCESS: 'tick-circle',
  FAILURE: 'circle-cross',
  RUNNING: 'spinner',
  QUEUED: 'spinner',
  NOT_STARTED: 'circle',
  LOADING: 'circle',
  EXPIRED: 'expired'
}

/**
 * Component which renders a section of a log
 */
export function GroupHeader(props: GroupHeaderProps): React.ReactElement {
  const { title, isOpen, status, id, onSectionClick, startTime, endTime, onGoToBottom, onGoToTop } = props
  const [open, setOpen] = React.useState(!!isOpen)

  // sync `isOpen` flag
  React.useEffect(() => {
    setOpen(!!isOpen)
  }, [isOpen, setOpen])

  /**
   * Toggle the accordion
   */
  function toggleStatus(): void {
    const ret = onSectionClick?.(id, props)

    if (ret !== false) {
      setOpen(e => {
        return !e
      })
    }
  }

  const isLoading = status === 'LOADING'

  return (
    <div className={css.groupedHeader} data-open={open} data-status={status?.toLowerCase()}>
      <div className={css.sectionSummary} onClick={toggleStatus}>
        <Icon className={css.chevron} name={isLoading ? 'spinner' : 'chevron-right'} />
        <Icon className={css.status} name={defaultTo(statusIconMap[status], 'circle')} size={12} />
        <div className={css.text}>
          <div>{title}</div>
          <div>
            {open ? (
              <React.Fragment>
                <Button
                  className={css.scrollBtn}
                  variation={ButtonVariation.ICON}
                  size={ButtonSize.SMALL}
                  iconProps={{ size: 10 }}
                  icon="arrow-up"
                  onClick={onGoToTop}
                />
                <Button
                  className={css.scrollBtn}
                  variation={ButtonVariation.ICON}
                  size={ButtonSize.SMALL}
                  iconProps={{ size: 10 }}
                  icon="arrow-down"
                  onClick={onGoToBottom}
                />
              </React.Fragment>
            ) : null}
            {startTime ? (
              <Duration className={css.duration} durationText=" " startTime={startTime} endTime={endTime} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { Button, ButtonSize, ButtonVariation } from '@harness/uicore'

import { MultiLogLine } from './MultiLogLine/MultiLogLine'
import type { CommonLogsProps } from './LogsProps'

import css from '../LogsContent.module.scss'

export type SingleSectionLogsProps = CommonLogsProps

export function SingleSectionLogs(
  props: SingleSectionLogsProps,
  ref: React.ForwardedRef<VirtuosoHandle | null>
): React.ReactElement {
  const { state } = props

  const unitKey = state.logKeys[0]
  const unit = state.dataMap[unitKey]
  const length = unit.data.length
  const [isAtBottom, setIsAtBottom] = React.useState(false)

  function handleClick(): void {
    if (!ref || !(ref as React.MutableRefObject<VirtuosoHandle | null>).current) {
      return
    }

    const handle = (ref as React.MutableRefObject<VirtuosoHandle>).current

    handle.scrollToIndex(isAtBottom ? 0 : length)
  }

  return (
    <pre className={css.container}>
      <Virtuoso
        overscan={50}
        totalCount={length}
        atBottomThreshold={Math.ceil(length / 3)}
        atBottomStateChange={setIsAtBottom}
        ref={ref}
        followOutput="auto"
        itemContent={index => (
          <MultiLogLine
            {...unit.data[index]}
            lineNumber={index}
            limit={length}
            searchText={state.searchData.text}
            currentSearchIndex={state.searchData.currentIndex}
          />
        )}
      />
      <Button
        className={css.singleSectionScrollBtn}
        variation={ButtonVariation.PRIMARY}
        size={ButtonSize.SMALL}
        iconProps={{ size: 10 }}
        icon={isAtBottom ? 'arrow-up' : 'arrow-down'}
        text={isAtBottom ? 'Top' : 'Bottom'}
        onClick={handleClick}
      />
    </pre>
  )
}

export const SingleSectionLogsWithRef = React.forwardRef<VirtuosoHandle | null, SingleSectionLogsProps>(
  SingleSectionLogs
)

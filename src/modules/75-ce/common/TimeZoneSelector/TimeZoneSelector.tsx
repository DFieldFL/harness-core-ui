/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Container, Icon, TextInput, Text } from '@wings-software/uicore'
import { ALL_TIME_ZONES } from '@ce/utils/momentUtils'
import { useStrings } from 'framework/strings'

interface Props {
  timezone: string
  onTimezoneSelect: (tz: string) => void
}

const TimezoneSelector = (props: Props) => {
  const { getString } = useStrings()
  const { timezone, onTimezoneSelect } = props
  const [searchText, setSearchText] = useState('')

  const renderTimeZones = () => {
    const filteredTimezones = ALL_TIME_ZONES.filter(t => t.toLowerCase().includes(searchText.toLowerCase()))
    return (
      <Container>
        <Virtuoso
          style={{ height: 350 }}
          data={filteredTimezones}
          overscan={{ main: 20, reverse: 20 }}
          itemContent={(_, value) => {
            return (
              <Text
                font="small"
                color="grey800"
                padding={{ top: 'xsmall', bottom: 'xsmall' }}
                onClick={() => onTimezoneSelect(value)}
                style={{ borderBottom: '1px solid var(--grey-100)' }}
              >
                {value}
              </Text>
            )
          }}
        />
      </Container>
    )
  }

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      onClosing={() => {
        setSearchText('')
      }}
      usePortal={true}
      content={
        <Container width={250} padding="medium">
          <TextInput
            value={searchText}
            placeholder={getString('ce.perspectives.reports.searchTimezonePlaceholder')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchText(e.target.value)
            }}
          />
          {renderTimeZones()}
        </Container>
      }
    >
      <>
        <Text inline color="primary6" font="small">
          {timezone}
        </Text>
        <Icon name="chevron-down" color="primary6" />
      </>
    </Popover>
  )
}

export default TimezoneSelector

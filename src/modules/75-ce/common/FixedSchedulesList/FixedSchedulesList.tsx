/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty as _isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { FixedScheduleClient } from '@ce/components/COCreateGateway/models'
import {
  CE_DATE_FORMAT_INTERNAL,
  FORMAT_12_HOUR,
  get24HourTimeIn12HourFormat,
  getTimePeriodString
} from '@ce/utils/momentUtils'
import { DaysOfWeek } from '@ce/constants'
import { Utils } from '@ce/common/Utils'
import css from './FixedScheduleList.module.scss'

interface FixedSchedeulesListProps {
  data: FixedScheduleClient[]
  handleEdit?: (schedule: FixedScheduleClient, index: number) => void
  handleDelete?: (schedule: FixedScheduleClient, index: number) => void
  isEditable?: boolean
  showHeaders?: boolean
  shrinkColumns?: boolean
}

interface ScheduleItemProps {
  schedule: FixedScheduleClient
  onEdit: (data: FixedScheduleClient) => void
  onDelete: (data: FixedScheduleClient) => void
  isEditable: boolean
  shrinkColumns?: boolean
}

interface ScheduleDescriptionProps {
  schedule: FixedScheduleClient
}

const dateFormat = `${CE_DATE_FORMAT_INTERNAL} ${FORMAT_12_HOUR}`
const EMPTY_TEXT = 'N/A'

const ScheduleItem: React.FC<ScheduleItemProps> = props => {
  const { getString } = useStrings()
  const { schedule, onEdit, onDelete } = props

  if (schedule.isDeleted) {
    return null
  }

  const gerPeriodString = () => {
    let str = ''
    if (!_isEmpty(schedule.beginsOn)) {
      str += getTimePeriodString(schedule.beginsOn as string, dateFormat)
    }
    if (str.length && !_isEmpty(schedule.endsOn)) {
      str += ` - ${getTimePeriodString(schedule.endsOn as string, dateFormat)}`
    }
    if (_isEmpty(str)) {
      str = EMPTY_TEXT
    }
    return str
  }

  const period = gerPeriodString()
  const startTime = !_isEmpty(schedule.startTime) ? `${schedule.startTime?.hour}:${schedule.startTime?.min}` : ''
  const endTime = !_isEmpty(schedule.endTime) ? `${schedule.endTime?.hour}:${schedule.endTime?.min}` : ''
  const duration = schedule.allDay
    ? getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.allDay')
    : (startTime ? get24HourTimeIn12HourFormat(startTime) : '') +
      (endTime ? '-' + get24HourTimeIn12HourFormat(endTime) : '')
  const durationText = duration || EMPTY_TEXT
  const repeats = schedule?.repeats?.map(n => DaysOfWeek[n].substring(0, 3)).join(', ') || EMPTY_TEXT

  return (
    <Container key={`${schedule.name}`} className={css.scheduleItemContainer}>
      <Layout.Horizontal>
        <div className={cx(css.col1, { [css.shrinkCol]: props.shrinkColumns })}>
          <Layout.Horizontal spacing="small">
            <Text lineClamp={1}>{schedule.name}</Text>
            <span className={Utils.getConditionalResult(schedule.type === 'downtime', css.downTag, css.upTag)}>
              {schedule.type}
            </span>
          </Layout.Horizontal>
        </div>
        <Layout.Vertical className={css.col2}>
          {period !== EMPTY_TEXT && (
            <Layout.Horizontal spacing={'small'}>
              <Icon name="calendar" />
              <Text>{period}</Text>
            </Layout.Horizontal>
          )}
          {durationText !== EMPTY_TEXT && (
            <Layout.Horizontal spacing={'small'}>
              <Icon name="time" />
              <Text>{'Duration: ' + durationText}</Text>
            </Layout.Horizontal>
          )}
          {repeats !== EMPTY_TEXT && (
            <Layout.Horizontal spacing={'small'}>
              <Icon name="main-rerun" />
              <Text>{'Repeats: ' + repeats}</Text>
            </Layout.Horizontal>
          )}
          <Layout.Horizontal spacing={'small'}>
            <Icon name="synced" />
            <Text>{'Timezone: ' + schedule.timezone}</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        {props.isEditable && (
          <Layout.Horizontal className={css.col3} spacing="medium">
            <Icon name="Edit" onClick={() => onEdit(schedule)} />
            <Icon name="main-trash" onClick={() => onDelete(schedule)} />
          </Layout.Horizontal>
        )}
      </Layout.Horizontal>
      <ScheduleDescription schedule={schedule} />
    </Container>
  )
}

export const ScheduleDescription: React.FC<ScheduleDescriptionProps> = props => {
  const descriptionText = React.useMemo(() => {
    const baseStr = 'Resources will be'
    const state = Utils.getConditionalResult(props.schedule.type === 'uptime', 'up', 'down')
    let periodStr = ''
    if (!_isEmpty(props.schedule.beginsOn)) {
      periodStr = `starting from ${getTimePeriodString(props.schedule.beginsOn as string, dateFormat)}`
    }
    if (!_isEmpty(props.schedule.endsOn)) {
      periodStr += ` and ending on ${getTimePeriodString(props.schedule.endsOn as string, dateFormat)}`
    }

    let repeatStr = ''
    if (!_isEmpty(props.schedule.repeats)) {
      repeatStr = `on every ${
        props.schedule.repeats?.length === 7
          ? 'day'
          : props.schedule.repeats
              ?.sort()
              .map(r => DaysOfWeek[r].substring(0, 3))
              .join(', ')
      }`
    }

    let timeStr = props.schedule.allDay ? '(all day)' : ''
    if (_isEmpty(timeStr) && !_isEmpty(props.schedule.startTime)) {
      const sTime = `${props.schedule.startTime?.hour}:${props.schedule.startTime?.min}`
      timeStr = `from ${get24HourTimeIn12HourFormat(sTime)}`
    }
    if (!props.schedule.allDay && !_isEmpty(props.schedule.endTime)) {
      const eTime = `${props.schedule.endTime?.hour}:${props.schedule.endTime?.min}`
      timeStr += ` to ${get24HourTimeIn12HourFormat(eTime)}`
    }

    return `${baseStr} ${state} ${repeatStr} ${timeStr} ${periodStr}`
  }, [props.schedule])

  return (
    <Text font={{ size: 'small' }} className={css.description}>
      {descriptionText}
    </Text>
  )
}

const FixedSchedeulesList: React.FC<FixedSchedeulesListProps> = props => {
  const { getString } = useStrings()
  const { isEditable = true } = props
  return (
    <Layout.Vertical spacing="medium">
      {props.showHeaders && (
        <Layout.Horizontal>
          <div className={css.col1}>
            <Text>{getString('name')}</Text>
          </div>
          <div className={css.col2}>
            <Text>{'Details'}</Text>
          </div>
          <div className={css.col3}></div>
        </Layout.Horizontal>
      )}
      <div>
        {props.data.map((schItem, index) => (
          <ScheduleItem
            key={schItem.name}
            schedule={schItem}
            onDelete={s => props.handleDelete?.(s, index)}
            onEdit={s => props.handleEdit?.(s, index)}
            isEditable={isEditable}
            shrinkColumns={props.shrinkColumns}
          />
        ))}
      </div>
    </Layout.Vertical>
  )
}

export default FixedSchedeulesList

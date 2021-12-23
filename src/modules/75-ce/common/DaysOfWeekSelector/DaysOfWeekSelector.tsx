/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { isEmpty as _isEmpty, isEqual as _isEqual, sortBy as _sortBy } from 'lodash-es'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { DaysOfWeek } from '@ce/constants'
import css from './DaysOfWeekSelector.module.scss'

interface DaysObject {
  id: number
  value: string
}

interface DaysOfWeekSelectorProps {
  onChange: (selectedDays: DaysObject[]) => void
  selection?: number[]
  disable?: boolean
}

export const days: DaysObject[] = Object.keys(DaysOfWeek)
  .filter(val => isNaN(Number(val)))
  .map((key, i) => ({ id: i, value: key }))

const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = props => {
  const getSelectedDays = () => {
    return !_isEmpty(props.selection)
      ? (props.selection?.map(d => ({ id: d, value: DaysOfWeek[d] })) as DaysObject[])
      : []
  }

  const [selectedDays, setSelectedDays] = useState<DaysObject[]>([])

  useEffect(() => {
    const modifiedSelection = getSelectedDays()
    if (!_isEqual(_sortBy(modifiedSelection), _sortBy(selectedDays))) {
      setSelectedDays(modifiedSelection)
    }
  }, [props.selection])

  const handleSelection = (day: DaysObject) => {
    const currDay = selectedDays.find(d => d.id === day.id)
    const newDays = currDay ? [...selectedDays].filter(d => d.id !== day.id) : [...selectedDays, day]
    setSelectedDays(newDays)
    props.onChange(newDays)
  }

  return (
    <Layout.Horizontal className={cx(css.daysOfWeekSelectorCont, { [css.disabled]: props.disable })}>
      {days.map(d => {
        return (
          <div
            key={d.value}
            className={cx(css.day, { [css.selected]: selectedDays.filter(k => k.id === d.id).length > 0 })}
            onClick={() => handleSelection(d)}
            data-testid={d.value}
          >
            {d.value[0].toUpperCase()}
          </div>
        )
      })}
    </Layout.Horizontal>
  )
}

export default DaysOfWeekSelector

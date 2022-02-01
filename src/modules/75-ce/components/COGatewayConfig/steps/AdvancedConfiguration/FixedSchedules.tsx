/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Button, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { FixedScheduleClient } from '@ce/components/COCreateGateway/models'
import FixedSchedeulesList from '@ce/common/FixedSchedulesList/FixedSchedulesList'
import useFixedScheduleEditor from '@ce/common/FixedSchedule/useFixedScheduleEditor'

interface FixedSchedulesProps {
  schedules: FixedScheduleClient[]
  addSchedules: (schedules: FixedScheduleClient[]) => void
}

interface EditParams {
  isEdit: boolean
  index: number
}

const defaultEditParams: EditParams = { isEdit: false, index: -1 }

const FixedSchedules: React.FC<FixedSchedulesProps> = props => {
  const { getString } = useStrings()
  const [selectedSchedule, setSelectedSchedule] = useState<FixedScheduleClient>()
  const [editParams, setEditParams] = useState<EditParams>(defaultEditParams)

  const resetParams = () => {
    setSelectedSchedule(undefined)
    setEditParams(defaultEditParams)
  }

  const handleScheduleAddition = (schedule: FixedScheduleClient) => {
    let updatedSchedules
    if (editParams.isEdit) {
      updatedSchedules = [...props.schedules]
      updatedSchedules.splice(editParams.index, 1, schedule)
    } else {
      updatedSchedules = [...props.schedules, schedule]
    }
    props.addSchedules(updatedSchedules)
    resetParams()
  }

  const { openEditor } = useFixedScheduleEditor({
    schedule: selectedSchedule,
    scheduleIndex: editParams.index,
    addSchedule: handleScheduleAddition,
    allCreatedSchedules: props.schedules
  })

  const addFixedSchedule = () => {
    resetParams()
    openEditor()
  }

  const editSchedule = (_schedule: FixedScheduleClient, index: number) => {
    setEditParams({ isEdit: true, index })
    setSelectedSchedule(_schedule)
    openEditor()
  }

  const deleteSchedule = (_schedule: FixedScheduleClient, index: number) => {
    const updatedSchedules = [...props.schedules]
    updatedSchedules.splice(index, 1, { ..._schedule, isDeleted: true })
    props.addSchedules(updatedSchedules)
    resetParams()
  }

  return (
    <Layout.Vertical spacing="medium">
      <Text>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.description')}</Text>
      {!_isEmpty(props.schedules) && (
        <FixedSchedeulesList data={props.schedules} handleEdit={editSchedule} handleDelete={deleteSchedule} />
      )}
      <Button
        intent="none"
        onClick={addFixedSchedule}
        icon={'plus'}
        data-testid="addScheduleBtn"
        style={{ maxWidth: 200 }}
      >
        {getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.addSchedulesBtn')}
      </Button>
    </Layout.Vertical>
  )
}

export default FixedSchedules

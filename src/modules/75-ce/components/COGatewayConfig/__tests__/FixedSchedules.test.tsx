/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import type { FixedScheduleClient } from '@ce/components/COCreateGateway/models'
import FixedScheduleForm from '@ce/common/FixedSchedule/FixedScheduleForm'
import FixedSchedules from '../steps/AdvancedConfiguration/FixedSchedules'

const params = { accountId: 'accountId' }

const schedules: FixedScheduleClient[] = [
  {
    name: 'schedule1',
    type: 'uptime',
    beginsOn: '2021-11-03T12:36:26.242470799+05:30',
    endsOn: '2021-11-03T14:36:26.242470799+05:30',
    startTime: {
      hour: 13,
      min: 12
    },
    endTime: {
      hour: 15,
      min: 12
    },
    allDay: false,
    repeats: [1, 3, 5],
    everyday: false,
    timezone: 'Asia/Calcutta',
    isDeleted: false
  }
]

// const dates = [
//   { id: 'beginsOn', value: '10/30/2021 10:00' },
//   { id: 'endsOn', value: '11/01/2021 20:00' }
// ]

jest.mock('services/lw', () => ({
  useValidateStaticScheduleList: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve({}))
  }))
}))

describe('Static Schedules tests', () => {
  test('should render the static schedule component successfully', () => {
    const addSchedules = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <FixedSchedules schedules={schedules} addSchedules={addSchedules} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('add schedule button should open schedule form modal', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={params}>
        <FixedSchedules schedules={schedules} addSchedules={jest.fn()} />
      </TestWrapper>
    )

    const btn = getByTestId('addScheduleBtn')
    expect(btn).toBeDefined()
    act(() => {
      fireEvent.click(btn)
    })

    const header = getByText('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.newScheduleTitle')
    expect(header).toBeDefined()
  })
})

describe('Static Schedule form tests', () => {
  test('form renders successfully', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <FixedScheduleForm addSchedule={jest.fn()} closeDialog={jest.fn()} schedule={undefined} allSchedules={[]} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('able to fill all fields', async () => {
    const { container, getByTestId } = render(
      <TestWrapper pathParams={params}>
        <FixedScheduleForm addSchedule={jest.fn()} closeDialog={jest.fn()} schedule={undefined} allSchedules={[]} />
      </TestWrapper>
    )
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    expect(nameInput).toBeDefined()
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'dummySchedule' } })
    })
    expect(nameInput.value).toBe('dummySchedule')

    const type = container.querySelector('div[data-name="toggle-option-two"]')
    expect(type).toBeDefined()
    act(() => {
      fireEvent.click(type!)
    })

    // dates.forEach(d => {
    //   const dateInput = getByTestId(d.id) as HTMLInputElement
    //   expect(dateInput).toBeDefined()
    //   act(() => {
    //     fireEvent.change(dateInput, { target: { value: d.value } })
    //   })
    //   expect(dateInput.value).toBe(d.value)
    // })

    const daySelector = getByTestId('MONDAY')
    expect(daySelector).toBeDefined()
    act(() => {
      fireEvent.click(daySelector)
    })

    const [startTimeHour, endTimeHour] = container.getElementsByClassName('bp3-timepicker-hour')
    expect(startTimeHour).toBeDefined()
    expect(endTimeHour).toBeDefined()
    act(() => {
      fireEvent.change(startTimeHour, { target: { value: '6' } })
    })
    act(() => {
      fireEvent.change(endTimeHour, { target: { value: '10' } })
    })
  })

  test('able to submit the form with all the fields', async () => {
    const closeDialogFn = jest.fn()
    const addScheduleFn = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <FixedScheduleForm
          addSchedule={addScheduleFn}
          closeDialog={closeDialogFn}
          schedule={schedules[0]}
          allSchedules={[]}
        />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitBtn) {
      submitBtn.disabled = false
    }
    expect(submitBtn).toBeDefined()
    act(() => {
      fireEvent.click(submitBtn!)
    })

    await waitFor(() => expect(addScheduleFn).toBeCalledTimes(1))
  })
})

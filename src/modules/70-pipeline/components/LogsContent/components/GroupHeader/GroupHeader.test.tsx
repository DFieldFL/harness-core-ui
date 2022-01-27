/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'

import { GroupHeader, GroupHeaderProps } from './GroupHeader'

jest.mock('@common/components/Duration/Duration', () => ({
  // eslint-disable-next-line react/display-name
  Duration: () => <div>MOCK DURATION</div>
}))

const props: GroupHeaderProps = {
  title: 'Header 1',
  id: 'header-1',
  status: 'SUCCESS',
  startTime: 1000,
  endTime: 1120,
  onGoToBottom: jest.fn(),
  onGoToTop: jest.fn()
}

describe('<GroupHeader /> tests', () => {
  test('SUCCESS snapshot test', () => {
    const { container } = render(<GroupHeader {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('LOADING snapshot test', () => {
    const { container } = render(
      <GroupHeader {...props} status="LOADING" startTime={null as any} endTime={null as any} />
    )
    expect(container).toMatchSnapshot()
  })

  test('toggle works', () => {
    const { container } = render(<GroupHeader {...props} />)
    expect(container.querySelector<HTMLDivElement>('.groupedHeader')!.dataset.open).toBe('false')
    act(() => {
      fireEvent.click(container.querySelector('.sectionSummary')!)
    })

    expect(container).toMatchSnapshot()
    expect(container.querySelector<HTMLDivElement>('.groupedHeader')!.dataset.open).toBe('true')
  })

  test('toggle should not work if onSectionClick returns false', () => {
    const { container } = render(<GroupHeader {...props} onSectionClick={() => false} />)
    expect(container.querySelector<HTMLDivElement>('.groupedHeader')!.dataset.open).toBe('false')

    act(() => {
      fireEvent.click(container.querySelector('.sectionSummary')!)
    })

    expect(container).toMatchSnapshot()
    expect(container.querySelector<HTMLDivElement>('.groupedHeader')!.dataset.open).toBe('false')
  })
})

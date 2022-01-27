/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-test-renderer'
import { Classes } from '@blueprintjs/core'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SelectedAppsSideNav, SelectedAppsSideNavProps } from '../SelectedAppsSideNav'

function WrapperComponent(props: SelectedAppsSideNavProps): JSX.Element {
  return (
    <TestWrapper>
      <SelectedAppsSideNav {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for SelectedAppsSideNav', () => {
  test('Ensure loading state is rendered correectly', async () => {
    const { container } = render(<WrapperComponent loading={true} />)
    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(5))
  })
  test('Ensure that when apps are provided, the list is rendered', async () => {
    const { container } = render(
      <WrapperComponent
        selectedApps={Array(50)
          .fill(null)
          .map((_, i) => i.toString())}
      />
    )
    await waitFor(() => expect(container.querySelectorAll(`[class*="selectedApp"]`).length).toBe(50))
    expect(container).toMatchSnapshot()
  })

  test('Ensure that when groupedSelectedApps is provided, the grouped list is rendered', async () => {
    const { container } = render(
      <WrapperComponent
        selectedApps={['appdMetric 102', 'appdMetric 101']}
        groupedSelectedApps={{
          'Group 2': [{ groupName: { label: 'Group 2', value: 'Group 2' }, metricName: 'appdMetric 102 ' }],
          'Group 1': [{ groupName: { label: 'Group 1', value: 'Group 1' }, metricName: 'appdMetric 101' }]
        }}
      />
    )
    await waitFor(() => expect(container.querySelectorAll(`[class*="collapsePanel"]`).length).toBe(2))
    await waitFor(() => expect(container.querySelectorAll(`[class*="selectedApp"]`).length).toBe(4))
    // Collapsed
    await waitFor(() =>
      expect(container.querySelectorAll('.bp3-collapse-body')[0]).toHaveStyle(`transform: translateY(0);`)
    )
    await waitFor(() =>
      expect(container.querySelectorAll('.bp3-collapse-body')[1]).toHaveStyle(`transform: translateY(0);`)
    )

    act(() => {
      fireEvent.click(container.querySelectorAll(`[class*="selectedApp"]`)[1])
      fireEvent.click(container.querySelectorAll(`[class*="selectedApp"]`)[0])
    })

    // Expanded
    await waitFor(() =>
      expect(container.querySelectorAll('.bp3-collapse-body')[0]).toHaveStyle(`transform: translateY(0);`)
    )
    await waitFor(() =>
      expect(container.querySelectorAll('.bp3-collapse-body')[1]).toHaveStyle(`transform: translateY(0);`)
    )

    expect(container).toMatchSnapshot()
  })
})

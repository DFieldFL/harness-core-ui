/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import NewProviderModal from '../NewProviderModal/NewProviderModal'

const onClose = jest.fn()

describe('<NewProviderModal /> tests', () => {
  test('snapshot test for new provider modal', () => {
    const { container } = render(
      <TestWrapper>
        <NewProviderModal provider={null} isEditMode onClose={onClose} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on button, triggers close event', () => {
    const { container } = render(
      <TestWrapper>
        <NewProviderModal provider={null} isEditMode onClose={onClose} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.crossIcon')!)
    expect(onClose).toBeCalledTimes(1)
  })
})

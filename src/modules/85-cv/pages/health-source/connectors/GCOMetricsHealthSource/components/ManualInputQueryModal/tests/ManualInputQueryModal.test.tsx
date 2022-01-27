/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { ManualInputQueryModal, FieldNames } from '../ManualInputQueryModal'

describe('Unit tests for ManualInputQueryModal ', () => {
  test('Ensure that duplicate metric name is validated', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ManualInputQueryModal
          onSubmit={jest.fn()}
          manuallyInputQueries={['metric1', 'metric2', 'metric3', 'metric2']}
          closeModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('[class*="main"]')))

    fireEvent.click(document.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('cv.monitoringSources.gco.manualInputQueryModal.modalTitle')))
  })

  test('Ensure submit function is called when there are no duplicate values', async () => {
    const submitFuncFn = jest.fn()
    render(
      <TestWrapper>
        <ManualInputQueryModal
          onSubmit={submitFuncFn}
          manuallyInputQueries={['metric1', 'metric2', 'metric3', 'metric4']}
          closeModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('[class*="main"]')))
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      value: 'metric5',
      fieldId: FieldNames.METRIC_NAME
    })

    fireEvent.click(document.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(submitFuncFn).toHaveBeenLastCalledWith({
        metricName: 'metric5',
        identifier: 'metric5'
      })
    )
  })
})

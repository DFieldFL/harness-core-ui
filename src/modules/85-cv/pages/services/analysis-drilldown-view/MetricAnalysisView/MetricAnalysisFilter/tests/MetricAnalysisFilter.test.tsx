import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { MetricAnalysisFilterType, MetricAnalysisFilter, FILTER_OPTIONS } from '../MetricAnalysisFilter'

describe('Unit tests for MetricAnalysisFilter', () => {
  test('Ensure onchange is invoked when option is updated', async () => {
    const onChangeMock = jest.fn()
    const { container } = render(<MetricAnalysisFilter onChangeFilter={onChangeMock} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // press caret icoon and select all metrics option
    const caretIcon = container.querySelector('[class*="bp3-input-action"] [data-icon="caret-down"]')
    if (!caretIcon) {
      throw Error('Drop down was not rendered.')
    }

    fireEvent.click(caretIcon)
    await waitFor(() => expect(document.body.querySelector('[class*="menuItem"]')).not.toBeNull())
    const options = document.querySelectorAll('[class*="menuItem"]')
    fireEvent.click(options[1])
    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(MetricAnalysisFilterType.ALL_METRICS))
  })

  test('Ensure that default value is rendered', async () => {
    const { container } = render(
      <MetricAnalysisFilter onChangeFilter={jest.fn()} defaultFilterValue={FILTER_OPTIONS[1]} />
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector(`input[value="${FILTER_OPTIONS[1].label}"]`)).not.toBeNull()
  })
})

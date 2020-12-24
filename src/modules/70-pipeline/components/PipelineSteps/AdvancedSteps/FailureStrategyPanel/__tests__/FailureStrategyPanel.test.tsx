import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react'

import { Basic } from '../FailureStrategyPanel.stories'
import { Strategy } from '../StrategySelection/StrategyConfig'

describe('<FailureStratergyPanel /> tests', () => {
  test('initial render with no data', () => {
    const { container } = render(<Basic data={{ failureStrategies: [] }} />)
    expect(container).toMatchSnapshot()
  })

  test('adding a new strategy works', async () => {
    const { container, findByTestId } = render(<Basic data={{ failureStrategies: [] }} />)

    const add = await findByTestId('add-failure-strategy')

    await act(() => {
      fireEvent.click(add)
      return Promise.resolve()
    })

    await waitFor(() => findByTestId('failure-strategy-step-0'))

    expect(container).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - {}

      </pre>
    `)
  })

  test('removing a strategy works', async () => {
    const { container, findByTestId, getByTestId } = render(<Basic data={{ failureStrategies: [{}, {}] }} />)

    const step2 = await findByTestId('failure-strategy-step-1')

    await act(() => {
      fireEvent.click(step2)
      return Promise.resolve()
    })

    const deleteBtn = await findByTestId('remove-failure-strategy')

    await act(() => {
      fireEvent.click(deleteBtn)
      return Promise.resolve()
    })

    expect(() => getByTestId('failure-strategy-step-1')).toThrow()

    expect(container).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - {}

      </pre>
    `)
  })

  test.each<[Strategy]>([
    [Strategy.EndExecution],
    [Strategy.Ignore],
    [Strategy.StageRollback],
    [Strategy.StepGroupRollback]
  ])('simple strategy: "%s"', async strategy => {
    const { container, findByTestId } = render(<Basic data={{ failureStrategies: [{}] }} />)

    const selection = await findByTestId(`failure-strategy-${strategy.toLowerCase()}`)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    expect(container).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code).toMatchSnapshot('code')
  })
})

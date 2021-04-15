import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'

import { testIds, Strategy } from '../StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'
import { Modes } from '../../common'
describe('Failure Strategy: StageRollBack', () => {
  test('selection works', async () => {
    const { findByTestId } = render(<Basic data={{ failureStrategies: [{}] }} mode={Modes.STEP_GROUP} />)

    const selection = await findByTestId(testIds.StageRollback)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            action:
              type: StageRollback

      </pre>
    `)
  })

  test('deselection works', async () => {
    const { findByTestId } = render(
      <Basic
        data={{ failureStrategies: [{ onFailure: { action: { type: Strategy.StageRollback } } }] }}
        mode={Modes.STEP_GROUP}
      />
    )

    const selection = await findByTestId(testIds.StageRollback)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            action: {}

      </pre>
    `)
  })
})

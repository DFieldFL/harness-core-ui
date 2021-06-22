import React from 'react'
import { render } from '@testing-library/react'

import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { errorTypesForStages } from '../StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'

describe('CI <FailureStrategyPanel /> tests', () => {
  test('adding all error types disable Add button and prevents new strategy addition', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: errorTypesForStages[StageType.BUILD],
                action: {
                  type: Strategy.Abort
                }
              }
            }
          ]
        }}
        mode={Modes.STAGE}
        stageType={StageType.BUILD}
      />
    )

    const add = await findByTestId('add-failure-strategy')

    expect(add.classList.contains('bp3-disabled')).toBe(true)
    expect(add.hasAttribute('disabled')).toBe(true)
  })

  test('in stage mode of CI, can delete first error type', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.Unknown],
                action: {
                  type: Strategy.Abort
                }
              }
            }
          ]
        }}
        mode={Modes.STAGE}
        stageType={StageType.BUILD}
      />
    )

    const del = await findByTestId('remove-failure-strategy')

    expect(del.hasAttribute('disabled')).toBe(false)
  })
})

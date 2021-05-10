import React from 'react'
import { render, act } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { StepFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { AdvancedStepsWithRef } from '../AdvancedSteps'

describe('<AdvancedSteps /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <AdvancedStepsWithRef
          isStepGroup={false}
          isReadonly={false}
          step={{}}
          stepsFactory={{ getStep: jest.fn(() => ({ hasDelegateSelectionVisible: true })) } as any}
          onChange={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // this test can be removed if we remove obSubmit handler
  test('submit works', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onSubmit = jest.fn()

    render(
      <TestWrapper>
        <AdvancedStepsWithRef
          isStepGroup={false}
          step={{}}
          isReadonly={false}
          stepsFactory={{ getStep: jest.fn() } as any}
          ref={ref}
          onChange={onSubmit}
        />
      </TestWrapper>
    )

    await act(() => {
      ref.current?.submitForm()
    })

    expect(onSubmit).toHaveBeenCalledWith({
      delegateSelectors: [],
      failureStrategies: undefined,
      when: undefined,
      tab: 'ADVANCED'
    })
  })
})

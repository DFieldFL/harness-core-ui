/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContextInterface,
  PipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { FailureStrategyProps } from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'
import type { StepCommandsRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import type { ManualInterventionFailureActionConfig } from 'services/cd-ng'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import * as useTelemetry from '@common/hooks/useTelemetry'
import * as useValidationErrors from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import DeployAdvancedSpecifications from '../DeployAdvancedSpecifications'
import overridePipelineContext from './overrideSetPipeline.json'

const getOverrideContextValue = (): PipelineContextInterface => {
  return {
    ...overridePipelineContext,
    getStageFromPipeline: jest.fn().mockReturnValue({
      stage: {
        stage: {
          name: 'Stage 3',
          identifier: 's3',
          type: StageType.DEPLOY,
          description: '',
          spec: {}
        }
      }
    }),
    updateStage: jest.fn(),
    updatePipeline: jest.fn()
  } as any
}

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

jest
  .spyOn(useTelemetry, 'useTelemetry')
  .mockReturnValue({ identifyUser: jest.fn(), trackEvent: jest.fn(), trackPage: jest.fn() })

jest.mock('@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy') as any),
  // eslint-disable-next-line react/display-name
  FailureStrategyWithRef: React.forwardRef(({ onUpdate }: FailureStrategyProps, _ref: StepCommandsRef) => {
    return (
      <div className="failure-strategy-mock">
        <button
          name={'updateFailureStrategy'}
          onClick={() => {
            onUpdate({
              failureStrategies: [
                {
                  onFailure: {
                    errors: ['AllErrors'],
                    action: {
                      type: 'ManualIntervention'
                    } as ManualInterventionFailureActionConfig
                  }
                }
              ]
            })
          }}
        >
          Failure Strategy button
        </button>
      </div>
    )
  })
}))

// eslint-disable-next-line react/display-name
jest.mock('@pipeline/components/PipelineStudio/ConditionalExecution/ConditionalExecution', () => (props: any) => (
  <div className="conditional-execution-mock">
    <button
      name={'updateConditionalExecution'}
      onClick={() => {
        props.onUpdate({ pipelineStatus: 'Success' })
      }}
    >
      Conditional Execution button
    </button>
  </div>
))

describe('Deploy advanced specifications test', () => {
  test('Should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployAdvancedSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`Should Failure Strategy section be present`, () => {
    expect.assertions(1)

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployAdvancedSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container.querySelector('#failureStrategy')).toBeInTheDocument()
  })

  test(`Should Conditional Execution section be present`, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployAdvancedSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container.querySelector('#conditionalExecution')).toBeInTheDocument()
  })

  test('Should onUpdate ConditionalExecution be called', async () => {
    const context = getOverrideContextValue()

    const { findByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <DeployAdvancedSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const button = await waitFor(() => findByText('Conditional Execution button'))
    fireEvent.click(button as HTMLElement)

    expect(context.getStageFromPipeline).toBeCalled()
    expect(context.getStageFromPipeline).toBeCalledWith(context.state.selectionState.selectedStageId)
    expect(context.updateStage).toBeCalled()
  })

  test('Should onUpdate FailureStrategies be called', async () => {
    const context = getOverrideContextValue()

    const { findByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <DeployAdvancedSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const button = await waitFor(() => findByText('Failure Strategy button'))
    fireEvent.click(button as HTMLElement)

    expect(context.getStageFromPipeline).toBeCalled()
    expect(context.getStageFromPipeline).toBeCalledWith(context.state.selectionState.selectedStageId)
    expect(context.updateStage).toBeCalled()
    expect(useTelemetry.useTelemetry().trackEvent).toBeCalled()
  })

  test('Should call submitFormsForTab when errorMap is not empty', async () => {
    const context = getOverrideContextValue()
    const errorContextProvider = {
      state: {} as any,
      checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
      subscribeForm: () => undefined,
      unSubscribeForm: () => undefined,
      submitFormsForTab: jest.fn()
    }

    jest.spyOn(useValidationErrors, 'useValidationErrors').mockReturnValue({ errorMap: new Map([['error', []]]) })

    render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <StageErrorContext.Provider value={errorContextProvider}>
            <DeployAdvancedSpecifications />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(errorContextProvider.submitFormsForTab).toBeCalled()
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import * as useValidationErrors from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { EditStageView } from '../EditStageView'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('Edit stage view test', () => {
  test('Should match snapshot when context is provided', () => {
    const errorContextProvider = {
      state: {} as any,
      checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
      subscribeForm: jest.fn(),
      unSubscribeForm: () => undefined,
      submitFormsForTab: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <StageErrorContext.Provider value={errorContextProvider}>
          <EditStageView isReadonly={false} context="setup" />
        </StageErrorContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(errorContextProvider.subscribeForm).toBeCalled()
    expect(container.getElementsByClassName('tabSubHeading')[0]).toBeInTheDocument()
    expect(container.getElementsByClassName('thumbnailSelect')[0]).toBeInTheDocument()
    expect(container.getElementsByClassName('accordion')[0]).toBeInTheDocument()
  })

  test('Should match snapshot when template is provided', () => {
    const errorContextProvider = {
      state: {} as any,
      checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
      subscribeForm: jest.fn(),
      unSubscribeForm: () => undefined,
      submitFormsForTab: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <StageErrorContext.Provider value={errorContextProvider}>
          <EditStageView
            isReadonly={false}
            template={{
              accountId: 'accountId',
              description: 'description',
              identifier: 'identifier',
              name: 'name',
              orgIdentifier: 'orgIdentifier',
              projectIdentifier: 'projectIdentifier'
            }}
          />
        </StageErrorContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(container.querySelector('[data-icon="template-library"]')).toBeInTheDocument()
  })

  test('Should call submitFormsForTab when errorMap is not empty', async () => {
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
        <StageErrorContext.Provider value={errorContextProvider}>
          <EditStageView isReadonly={false} />
        </StageErrorContext.Provider>
      </TestWrapper>
    )

    expect(errorContextProvider.submitFormsForTab).toBeCalled()
  })

  test('Should onSubmit be called on submit button click', async () => {
    const mockSubmit = jest.fn()

    const mockData: StageElementWrapper<DeploymentStageElementConfig> = {
      stage: {
        name: 'Stage 3',
        identifier: 's3',
        type: StageType.DEPLOY,
        description: '',
        spec: {
          serviceConfig: {},
          infrastructure: {},
          execution: {
            steps: []
          }
        }
      }
    }

    const { findByText } = render(
      <TestWrapper>
        <EditStageView isReadonly={false} data={mockData} onSubmit={mockSubmit} />
      </TestWrapper>
    )

    const button = await waitFor(() => findByText('pipelineSteps.build.create.setupStage'))
    fireEvent.click(button)

    expect(await waitFor(() => mockSubmit)).toBeCalled()
  })
})

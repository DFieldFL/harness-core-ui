/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { GetInputSetsResponse } from '@pipeline/pages/inputSet-list/__tests__/InputSetListMocks'
import {
  mockCreateInputSetResponse,
  mockGetPipeline,
  mockGetResolvedPipeline,
  mockInputSetsList,
  mockMergeInputSetResponse
} from '@pipeline/components/RunPipelineModal/__tests__/mocks'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import RetryPipeline from '../RetryPipeline'
import { mockInputsetYamlV2, mockPostRetryPipeline, mockRetryStages } from './mocks'

const commonProps = {
  pipelineIdentifier: 'pid',
  executionIdentifier: 'executionId',
  onClose: jest.fn()
}

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn().mockImplementation(() => ({ executionId: '' })),
  useMutateAsGet: jest.fn().mockImplementation(props => {
    if (props?.name === 'useGetYamlWithTemplateRefsResolved') {
      return mockGetResolvedPipeline
    } else {
      return { data: { data: {} }, refetch: jest.fn(), error: null, loading: false }
    }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => mockGetPipeline),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => mockMergeInputSetResponse),
  useGetInputSetsListForPipeline: jest.fn(() => mockInputSetsList),
  useCreateInputSetForPipeline: jest.fn(() => mockCreateInputSetResponse),
  useGetInputsetYamlV2: jest.fn(() => mockInputsetYamlV2),
  useRetryPipeline: jest.fn(() => mockPostRetryPipeline),
  useGetRetryStages: jest.fn(() => mockRetryStages),
  getInputSetForPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(GetInputSetsResponse.data))
}))
describe('Retry Pipeline tests', () => {
  test('Retry Failed Pipeline title and button to be defined', () => {
    const { queryAllByText } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    expect(queryAllByText('pipeline.retryPipeline')[0]).not.toBeNull()
    expect(queryAllByText('pipeline.retryPipeline').length).toEqual(2)
  })
  test('toggle between visual and yaml mode', async () => {
    const { container, getByText, queryAllByText } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('YAML'))
    const editorDiv = container.querySelector('.editor')
    await waitFor(() => expect(editorDiv).toBeTruthy())

    fireEvent.click(getByText('VISUAL'))
    await waitFor(() => expect(queryAllByText('pipeline.retryPipeline')[0]).toBeInTheDocument())
  })
  test('retry button should be disabled initially', () => {
    const { getByRole } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    const retryButton = getByRole('button', { name: 'pipeline.retryPipeline' })
    expect(retryButton).toBeDisabled()
  })
  test('retry modal closes on click of cancel', async () => {
    const onClose = jest.fn()
    const { container } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} onClose={onClose} />
      </TestWrapper>
    )
    const cancelBtn = await findByText(container, 'cancel')
    fireEvent.click(cancelBtn)
    expect(onClose).toBeCalled()
  })
  test('retry button should be disabled if no stage is selected', async () => {
    const { container, getByRole } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    const retryStageInfo = await findByText(container, 'pipeline.stagetoRetryFrom')
    expect(retryStageInfo).toBeDefined()
    expect(getByRole('button', { name: 'pipeline.retryPipeline' })).toBeDisabled()
  })
  test('retry button should be enabled on stage selection', async () => {
    const { container, getByRole, getByText } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    const retryStageInfo = await findByText(container, 'pipeline.stagetoRetryFrom')
    expect(retryStageInfo).toBeDefined()
    expect(getByRole('button', { name: 'pipeline.retryPipeline' })).toBeDisabled()

    await waitFor(() => expect(container.querySelector('.bp3-popover-target')).toBeTruthy())
    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'selectRetryStage',
        value: 'stage1'
      }
    ])

    await waitFor(() => expect(getByText('stage1')).toBeTruthy())
    fireEvent.click(getByText('stage1'))
    expect(getByRole('button', { name: 'pipeline.retryPipeline' })).not.toBeDisabled()
  })
  test('parallel stage select option should be present', async () => {
    const { container, getByRole, getByText } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    const retryStageInfo = await findByText(container, 'pipeline.stagetoRetryFrom')
    expect(retryStageInfo).toBeDefined()
    expect(getByRole('button', { name: 'pipeline.retryPipeline' })).toBeDisabled()

    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'selectRetryStage',
        value: 'stage3 | stage4'
      }
    ])
    const selectedStage = getByText('stage3 | stage4')

    await waitFor(() => expect(selectedStage).toBeTruthy())
    fireEvent.click(selectedStage)
    expect(getByText('pipeline.runAllParallelstages')).toBeTruthy()
    expect(getByText('pipeline.runFailedStages')).toBeTruthy()
    expect(getByRole('button', { name: 'pipeline.retryPipeline' })).toBeEnabled()
  })

  test('should not allow submit if form is incomplete', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )
    // Navigate to 'Provide Values'
    fireEvent.click(getByText('pipeline.triggers.pipelineInputPanel.provide'))
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Submit the incomplete form
    const runButton = container.querySelector('button[type="submit"]')
    act(() => {
      fireEvent.click(runButton!)
    })

    const buttonShouldBeDisabled = container.querySelector('.bp3-disabled')
    expect(buttonShouldBeDisabled).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('check if save as input set works', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RetryPipeline {...commonProps} />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    fireEvent.click(getByText('pipeline.triggers.pipelineInputPanel.provide'))
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Enter a value for the pipeline variable
    const variableInputElement = container.querySelector('input[name="variables[0].value"]')
    act(() => {
      fireEvent.change(variableInputElement!, { target: { value: 'enteredvalue' } })
    })

    act(() => {
      fireEvent.click(getByText('inputSets.saveAsInputSet'))
    })

    // Check on input set form
    await waitFor(() => expect(queryByText('name')).toBeTruthy())

    // Enter input set name
    const inputSetNameDiv = document.body.querySelector('input[name="name"]')
    fireEvent.change(inputSetNameDiv!, { target: { value: 'inputsetname' } })

    // Hit save
    act(() => {
      fireEvent.click(getByText('save'))
    })

    // Expect the input set save API to be called
    await waitFor(() => expect(mockCreateInputSetResponse.mutate).toBeCalled())
  })
})

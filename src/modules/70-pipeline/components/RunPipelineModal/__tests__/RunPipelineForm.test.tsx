/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { useGetPreflightCheckResponse, startPreflightCheckPromise } from 'services/pipeline-ng'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { GetInputSetsResponse } from '@pipeline/pages/inputSet-list/__tests__/InputSetListMocks'
import { RunPipelineForm } from '../RunPipelineForm'

import {
  mockCreateInputSetResponse,
  mockGetPipeline,
  mockGetResolvedPipeline,
  mockInputSetsList,
  mockMergeInputSetResponse,
  mockPipelineTemplateYaml,
  mockPipelineTemplateYamlErrorResponse,
  mockPipelineTemplateYamlForRerun,
  mockPipelineVariablesResponse,
  mockPostPipelineExecuteYaml,
  mockPreflightCheckResponse,
  mockRePostPipelineExecuteYaml,
  mockStageExecutionList
} from './mocks'

const commonProps: PipelineType<PipelinePathProps & GitQueryParams> = {
  pipelineIdentifier: 'pid',
  projectIdentifier: 'prjid',
  accountId: 'acid',
  orgIdentifier: 'orgId',
  branch: 'br',
  repoIdentifier: 'repoid',
  module: 'ci'
}

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/cd-ng', () => ({
  useGetSourceCodeManagers: () => ({
    data: []
  }),
  useCreatePR: () => ({
    data: [],
    mutate: jest.fn()
  }),
  useGetFileContent: () => ({
    data: [],
    mutate: jest.fn(),
    refetch: jest.fn()
  }),
  useListGitSync: () => ({
    data: [],
    mutate: jest.fn(),
    refetch: jest.fn()
  })
}))
jest.mock('services/pipeline-ng', () => ({
  useCreateInputSetForPipeline: () => mockCreateInputSetResponse,
  useGetTemplateFromPipeline: jest.fn(),
  useGetStagesExecutionList: () => mockStageExecutionList,
  useGetPipeline: () => mockGetPipeline,
  usePostPipelineExecuteWithInputSetYaml: () => mockPostPipelineExecuteYaml,
  useRePostPipelineExecuteWithInputSetYaml: () => mockRePostPipelineExecuteYaml,
  useRerunStagesWithRuntimeInputYaml: () => mockRePostPipelineExecuteYaml,
  useGetInputSetsListForPipeline: () => mockInputSetsList,
  useGetMergeInputSetFromPipelineTemplateWithListInput: () => mockMergeInputSetResponse,
  useCreateVariables: () => mockPipelineVariablesResponse,
  useRunStagesWithRuntimeInputYaml: () => mockPostPipelineExecuteYaml,
  useGetPreflightCheckResponse: jest.fn(),
  startPreflightCheckPromise: jest.fn(),
  getInputSetForPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(GetInputSetsResponse.data))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn(),
  useMutateAsGet: jest.fn()
}))

describe('STUDIO MODE', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '' }))
    // eslint-disable-next-line
    // @ts-ignore

    useMutateAsGet.mockImplementation(props => {
      if (props?.name === 'useGetYamlWithTemplateRefsResolved') {
        return mockGetResolvedPipeline
      } else {
        return mockPipelineTemplateYaml
      }
    })
  })

  test('should toggle visual and yaml mode', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    fireEvent.click(getByText('YAML'))
    const editorDiv = container.querySelector('.editor')
    await waitFor(() => expect(editorDiv).toBeTruthy())

    fireEvent.click(getByText('VISUAL'))
    await waitFor(() =>
      expect(queryByText('pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide')).toBeTruthy()
    )
  })

  test('should display the help text on hover', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    fireEvent.mouseOver(getByText('pipeline.triggers.pipelineInputPanel.whatAreInputsets'))
    await waitFor(() => expect(queryByText('pipeline.inputSets.aboutInputSets')).toBeTruthy())
  })

  test('should not allow submit if form is incomplete', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
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

    // Verify the ErrorStrip is present and submit is disabled
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())
    await waitFor(() => expect(queryByText('common.seeDetails')).toBeTruthy())
    const buttonShouldBeDisabled = container.querySelector('.bp3-disabled')
    expect(buttonShouldBeDisabled).toBeTruthy()
  })

  test('should not allow submit if form is incomplete and enter key pressed', async () => {
    const { container, getByText, queryByText, getByTestId } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )
    // Navigate to 'Provide Values'
    fireEvent.click(getByText('pipeline.triggers.pipelineInputPanel.provide'))
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Submit the incomplete form by pressing enter
    act(() => {
      fireEvent.keyDown(getByTestId('runPipelineVisualView'), { key: 'Enter', code: 'Enter', charCode: 13 })
    })

    // Verify the ErrorStrip is present and submit is disabled
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())
    await waitFor(() => expect(queryByText('common.seeDetails')).toBeTruthy())
    const buttonShouldBeDisabled = container.querySelector('.bp3-disabled')
    expect(buttonShouldBeDisabled).toBeTruthy()
  })

  test('should submit and call the run pipeine method if form is valid', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
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

    // Skip the preflight check
    act(() => {
      fireEvent.click(getByText('pre-flight-check.skipCheckBtn'))
    })

    const runButton = container.querySelector('button[type="submit"]')

    // Form is valid try andsubmit the pipeline
    act(() => {
      fireEvent.click(runButton!)
    })

    await waitFor(() => expect(mockPostPipelineExecuteYaml.mutate).toBeCalled())
  })

  test('if SAVE_AS_INPUT_SET works', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
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

  test('should close the modal on cancel click', async () => {
    const onCloseMocked = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} onClose={onCloseMocked} />
      </TestWrapper>
    )

    fireEvent.click(getByText('cancel'))

    await waitFor(() => expect(onCloseMocked).toBeCalled())
  })

  test('should accept values from input sets and submit the form', async () => {
    const { container, getByText, queryByText, queryAllByTestId } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(queryByText('pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide')).toBeTruthy()
    )

    // Click on the Add input sets button
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(queryByText('is1')).toBeTruthy())

    // input set is invalid should be flagged
    const allinvalidflags = queryAllByTestId('invalid-icon')

    // one for invalid input set and one forinvalid overlay set as per the mocked data
    expect(allinvalidflags.length).toBe(2)

    act(() => {
      fireEvent.mouseOver(allinvalidflags[0])
    })
    // when you hover over the invalid flag show the tooltip content
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())

    // hover over the invalid flagt for overlay
    act(() => {
      fireEvent.mouseOver(allinvalidflags[1])
    })
    // when you hover over the invalid flag show the tooltip content
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())

    // Select the input sets - is2 and then is3
    act(() => {
      fireEvent.click(getByText('is2'))
    })
    act(() => {
      fireEvent.click(getByText('is3'))
    })

    // Apply the input sets
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSets'))
    })

    // Expect the merge APi to be called
    await waitFor(() => expect(mockMergeInputSetResponse.mutate).toBeCalled())

    // Save the snapshot - value is present from merge input set API
    expect(container).toMatchSnapshot('after applying input sets')
  })

  test('invalid input sets should not be applied', async () => {
    const { container, getByText, queryByText, queryAllByTestId } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(queryByText('pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide')).toBeTruthy()
    )

    // Click on the Add input sets button
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(queryByText('is1')).toBeTruthy())

    // input set is invalid should be flagged
    const allinvalidflags = queryAllByTestId('invalid-icon')

    // one for invalid input set and one forinvalid overlay set as per the mocked data
    expect(allinvalidflags.length).toBe(2)

    act(() => {
      fireEvent.mouseOver(allinvalidflags[0])
    })
    // when you hover over the invalid flag show the tooltip content
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())

    // hover over the invalid flagt for overlay
    act(() => {
      fireEvent.mouseOver(allinvalidflags[1])
    })
    // when you hover over the invalid flag show the tooltip content
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())

    // Select the input set is1
    // This(is1) should not be selected as it is invalid
    act(() => {
      fireEvent.click(getByText('is1'))
    })
    // unselect is3
    act(() => {
      fireEvent.click(getByText('is3'))
    })

    // Apply the input set - As only one(is2) is selected because the other(is1) being invalid
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSet'))
    })

    // Expect the merge APi not to be called
    await waitFor(() => expect(mockMergeInputSetResponse.mutate).toBeCalled())

    // Save the snapshot - value is present from merge input set API
    expect(container).toMatchSnapshot()
  })
})

describe('STUDIO MODE - template API error', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '' }))
    // eslint-disable-next-line
    // @ts-ignore

    useMutateAsGet.mockImplementation(props => {
      if (props?.name === 'useGetYamlWithTemplateRefsResolved') {
        return mockGetResolvedPipeline
      } else {
        return mockPipelineTemplateYamlErrorResponse
      }
    })
  })

  test('should display template api error', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('error')).toBeTruthy())
  })
})

describe('RERUN MODE', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '/testExecutionId' }))
    // eslint-disable-next-line
    // @ts-ignore
    useGetPreflightCheckResponse.mockImplementation(() => mockPreflightCheckResponse)
    // eslint-disable-next-line
    // @ts-ignore
    startPreflightCheckPromise.mockResolvedValue({})
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(props => {
      if (props?.name === 'useGetYamlWithTemplateRefsResolved') {
        return mockGetResolvedPipeline
      } else {
        return mockPipelineTemplateYamlForRerun
      }
    })
  })

  test('should should have the values prefilled', async () => {
    const { container, queryByText, queryByDisplayValue } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} inputSetYAML={mockPipelineTemplateYamlForRerun.data?.data?.inputSetYaml} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Check the prefilled value of the variable
    expect(queryByDisplayValue('variablevalue')).toBeTruthy()

    // Submit should call the preflight check API
    const runButton = container.querySelector('button[type="submit"]')
    act(() => {
      fireEvent.click(runButton!)
    })

    // Mocked preflight response is 'SUCCESS', so it will contine to execution and call the rerun API
    // Check if rerun API is called
    await waitFor(() => expect(mockRePostPipelineExecuteYaml.mutate).toBeCalled())
  })
})

describe('EXECUTION VIEW', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '/testExecutionId' }))
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(props => {
      if (props?.name === 'useGetYamlWithTemplateRefsResolved') {
        return mockGetResolvedPipeline
      } else {
        return mockPipelineTemplateYamlForRerun
      }
    })
  })
  test('should should have the values prefilled and fields as disabled', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm
          {...commonProps}
          inputSetYAML={mockPipelineTemplateYamlForRerun.data?.data?.inputSetYaml}
          executionView={true}
          executionInputSetTemplateYaml={mockPipelineTemplateYamlForRerun.data?.data?.inputSetTemplateYaml}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    expect(container).toMatchSnapshot('disabled view in execution inputs')
  })
})

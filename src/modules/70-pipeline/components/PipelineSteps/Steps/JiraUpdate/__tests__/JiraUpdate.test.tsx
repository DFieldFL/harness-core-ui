/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { JiraUpdate } from '../JiraUpdate'
import {
  getJiraUpdateDeploymentModeProps,
  getJiraUpdateEditModeProps,
  getJiraUpdateEditModePropsWithValues,
  getJiraUpdateInputVariableModeProps,
  mockConnectorResponse,
  mockProjectMetadataResponse,
  mockProjectsResponse,
  mockStatusResponse
} from './JiraUpdateTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetJiraProjects: () => mockProjectsResponse,
  useGetJiraIssueCreateMetadata: () => mockProjectMetadataResponse,
  useGetJiraStatuses: () => mockStatusResponse
}))

describe('Jira Update tests', () => {
  beforeEach(() => {
    factory.registerStep(new JiraUpdate())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getJiraUpdateDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getJiraUpdateDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('jira-update-deploymentform')
  })

  test('deploymentform readonly mode', async () => {
    const props = getJiraUpdateDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('jira-update-deploymentform-readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getJiraUpdateDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        template={{ spec: { transitionTo: {} } }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('jira-update-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getJiraUpdateInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        template={{ spec: {} }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('jira-update-input variable view')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraUpdateEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    act(() => ref.current?.submitForm())
    await waitFor(() => expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy())

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira update step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    act(() => ref.current?.submitForm())
    await waitFor(() => expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy())
    await waitFor(() => expect(queryByText('pipeline.jiraApprovalStep.validations.issueKey')).toBeTruthy())
  })

  test('Edit stage - readony view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraUpdateEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )
    expect(container).toMatchSnapshot('editstage-readonly')
  })

  test('Open a saved step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = { ...getJiraUpdateEditModePropsWithValues() }
    const {
      container,
      getByText,
      queryByPlaceholderText,
      queryAllByPlaceholderText,
      queryByDisplayValue,
      queryByText,
      getByTestId
    } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraUpdate}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira update step' } })
    expect(queryByDisplayValue('1d')).toBeTruthy()
    expect(queryByDisplayValue('<+issueKey>')).toBeTruthy()

    fireEvent.click(getByText('common.optionalConfig'))
    expect(queryByDisplayValue('Done')).toBeTruthy()
    expect(queryByDisplayValue('value1')).toBeTruthy()
    expect(queryByDisplayValue('2233')).toBeTruthy()
    expect(queryByDisplayValue('23-march')).toBeTruthy()

    act(() => {
      fireEvent.click(getByText('pipeline.jiraCreateStep.fieldSelectorAdd'))
    })

    await waitFor(() => expect(queryByText('pipeline.jiraCreateStep.selectFieldListHelp')).toBeTruthy())
    const dialogContainer = document.body.querySelector('.bp3-portal')
    const icon = dialogContainer?.querySelectorAll('[icon="chevron-down"]')

    // Project dropdown
    fireEvent.click(icon![0])
    fireEvent.click(getByText('p1'))

    fireEvent.click(icon![1])
    fireEvent.click(getByText('it1'))

    fireEvent.click(getByText('f1'))

    const button = dialogContainer?.querySelector('.bp3-button-text')
    fireEvent.click(button!)

    // The selected field is now added to the main form
    expect(queryByPlaceholderText('f1')).toBeTruthy()

    act(() => {
      fireEvent.click(getByText('pipeline.jiraCreateStep.fieldSelectorAdd'))
    })
    const provideFieldListElement = getByText('pipeline.jiraCreateStep.provideFieldList')
    fireEvent.click(provideFieldListElement)

    const dialogContainerPostUpdate = document.body.querySelector('.bp3-portal')
    act(() => {
      fireEvent.click(getByTestId('add-fieldList'))
    })

    const key0Input = dialogContainerPostUpdate?.querySelector('input[name="fieldList[0].name"]')
    const value0Input = dialogContainerPostUpdate?.querySelector('input[name="fieldList[0].value"]')
    fireEvent.change(key0Input!, { target: { value: 'issueKey1' } })
    fireEvent.change(value0Input!, { target: { value: 'issueKey1Value' } })
    const addButton = dialogContainerPostUpdate?.querySelector('.bp3-button-text')
    fireEvent.click(addButton!)

    expect(queryByDisplayValue('issueKey1')).toBeTruthy()
    expect(queryByDisplayValue('issueKey1Value')).toBeTruthy()
    expect(queryAllByPlaceholderText('f1').length).toBe(1)
    await act(() => ref.current?.submitForm())

    expect(props.onUpdate).toBeCalledWith({
      identifier: 'jira_update_step',
      timeout: '1d',
      type: 'JiraUpdate',
      spec: {
        connectorRef: 'cid1',
        issueKey: '<+issueKey>',
        delegateSelectors: undefined,
        transitionTo: { transitionName: '', status: 'Done' },
        fields: [
          { name: 'f1', value: '' },
          { name: 'f21', value: 'value1' },
          { name: 'f2', value: 2233 },
          { name: 'date', value: '23-march' }
        ]
      },
      name: 'jira update step'
    })
  })
})

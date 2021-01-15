import React from 'react'
import { render, getByText, waitFor, fireEvent } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'

import CIPipelineStudio from '../CIPipelineStudio'
import { PipelineResponse } from './PipelineStudioMocks'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))
jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve({ response: { data: { content: [] } } }))
}))

jest.mock('services/pipeline-ng', () => ({
  getPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(PipelineResponse)),
  putPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

jest.mock('@pipeline/components/RunPipelineModal/RunPipelineForm', () => ({
  // eslint-disable-next-line react/display-name
  RunPipelineForm: ({ onClose }: { onClose: () => void }): JSX.Element => (
    <div>
      Run Pipeline Form <button onClick={onClose}>Close Pipeline Form</button>
    </div>
  )
}))

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

describe('Test Pipeline Studio', () => {
  test('should render default pipeline studio', async () => {
    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: DefaultNewPipelineId,
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText(document.body, 'Welcome to the Pipeline Studio')))
  })
  test('should render edit pipeline studio', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText(container.querySelector('.pipelineNameContainer') as HTMLElement, 'test-p1')).toBeTruthy()
    )
  })
  test('should render edit pipeline studio, run pipeline line, save Pipeline and close studio', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => getByText(container.querySelector('.pipelineNameContainer') as HTMLElement, 'test-p1'))
    const runPipeline = getByTestId('run-pipeline')
    fireEvent.click(runPipeline)
    await waitFor(() => getByText(document.body, 'Run Pipeline Form'))
    const dialog = findDialogContainer()
    expect(dialog).toBeDefined()
    const crossBtn = getByText(dialog as HTMLElement, 'Close Pipeline Form')
    fireEvent.click(crossBtn)
    const saveBtn = getByText(document.body, 'Save and Publish')
    fireEvent.click(saveBtn)
  })
  test('should render new pipeline studio, run pipeline line, save Pipeline and close studio', async () => {
    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: DefaultNewPipelineId,
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => getByText(document.body, 'Welcome to the Pipeline Studio'))
    const dialog = findDialogContainer()
    const input = dialog?.querySelector('[placeholder="Name"]') as HTMLElement
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(getByText(dialog as HTMLElement, 'Start'))
    const saveBtn = getByText(document.body, 'Save and Publish')
    fireEvent.click(saveBtn)
    expect(saveBtn).toBeDefined()
  })

  test('should render and test Trigger, Notifications, Templates and Variables Sections', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => getByText(container.querySelector('.pipelineNameContainer') as HTMLElement, 'test-p1'))
    const notificationsBtn = getByText(container, 'Notifications')
    fireEvent.click(notificationsBtn)
    const varBtn = getByTestId('input-variable')
    fireEvent.click(varBtn)
    expect(getByText(document.body, 'Pipeline Variables')).toBeDefined()
  })
})

import React from 'react'
import { render, getByText, waitFor, fireEvent } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@projects-orgs/pages/projects/__tests__/DefaultAppStoreData'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import CDPipelineStudio from '../CDPipelineStudio'
import { PipelineResponse } from './PipelineStudioMocks'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('services/pipeline-ng', () => ({
  getPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(PipelineResponse)),
  putPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve({ response: { data: { content: [] } } }))
}))

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

describe('Test Pipeline Studio', () => {
  test('should render default pipeline studio', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: DefaultNewPipelineId,
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CDPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => getByText(document.body, 'Welcome to the Pipeline Studio'))
    expect(container).toMatchSnapshot()
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
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CDPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => getByText(container.querySelector('.pipelineNameContainer') as HTMLElement, 'test-p1'))
    expect(container).toMatchSnapshot()
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
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CDPipelineStudio />
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
    const { container, getByTitle } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CDPipelineStudio />
      </TestWrapper>
    )
    await waitFor(() => getByText(container.querySelector('.pipelineNameContainer') as HTMLElement, 'test-p1'))
    const notificationsBtn = getByText(container, 'Notifications')
    fireEvent.click(notificationsBtn)
    const varBtn = getByTitle('Input Variables')
    fireEvent.click(varBtn)
    expect(getByText(document.body, 'Pipeline Variables')).toBeDefined()
    fireEvent.click(document.querySelector('.bp3-overlay-backdrop')!)
    fireEvent.click(varBtn.parentElement?.previousSibling!)
    expect(getByText(document.body, 'Templates')).toBeDefined()
  })
})

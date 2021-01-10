import React from 'react'
import { render, fireEvent, findByText, waitFor, getAllByText } from '@testing-library/react'

import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { KubernetesServiceSpec, K8SDirectServiceStep } from '../K8sServiceSpec'
import PipelineMock from './mock.json'
import TemplateMock from './template.mock.json'
import connectorListJSON from './connectorList.json'
import secretMockdata from './secretMockdata.json'

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: () => Promise.resolve(connectorListJSON),
  useCreateConnector: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        connector: {
          name: 'artifact',
          identifier: 'artifact',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'dummy',
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https;//hub.docker.com',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'testpass', passwordRef: 'account.testpass' }
            }
          }
        },
        createdAt: 1607289652713,
        lastModifiedAt: 1607289652713,
        status: null
      },
      metaData: null,
      correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
    })
  ),
  useUpdateConnector: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        connector: {
          name: 'artifact',
          identifier: 'artifact',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'dummy',
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https;//hub.docker.com',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'testpass', passwordRef: 'account.testpass' }
            }
          }
        },
        createdAt: 1607289652713,
        lastModifiedAt: 1607289652713,
        status: null
      },
      metaData: null,
      correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
    })
  ),
  validateTheIdentifierIsUniquePromise: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: null
    })
  ),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(secretMockdata)),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetConnectorList: jest.fn(() => []),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

const PipelineContextValue = {
  state: PipelineMock.state,
  stepsFactory: PipelineMock.stepsFactory,
  stagesMap: PipelineMock.stagesMap
}
const serviceTabInitialValues = { stageIndex: 0, setupModeType: 'DIFFRENT' }
class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
}

const factory = new StepFactory()
factory.registerStep(new KubernetesServiceSpec())

describe('StepWidget tests', () => {
  test(`renders ServiceStep for Service Tab `, () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          initialValues={serviceTabInitialValues}
          type={StepType.K8sServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`renders ServiceStep for Input sets`, () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          initialValues={
            (PipelineContextValue.state.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec as any) || {}
          }
          template={TemplateMock as any}
          type={StepType.K8sServiceSpec}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`shows deployment type tabs`, async () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          initialValues={serviceTabInitialValues}
          type={StepType.K8sServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )
    const artifacts = await findByText(container, 'Artifacts')
    expect(artifacts).toBeDefined()
    const manifests = await findByText(container, 'Manifests')
    expect(manifests).toBeDefined()
  })

  test(`can switch  deployment type tabs`, async () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          initialValues={serviceTabInitialValues}
          type={StepType.K8sServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )

    const manifests = await findByText(container, 'Manifests')
    expect(manifests).toBeDefined()

    fireEvent.click(manifests)
    expect(manifests.getAttribute('aria-selected')).toEqual('true')
  })

  test(`shows add manifests modal`, async () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/P1/ui/"
        pathParams={{
          identifier: 'dummy',
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy'
        }}
      >
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          initialValues={serviceTabInitialValues}
          type={StepType.K8sServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )
    const manifests = await findByText(container, 'Manifests')
    expect(manifests).toBeDefined()

    fireEvent.click(manifests)
    expect(manifests.getAttribute('aria-selected')).toEqual('true')
    //create manifests
    const addManifestButton = await findByText(container, '+ Add Manifest')
    expect(addManifestButton).toBeDefined()
    fireEvent.click(addManifestButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const k8sButton = await waitFor(() => findByText(portal as HTMLElement, 'K8s Manifest'))
    expect(portal).toMatchSnapshot('Create Manifest modal')
    expect(k8sButton).toBeDefined()
    fireEvent.click(k8sButton)
    await waitFor(() => findByText(portal as HTMLElement, 'GIT Server'))
    const serverInput = await findByText(portal as HTMLElement, 'Select GIT Server')
    fireEvent.click(serverInput)
    await waitFor(() => findByText(document.body, 'Account'))

    const firstAccount = getAllByText(document.body, 'dockerAleks')[0]
    expect(firstAccount).toBeDefined()
    fireEvent.click(firstAccount)
    expect(portal).toMatchSnapshot('Git Server Step')
  })

  test(`shows add artifact modal`, async () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/P1/ui/"
        pathParams={{
          identifier: 'dummy',
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy'
        }}
      >
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          initialValues={serviceTabInitialValues}
          type={StepType.K8sServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )
    //create primary artifact
    const addArtifactButton = await findByText(container, '+ Add Primary Artifact')
    fireEvent.click(addArtifactButton)
    const dockerButton = await findByText(document.body, 'Docker')
    expect(dockerButton).toBeDefined()
    fireEvent.click(dockerButton)
    await waitFor(() => expect(document.querySelector("label[for='connectorId']")).toBeDefined())

    const connectButton = await findByText(document.body, 'Select')
    expect(connectButton).toBeDefined()
    fireEvent.click(connectButton)

    //create new Artifact Server
    const createArtifactButton = await findByText(document.body, 'New Artifact Server')
    fireEvent.click(createArtifactButton)

    const createArtifactModalTitle = await findByText(document.body, 'Overview')
    expect(createArtifactModalTitle).toBeDefined() // Create New Artifact Server Modal Rendered
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    expect(portal).toMatchSnapshot('Artifact Name Step ')
    await act(async () => {
      // enter name and move to next step
      const artifactNameInput = portal.querySelector("input[name='name']")
      expect(artifactNameInput).toBeDefined()
      fireEvent.change(artifactNameInput!, { target: { value: 'artifact' } })
      expect(artifactNameInput).toHaveProperty('value', 'artifact')
      const saveAndContinueButton = document.body.querySelector('button.bp3-button[type=submit]')

      fireEvent.click(saveAndContinueButton as Element)
    })

    await act(async () => {
      //enter auth details
      const dockerRegistryInput = portal.querySelector("input[name='dockerRegistryUrl']")
      expect(dockerRegistryInput).toBeDefined()
      fireEvent.change(dockerRegistryInput!, { target: { value: 'https://hub.docker.com' } })
      expect(dockerRegistryInput).toHaveProperty('value', 'https://hub.docker.com')

      const usernameInput = portal.querySelector("input[name='username']")
      expect(usernameInput).toBeDefined()
      fireEvent.change(usernameInput!, { target: { value: 'test' } })
      expect(usernameInput).toHaveProperty('value', 'test')

      const passwordSelector = await findByText(document.body, 'Create or Select a Secret')
      expect(passwordSelector).toBeDefined()
      fireEvent.click(passwordSelector)
      const selectedSecret = await waitFor(() => findByText(document.body, 'testpass'))
      expect(selectedSecret).toBeDefined()
      fireEvent.click(selectedSecret)
      expect(await findByText(document.body, 'testpass')).toBeDefined()
      const saveAndContinueButton = await findByText(document.body, 'Save and Continue')
      fireEvent.click(saveAndContinueButton)
      expect(document.getElementsByClassName('bp3-dialog')[0]).toMatchSnapshot('Artifact Details Step')
    })
  })
})

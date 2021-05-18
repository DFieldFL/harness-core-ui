import React from 'react'
import { render, findByText, fireEvent, waitFor, findAllByText } from '@testing-library/react'
// import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ArtifactsSelection from '../ArtifactsSelection'
import pipelineContextMock from './pipelineContext.json'
import connectorsData from './connectors_mock.json'
import ArtifactListView from '../ArtifactListView/ArtifactListView'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
const fetchConnectors = () => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),

  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  })
}))

describe('ArtifactsSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test(`renders artifact without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const primaryArtifactContainer = await findByText(container, 'Primary')
    expect(primaryArtifactContainer).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test(`renders artifact with override without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection isForOverrideSets={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('renders artifact with override without crashing')
  })

  test(`renders add Artifact option without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactsSelection isForOverrideSets={false} isForPredefinedSets={false} />
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.artifactList.addSidecar')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const artifacttLabel = await waitFor(() => findByText(portal as HTMLElement, 'connectors.artifactRepoType'))
    expect(artifacttLabel).toBeDefined()

    const closeButton = portal.querySelector("button[class*='bp3-dialog-close-button']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })

  test(`renders Artifact Connector popover`, async () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactsSelection isForOverrideSets={false} isForPredefinedSets={false} />
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.artifactList.addPrimary')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const artifacttLabel = await waitFor(() => findByText(portal as HTMLElement, 'connectors.artifactRepoType'))
    expect(artifacttLabel).toBeDefined()
    const artifactTypes = await waitFor(() => findAllByText(portal as HTMLElement, 'dockerRegistry'))
    expect(artifactTypes).toBeDefined()
    fireEvent.click(artifactTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test(`renders edit modal without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const primaryArtifactContainer = await findByText(container, 'Primary')
    expect(primaryArtifactContainer).toBeDefined()
    const editButton = container.querySelector('span[data-icon="Edit"]')
    expect(editButton).toBeDefined()
    fireEvent.click(editButton as HTMLElement)
    const artifactEditModalTitle = await waitFor(() => findByText(container, 'artifactRepository'))
    expect(artifactEditModalTitle).toBeDefined()

    expect(container).toMatchSnapshot('Edit Modal')
  })

  test(`renders Artifact Listview without crashing`, () => {
    const props = {
      updateStage: jest.fn(),
      primaryArtifact: {
        type: 'DockerRegistry' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0],
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: undefined,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      isReadonly: false
    }

    const { container } = render(
      <TestWrapper>
        <ArtifactListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Artifact Listview with connectors Data`, () => {
    const props = {
      updateStage: jest.fn(),
      primaryArtifact: {
        type: 'Gcr' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0],
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`artifact list renders with proper payload`, async () => {
    const props = {
      updateStage: jest.fn(),
      primaryArtifact: {
        type: 'Ecr' as 'DockerRegistry' | 'Gcr' | 'Ecr',
        spec: {
          connectorRef: 'Test',
          imagePath: '<+input>',
          region: 'us-west-1',
          tag: '<+input>'
        }
      },
      sideCarArtifact: [
        {
          sidecar: {
            type: 'DockerRegistry' as 'DockerRegistry' | 'Gcr' | 'Ecr',
            spec: {
              connectorRef: 'connectorRef',
              imagePath: '<+input>',
              tag: '<+input>'
            }
          }
        }
      ],
      stage: pipelineContextMock.state.pipeline.stages[0],
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      overrideSetIdentifier: '',
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactListView {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const deleteArtifactBtn = container.querySelector('[data-icon="bin-main"]') as Element
    expect(deleteArtifactBtn).toBeDefined()
    fireEvent.click(deleteArtifactBtn)

    expect(container).toMatchSnapshot()
  })

  test(`delete artifact list works correctly`, async () => {
    const props = {
      updateStage: jest.fn(),
      primaryArtifact: {
        type: 'Gcr' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0],
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      overrideSetIdentifier: '',
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactListView {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const deleteArtifactBtn = container.querySelector('[data-icon="bin-main"]') as Element
    expect(deleteArtifactBtn).toBeDefined()
    fireEvent.click(deleteArtifactBtn)

    expect(container).toMatchSnapshot()
  })

  test(`edit artifact list works correctly`, async () => {
    const props = {
      updateStage: jest.fn(),
      primaryArtifact: {
        type: 'Gcr' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0],
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      overrideSetIdentifier: '',
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactListView {...props} />
      </TestWrapper>
    )

    const editArtifactBtn = container.querySelector('[data-icon="Edit"]') as Element
    expect(editArtifactBtn).toBeDefined()
    fireEvent.click(editArtifactBtn)

    expect(container).toMatchSnapshot()
  })
})

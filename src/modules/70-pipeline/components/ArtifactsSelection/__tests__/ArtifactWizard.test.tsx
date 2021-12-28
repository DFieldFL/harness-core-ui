import React from 'react'
import { findAllByText, findByText, fireEvent, render } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import ArtifactWizard from '../ArtifactWizard/ArtifactWizard'
import type { ArtifactType, InitialArtifactDataType, TagTypes } from '../ArtifactInterface'
import { ImagePath } from '../ArtifactRepository/ArtifactLastSteps/ImagePath/ImagePath'
import connectorsData from './connectors_mock.json'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => {
    return {
      data: fetchConnectors,
      refetch: jest.fn()
    }
  }
}))

describe('Artifact WizardStep tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={{} as InitialArtifactDataType}
          types={[]}
          expressions={[]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly with connector Data`, () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={[]}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly with differnet artifact types`, () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'Gcr'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`new connector view works correctly`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    const artifactLabel = await findByText(container, 'connectors.artifactRepository')
    expect(artifactLabel).toBeDefined()
    const DockerArtifactType = await findAllByText(container, 'dockerRegistry')
    expect(DockerArtifactType).toBeDefined()

    const changeText = await findByText(container, 'Change')
    fireEvent.click(changeText)

    const GCRArtifactType = await findByText(container, 'connectors.GCR.name')
    expect(GCRArtifactType).toBeDefined()
    fireEvent.click(GCRArtifactType)

    const continueButton = await findByText(container, 'continue')
    expect(continueButton).toBeDefined()
    fireEvent.click(continueButton)

    const artifactRepoLabel = await findByText(container, 'Docker Registry connector')
    expect(artifactRepoLabel).toBeDefined()
    const newConnectorLabel = await findByText(container, 'newLabel Docker Registry connector')
    expect(newConnectorLabel).toBeDefined()

    fireEvent.click(newConnectorLabel)
    const nextStepButton = await findByText(container, 'continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)

    expect(container).toMatchSnapshot()
  })

  test(`new connector view works correctly in select dialog`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    const artifactLabel = await findByText(container, 'connectors.artifactRepository')
    expect(artifactLabel).toBeDefined()
    const DockerArtifactType = await findAllByText(container, 'dockerRegistry')
    expect(DockerArtifactType).toBeDefined()

    const changeText = await findByText(container, 'Change')
    fireEvent.click(changeText)

    const GCRArtifactType = await findByText(container, 'connectors.GCR.name')
    expect(GCRArtifactType).toBeDefined()
    fireEvent.click(GCRArtifactType)

    const continueButton = await findByText(container, 'continue')
    expect(continueButton).toBeDefined()
    fireEvent.click(continueButton)

    const artifactRepoLabel = await findByText(container, 'Docker Registry connector')
    expect(artifactRepoLabel).toBeDefined()
    expect(container).toMatchSnapshot()

    const newConnectorLabel = await findByText(container, 'select Docker Registry connector')
    expect(newConnectorLabel).toBeDefined()
    fireEvent.click(newConnectorLabel)
    const connectorDialog = findDialogContainer()
    expect(connectorDialog).toBeTruthy()

    if (connectorDialog) {
      const nextStepButton = await findByText(connectorDialog, '+ newLabel Docker Registry connector')
      expect(nextStepButton).toBeDefined()
    }
  })

  test(`last step data without initial values`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const laststepProps = {
      name: 'Artifact Location',
      expressions: [''],
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      context: 1,
      initialValues: {
        identifier: 'id',
        imagePath: '',
        tag: '',
        tagType: 'value' as TagTypes,
        tagRegex: ''
      },
      handleSubmit: jest.fn(),
      artifactIdentifiers: [],
      selectedArtifact: 'DockerRegistry' as ArtifactType
    }

    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
          lastSteps={[<ImagePath {...laststepProps} key={'key'} />]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

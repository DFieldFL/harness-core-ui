import React from 'react'
import { render, findByText, fireEvent, waitFor } from '@testing-library/react'
// import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ArtifactsSelection from '../../ArtifactsSelection'
import pipelineContextMock from './pipelineContext.json'
const getContextValue = (): PipelineContextInterface => {
  return pipelineContextMock as any
}

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
  }),
    test(`renders artifact without crashing`, async () => {
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={getContextValue()}>
            <ArtifactsSelection isForOverrideSets={false} />
          </PipelineContext.Provider>
        </TestWrapper>
      )
      const primaryArtifactContainer = await findByText(container, 'Dockerhub')
      expect(primaryArtifactContainer).toBeDefined()
      expect(container).toMatchSnapshot()
    }),
    test(`renders edit modal without crashing`, async () => {
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={getContextValue()}>
            <ArtifactsSelection isForOverrideSets={false} />
          </PipelineContext.Provider>
        </TestWrapper>
      )
      const primaryArtifactContainer = await findByText(container, 'Dockerhub')
      expect(primaryArtifactContainer).toBeDefined()
      const editButton = container.querySelector('svg[data-icon="edit"]')
      expect(editButton).toBeDefined()
      fireEvent.click(editButton as HTMLElement)
      const artifactEditModalTitle = await waitFor(() => findByText(document.body, 'Artifact Source Configuration'))
      expect(artifactEditModalTitle).toBeDefined()

      expect(container).toMatchSnapshot('Edit Modal')
    })
})

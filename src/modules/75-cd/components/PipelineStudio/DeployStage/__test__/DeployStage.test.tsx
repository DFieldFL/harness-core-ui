/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { IconName } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContextInterface,
  PipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import overridePipelineContext from './overrideSetPipeline.json'
import { DeployStage } from '../DeployStage'

const getOverrideContextValue = (): PipelineContextInterface => {
  return {
    ...overridePipelineContext,
    getStageFromPipeline: jest.fn().mockReturnValue({
      stage: {
        stage: {
          name: 'Stage 3',
          identifier: 's3',
          type: StageType.DEPLOY,
          description: '',
          spec: {}
        }
      }
    }),
    updateStage: jest.fn(),
    updatePipeline: jest.fn()
  } as any
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('Deploy stage test', () => {
  test('Should match snapshot', () => {
    const props = {
      icon: 'cd-main' as IconName,
      hoverIcon: 'deploy-stage' as IconName,
      iconsStyle: { color: 'var(--pipeline-deploy-stage-color)' },
      name: 'pipelineSteps.deploy.create.deployStageName',
      type: StageType.DEPLOY,
      title: 'pipelineSteps.deploy.create.deployStageName',
      description: 'pipeline.pipelineSteps.deployStageDescription',
      isHidden: false,
      isDisabled: false,
      isApproval: false
    }

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployStage minimal={true} {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

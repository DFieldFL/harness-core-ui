import React from 'react'
import type { IconName } from '@blueprintjs/core'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import type { ApprovalStageMinimalModeProps } from '../types'

export const getPropsForMinimalStage = (): PipelineStagesProps<ApprovalStageMinimalModeProps> => ({
  minimal: true,
  stageProps: {
    data: {
      stage: {
        identifier: '',
        name: ''
      }
    },
    onSubmit: jest.fn(),
    onChange: jest.fn()
  },
  children: [
    {
      props: {
        name: '',
        type: 'APPROVAL',
        icon: 'nav-harness',
        isApproval: true,
        isDisabled: false,
        title: 'ApprovalStage',
        description: ''
      },
      type: '',
      key: 'approval'
    }
  ]
})

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<object> {
  protected type = StepType.HarnessApproval
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): object {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<object>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

class StepTwo extends Step<object> {
  protected type = StepType.CustomVariable
  protected stepName = 'stepTwo'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): object {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<object>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())
stepFactory.registerStep(new StepTwo())

const stagesMap = {
  Deployment: {
    name: 'Deploy',
    type: 'Deployment',
    icon: 'pipeline-deploy',
    iconColor: 'var(--pipeline-deploy-stage-color)',
    isApproval: false,
    openExecutionStrategy: true
  },
  ci: {
    name: 'Deploy',
    type: 'ci',
    icon: 'pipeline-build',
    iconColor: 'var(--pipeline-build-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Pipeline: {
    name: 'Deploy',
    type: 'Pipeline',
    icon: 'pipeline',
    iconColor: 'var(--pipeline-blue-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Custom: {
    name: 'Deploy',
    type: 'Custom',
    icon: 'pipeline-custom',
    iconColor: 'var(--pipeline-custom-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Approval: {
    name: 'Deploy',
    type: 'Approval',
    icon: 'pipeline-approval',
    iconColor: 'var(--pipeline-approval-stage-color)',
    isApproval: true,
    openExecutionStrategy: false
  }
}

export const pipelineContextMock = {
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
            spec: {}
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'ApprovalStep' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: stepFactory,
  stagesMap
}

export const pipelineContextMockJiraApproval = {
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
            spec: {}
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'ApprovalStep' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: stepFactory,
  stagesMap
}

export const mockYamlSnippetResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    content: [{ name: 'u1', uuid: 'uv1' }],
    metaData: (null as unknown) as undefined,
    correlationId: 'someId'
  }
}

export const getDummyPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn(),
    setSelectedTabId: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

export const getDummyPipelineContextValueJiraApproval = (): PipelineContextInterface => {
  return {
    ...pipelineContextMockJiraApproval,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn(),
    setSelectedTabId: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMockJiraApproval.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

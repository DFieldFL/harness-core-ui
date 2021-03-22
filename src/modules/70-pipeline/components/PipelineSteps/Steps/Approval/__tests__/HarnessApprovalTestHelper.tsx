import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export const getHarnessApprovalEditModeProps = () => ({
  initialValues: {
    timeout: '5s',
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: '',
      approverInputs: '',
      approvers: {
        userGroups: [],
        users: [],
        minimumCount: '',
        disallowPipelineExecutor: ''
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalDeploymentModeProps = () => ({
  initialValues: {
    spec: {
      approvalMessage: RUNTIME_INPUT_VALUE,
      includePipelineExecutionHistory: RUNTIME_INPUT_VALUE,
      approverInputs: RUNTIME_INPUT_VALUE,
      approvers: {
        userGroups: [],
        users: [],
        minimumCount: RUNTIME_INPUT_VALUE,
        disallowPipelineExecutor: RUNTIME_INPUT_VALUE
      }
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      spec: {
        approvalMessage: RUNTIME_INPUT_VALUE,
        includePipelineExecutionHistory: RUNTIME_INPUT_VALUE,
        approverInputs: RUNTIME_INPUT_VALUE,
        approvers: {
          userGroups: RUNTIME_INPUT_VALUE,
          users: RUNTIME_INPUT_VALUE,
          minimumCount: RUNTIME_INPUT_VALUE,
          disallowPipelineExecutor: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.name',
          localName: 'step.approval.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.timeout',
          localName: 'step.approval.timeout'
        }
      },
      'step-approvalMessage': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvalMessage',
          localName: 'step.approval.spec.approvalMessage'
        }
      },
      'step-includePipelineExecutionHistory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.includePipelineExecutionHistory',
          localName: 'step.approval.spec.includePipelineExecutionHistory'
        }
      },
      'step-approverusers': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.users',
          localName: 'step.approval.spec.approvers.users'
        }
      },
      'step-approvergroups': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.userGroups',
          localName: 'step.approval.spec.approvers.userGroups'
        }
      },
      'step-minimumCount': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.minimumCount',
          localName: 'step.approval.spec.approvers.minimumCount'
        }
      },
      'step-disallowPipelineExecutor': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.disallowPipelineExecutor',
          localName: 'step.approval.spec.disallowPipelineExecutor'
        }
      },
      'step-approverInputs': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approverInputs',
          localName: 'step.approval.spec.approverInputs'
        }
      }
    },
    variablesData: {
      type: StepType.HarnessApproval,
      identifier: 'harness_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        approvalMessage: 'step-approvalMessage',
        includePipelineExecutionHistory: 'step-includePipelineExecutionHistory',
        approvers: {
          users: 'step-approverusers',
          userGroups: 'step-approvergroups',
          minimumCount: 'step-minimumCount'
        },
        disallowPipelineExecutor: 'step-disallowPipelineExecutor',
        approverInputs: 'step-approverInputs'
      }
    }
  },
  onUpdate: jest.fn()
})

export const mockUsersResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    content: [{ name: 'u1', uuid: 'uv1' }],
    metaData: (null as unknown) as undefined,
    correlationId: 'someId'
  }
}

export const mockUserGroupsResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    content: [{ name: 'ug1', identifier: 'ugv1' }],
    metaData: (null as unknown) as undefined,
    correlationId: 'someId'
  }
}

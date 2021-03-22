import React from 'react'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import type { ApprovalStageExecutionProps } from './types'

export const ApprovalStageExecution: React.FC<ApprovalStageExecutionProps> = () => {
  const {
    state: {
      pipeline,
      pipelineView: {
        splitViewData: { selectedStageId = '' }
      },
      pipelineView
    },
    stepsFactory,
    updatePipeline,
    updatePipelineView,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  return (
    <ExecutionGraph
      allowAddGroup={true}
      hasDependencies={false}
      stepsFactory={stepsFactory}
      ref={executionRef}
      hasRollback={false}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stage={selectedStage!}
      updateStage={() => {
        updatePipeline(pipeline)
      }}
      onAddStep={(event: ExecutionGraphAddStepEvent) => {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: DrawerTypes.AddStep,
            data: {
              paletteData: {
                entity: event.entity,
                onUpdate: executionRef.current?.stepGroupUpdated,
                isRollback: false,
                isParallelNodeClicked: event.isParallel,
                hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
              }
            }
          }
        })
      }}
      onEditStep={(event: ExecutionGraphEditStepEvent) => {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: DrawerTypes.StepConfig,
            data: {
              stepConfig: {
                node: event.node,
                onUpdate: executionRef.current?.stepGroupUpdated,
                isStepGroup: event.isStepGroup,
                isUnderStepGroup: event.isUnderStepGroup,
                addOrEdit: event.addOrEdit,
                hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
              }
            }
          }
        })
      }}
    />
  )
}

import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { PipelineStages, PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { StageType } from '@pipeline/utils/stageHelpers'

export const getCFPipelineStages: (
  args: Omit<PipelineStagesProps, 'children'>,
  getString: UseStringsReturn['getString'],
  isCIEnabled?: boolean,
  isCDEnabled?: boolean,
  isCFEnabled?: boolean,
  isApprovalStageEnabled?: boolean
) => React.ReactElement<PipelineStagesProps> = (
  args,
  getString,
  isCIEnabled = false,
  isCDEnabled = false,
  isCFEnabled = false,
  isApprovalStageEnabled = false
) => {
  return (
    <PipelineStages {...args}>
      {stagesCollection.getStage(StageType.FEATURE, isCFEnabled, getString)}
      {stagesCollection.getStage(StageType.DEPLOY, isCDEnabled, getString)}
      {stagesCollection.getStage(StageType.BUILD, isCIEnabled, getString)}
      {stagesCollection.getStage(StageType.PIPELINE, false, getString)}
      {stagesCollection.getStage(StageType.APPROVAL, isApprovalStageEnabled, getString)}
      {stagesCollection.getStage(StageType.CUSTOM, false, getString)}
    </PipelineStages>
  )
}

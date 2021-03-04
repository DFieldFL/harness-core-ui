import React from 'react'
import type { UseStringsReturn } from 'framework/exports'
import { StageTypes } from '@pipeline/components/PipelineStudio/Stages/StageTypes'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DeployStage } from './DeployStage'

const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('pipelineSteps.deploy.create.deployStageName'),
  type: StageTypes.DEPLOY,
  icon: 'cd-main',
  iconColor: 'var(--pipeline-deploy-stage-color)',
  isApproval: false,
  openExecutionStrategy: true
})

const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']) => (
  <DeployStage
    icon={'cd-main'}
    iconsStyle={{ color: 'var(--pipeline-deploy-stage-color)' }}
    name={getString('pipelineSteps.deploy.create.deployStageName')}
    type={StageTypes.DEPLOY}
    title={getString('pipelineSteps.deploy.create.deployStageName')}
    description={getString('pipelineSteps.deploy.create.deployStageDescription')}
    isHidden={!isEnabled}
    isDisabled={false}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageTypes.DEPLOY, getStageAttributes, getStageEditorImplementation)

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { PipelineProvider, PipelineStudio } from '@pipeline/exports'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useAppStore, useStrings } from 'framework/exports'
import { getCFPipelineStages } from '../../components/PipelineStudio/CFPipelineStagesUtils'
import css from './CFPipelineStudio.module.scss'

const CIPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const history = useHistory()
  const handleRunPipeline = (): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })
    )
  }
  return (
    <PipelineProvider
      stagesMap={stagesCollection.getAllStagesAttributes(getString)}
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={args =>
        getCFPipelineStages(
          args,
          getString,
          selectedProject?.modules && selectedProject.modules.indexOf?.('CI') > -1,
          selectedProject?.modules && selectedProject.modules.indexOf?.('CD') > -1,
          true
        )
      }
      stepsFactory={factory}
      runPipeline={handleRunPipeline}
    >
      <PipelineStudio
        className={css.container}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineProject={routes.toDeployments}
        routePipelineList={routes.toPipelines}
      ></PipelineStudio>
    </PipelineProvider>
  )
}

export default CIPipelineStudio

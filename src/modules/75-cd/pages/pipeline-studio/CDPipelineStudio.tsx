import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getCDPipelineStages, stagesMap } from '@cd/components/CDPipelineStages/CDPipelineStages'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { PipelineProvider, PipelineStudio } from '@pipeline/exports'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './CDPipelineStudio.module.scss'

const CDPipelineStudio: React.FC = ({ children }): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()

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
      stagesMap={stagesMap}
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={getCDPipelineStages}
      stepsFactory={factory}
      runPipeline={handleRunPipeline}
    >
      <PipelineStudio
        className={css.container}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineStudioUI={routes.toPipelineStudioUI}
        routePipelineStudioYaml={routes.toPipelineStudioYaml}
        routePipelineProject={routes.toDeployments}
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineList={routes.toPipelines}
      >
        {children}
      </PipelineStudio>
    </PipelineProvider>
  )
}

export default CDPipelineStudio

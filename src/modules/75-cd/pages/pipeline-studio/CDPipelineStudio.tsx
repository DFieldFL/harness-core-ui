import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import routes from '@common/RouteDefinitions'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { getCDPipelineStages } from '@cd/components/PipelineStudio/CDPipelineStagesUtils'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudio } from '@pipeline/components/PipelineStudio/PipelineStudio'
import { useQueryParams } from '@common/hooks'
import css from './CDPipelineStudio.module.scss'

const CDPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()

  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()

  const history = useHistory()
  const handleRunPipeline = (): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier
      })
    )
  }
  const { selectedProject } = useAppStore()
  const { getString } = useStrings()
  const isApprovalStageEnabled = useFeatureFlag('NG_HARNESS_APPROVAL')
  return (
    <PipelineProvider
      stagesMap={stagesCollection.getAllStagesAttributes(getString)}
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={args =>
        getCDPipelineStages(
          args,
          getString,
          selectedProject?.modules && selectedProject.modules.indexOf?.('CI') > -1,
          true,
          selectedProject?.modules && selectedProject.modules.indexOf?.('CF') > -1,
          isApprovalStageEnabled
        )
      }
      stepsFactory={factory}
      runPipeline={handleRunPipeline}
    >
      <PipelineStudio
        className={css.container}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineProject={routes.toDeployments}
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineList={routes.toPipelines}
      />
    </PipelineProvider>
  )
}

export default CDPipelineStudio

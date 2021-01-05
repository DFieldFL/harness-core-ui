import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { getCDPipelineStages, stagesMap } from '@cd/components/CDPipelineStages/CDPipelineStages'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { DefaultNewPipelineId, PipelineProvider, PipelineStudio } from '@pipeline/exports'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './CIPipelineStudio.module.scss'

export const runPipelineDialogProps: Omit<IDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  style: { minWidth: 700, minHeight: 210 }
}

const CIPipelineStudio: React.FC = ({ children }): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const [isRunPipelineOpen, setRunPipelineOpen] = React.useState(true)

  const [openModel, hideModel] = useModalHook(
    () => (
      <Dialog isOpen={isRunPipelineOpen} {...runPipelineDialogProps}>
        <RunPipelineForm
          pipelineIdentifier={pipelineIdentifier}
          onClose={closeModel}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          accountId={accountId}
          module={module}
        />
      </Dialog>
    ),
    [pipelineIdentifier, projectIdentifier, accountId, orgIdentifier]
  )

  const closeModel = React.useCallback(() => {
    setRunPipelineOpen(false)
    hideModel()
  }, [hideModel])

  const handleRunPipeline = React.useCallback(async () => {
    openModel()
  }, [openModel])

  const history = useHistory()
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
        onClose={() => {
          if (pipelineIdentifier !== DefaultNewPipelineId) {
            history.push(
              routes.toCIPipelineDeploymentList({
                projectIdentifier,
                orgIdentifier,
                pipelineIdentifier,
                accountId
              })
            )
          } else {
            history.push(
              routes.toPipelines({
                projectIdentifier,
                orgIdentifier,
                accountId,
                module
              })
            )
          }
        }}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineStudioUI={routes.toPipelineStudioUI}
        routePipelineStudioYaml={routes.toPipelineStudioYaml}
        routePipelineDetail={routes.toPipelineStudio}
        routePipelineProject={routes.toCIBuilds}
        routePipelineList={routes.toPipelines}
      >
        {children}
      </PipelineStudio>
    </PipelineProvider>
  )
}

export default CIPipelineStudio

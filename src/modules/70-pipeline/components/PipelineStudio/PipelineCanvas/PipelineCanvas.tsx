import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { Button, useModalHook, Tag, Text } from '@wings-software/uicore'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { isEqual } from 'lodash-es'
import type { NgPipeline, Failure } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/components/Toaster/useToaster'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { accountPathProps, pipelinePathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  PipelineStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { RunPipelineModal } from '@pipeline/components/RunPipelineModal/RunPipelineModal'
import { PipelineContext, savePipeline } from '../PipelineContext/PipelineContext'
import CreatePipelines from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import PipelineYamlView from '../PipelineYamlView/PipelineYamlView'
import StageBuilder from '../StageBuilder/StageBuilder'
import css from './PipelineCanvas.module.scss'

export interface PipelineCanvasProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps & PipelineStudioQueryParams>>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({ toPipelineList, toPipelineStudio }): JSX.Element => {
  const { state, updatePipeline, deletePipelineCache, fetchPipeline } = React.useContext(PipelineContext)

  const { pipeline, isUpdated, isLoading, isInitialized, originalPipeline, yamlHandler, isBEPipelineUpdated } = state
  // const { stage: selectedStage } = getStageFromPipeline(pipeline, selectedStageId || '')

  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { showSuccess, showError } = useToaster()

  const [discardBEUpdateDialog, setDiscardBEUpdate] = React.useState(false)
  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipelines-studio.pipelineUpdatedError'),
    titleText: getString('pipelines-studio.pipelineUpdated'),
    confirmButtonText: getString('update'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        fetchPipeline(true, true)
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const history = useHistory()
  const { view = 'ui' } = useQueryParams<PipelineStudioQueryParams>()
  const isYaml = view === 'yaml'
  const [isYamlError, setYamlError] = React.useState(false)

  const saveAndPublish = React.useCallback(async () => {
    let response: Failure | undefined
    let latestPipeline: NgPipeline = pipeline
    if (isYaml && yamlHandler) {
      latestPipeline = parse(yamlHandler.getLatestYaml()).pipeline as NgPipeline
      response = await savePipeline(
        { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
        latestPipeline,
        pipelineIdentifier !== DefaultNewPipelineId
      )
    } else {
      response = await savePipeline(
        { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
        latestPipeline,
        pipelineIdentifier !== DefaultNewPipelineId
      )
    }

    const newPipelineId = latestPipeline.identifier

    if (response && response.status === 'SUCCESS') {
      if (pipelineIdentifier === DefaultNewPipelineId) {
        await deletePipelineCache()

        showSuccess(getString('pipelines-studio.publishPipeline'))

        if (isYaml) {
          history.replace(
            toPipelineStudio({
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier: newPipelineId,
              accountId,
              module,
              view: 'yaml'
            })
          )
        } else {
          history.replace(
            toPipelineStudio({ projectIdentifier, orgIdentifier, pipelineIdentifier: newPipelineId, accountId, module })
          )
        }
        // note: without setTimeout does not redirect properly after save
        setTimeout(() => location.reload(), 250)
      } else {
        fetchPipeline(true, true)
      }
    } else {
      showError(response?.message || getString('errorWhileSaving'))
    }
  }, [
    deletePipelineCache,
    accountId,
    history,
    toPipelineStudio,
    projectIdentifier,
    orgIdentifier,
    pipeline,
    fetchPipeline,
    showError,
    pipelineIdentifier,
    isYaml,
    yamlHandler
  ])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} className={cx(css.dialog, Classes.DIALOG)}>
        <CreatePipelines afterSave={onSubmit} initialValues={pipeline} closeModal={onCloseCreate} />
      </Dialog>
    ),
    [pipeline.identifier, pipeline]
  )

  React.useEffect(() => {
    if (isInitialized) {
      if (pipeline.identifier === DefaultNewPipelineId) {
        showModal()
      }
      if (isBEPipelineUpdated && !discardBEUpdateDialog) {
        openConfirmBEUpdateError()
      }
    }
  }, [
    pipeline.identifier,
    showModal,
    isInitialized,
    isBEPipelineUpdated,
    openConfirmBEUpdateError,
    discardBEUpdateDialog
  ])

  const onCloseCreate = React.useCallback(() => {
    if (pipeline.identifier === DefaultNewPipelineId) {
      history.push(toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }))
    }
    hideModal()
  }, [accountId, hideModal, history, module, orgIdentifier, pipeline.identifier, projectIdentifier, toPipelineList])

  const onSubmit = React.useCallback(
    (data: NgPipeline) => {
      pipeline.name = data.name
      pipeline.description = data.description
      pipeline.identifier = data.identifier
      pipeline.tags = data.tags ?? {}
      updatePipeline(pipeline)
      hideModal()
    },
    [hideModal, pipeline, updatePipeline]
  )

  if (isLoading) {
    return (
      <React.Fragment>
        <PageSpinner fixed />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
  }

  return (
    <div
      className={cx(Classes.POPOVER_DISMISS, css.content)}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <NavigationCheck
        when={true}
        shouldBlockNavigation={nextLocation => {
          const matchDefault = matchPath(nextLocation.pathname, {
            path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
            exact: true
          })
          let localUpdated = isUpdated
          if (isYaml && yamlHandler) {
            try {
              const parsedYaml = parse(yamlHandler.getLatestYaml())
              if (!parsedYaml) {
                showError(getString('invalidYamlText'))
                return true
              }
              // TODO: only apply for CI as its schema is implemented
              if (module === 'ci') {
                if (yamlHandler.getYAMLValidationErrorMap().size > 0) {
                  setYamlError(true)
                  return true
                }
              }
              localUpdated = !isEqual(originalPipeline, parsedYaml.pipeline)
              updatePipeline(parsedYaml.pipeline)
            } catch (e) {
              setYamlError(true)
              return true
            }
          }
          setYamlError(false)
          return !matchDefault?.isExact && localUpdated
        }}
        textProps={{
          contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
          titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle')
        }}
        navigate={newPath => {
          const isPipeline = matchPath(newPath, {
            path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
            exact: true
          })
          !isPipeline?.isExact && deletePipelineCache()
          history.push(newPath)
        }}
      />
      <div>
        <div className={css.titleBar}>
          <div className={css.breadcrumbsMenu}>
            <div className={css.pipelineNameContainer}>
              <div>
                <Text className={css.pipelineName}>{pipeline?.name}</Text>
                <Button minimal icon="Edit" iconProps={{ size: 12 }} onClick={showModal} />
              </div>
            </div>
          </div>

          <div className={css.pipelineStudioTitleContainer}>
            <div className={css.optionBtns}>
              <div
                className={cx(css.item, { [css.selected]: !isYaml })}
                onClick={() =>
                  history.replace(
                    toPipelineStudio({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })
                  )
                }
              >
                {getString('visual')}
              </div>
              <div
                className={cx(css.item, { [css.selected]: isYaml })}
                onClick={() =>
                  history.replace(
                    toPipelineStudio({
                      orgIdentifier,
                      projectIdentifier,
                      pipelineIdentifier,
                      accountId,
                      module,
                      view: 'yaml'
                    })
                  )
                }
              >
                {getString('yaml')}
              </div>
            </div>
          </div>
          <div>
            <div className={css.savePublishContainer}>
              {isUpdated && (
                <Tag intent="primary" className={css.tagRender} minimal>
                  {getString('unsavedChanges')}
                </Tag>
              )}
              <div>
                <Button
                  minimal
                  intent="primary"
                  text={getString('save')}
                  onClick={saveAndPublish}
                  className={css.savePublishBtn}
                />
                <RunPipelineModal pipelineIdentifier={pipeline.identifier || /* istanbul ignore next */ ''}>
                  <Button
                    data-testid="card-run-pipeline"
                    intent="primary"
                    icon="run-pipeline"
                    disabled={isUpdated}
                    className={css.runPipelineBtn}
                    text={getString('runPipelineText')}
                  />
                </RunPipelineModal>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isYaml ? <PipelineYamlView /> : <StageBuilder />}
      <RightDrawer />
    </div>
  )
}

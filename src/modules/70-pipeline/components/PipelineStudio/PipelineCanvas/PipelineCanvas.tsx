/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Classes, Dialog, IDialogProps, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import {
  useModalHook,
  Text,
  Icon,
  Layout,
  Button,
  SelectOption,
  Container,
  ButtonVariation,
  useToaster,
  PageSpinner,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  useConfirmationDialog
} from '@wings-software/uicore'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { get, isEmpty, isEqual, merge, omit, set } from 'lodash-es'
import produce from 'immer'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import { accountPathProps, pipelinePathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  GitQueryParams,
  PipelineStudioQueryParams,
  RunPipelineQueryParams
} from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import routes from '@common/RouteDefinitions'
import {
  EntityGitDetails,
  GovernanceMetadata,
  useGetTemplateFromPipeline,
  InputSetSummaryResponse,
  useGetInputsetYaml
} from 'services/pipeline-ng'
import { useGlobalEventListener, useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { TagsPopover } from '@common/components'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { validateJSONWithSchema } from '@common/utils/YamlUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PipelineActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import { PipelineFeatureLimitBreachedBanner } from '@pipeline/factories/PipelineFeatureRestrictionFactory/PipelineFeatureRestrictionFactory'
import { EvaluationModal } from '@governance/EvaluationModal'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { getStepFromStage, validateCICodebaseConfiguration } from '@pipeline/components/PipelineStudio/StepUtil'
import { updateStepWithinStage } from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { savePipeline, usePipelineContext } from '../PipelineContext/PipelineContext'
import CreatePipelines from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId, DrawerTypes } from '../PipelineContext/PipelineActions'
import PipelineYamlView from '../PipelineYamlView/PipelineYamlView'
import { RightBar } from '../RightBar/RightBar'
import StageBuilder from '../StageBuilder/StageBuilder'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'
import StudioGitPopover from '../StudioGitPopover'
import css from './PipelineCanvas.module.scss'

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}

interface SavePipelineObj {
  pipeline: PipelineInfoConfig
}

interface PipelineWithGitContextFormProps extends PipelineInfoConfig {
  repo?: string
  branch?: string
}

interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

const runModalProps: IDialogProps = {
  isOpen: true,
  // usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: false,
  enforceFocus: false,
  className: css.runPipelineDialog,
  style: { width: 872, height: 'fit-content', overflow: 'auto' },
  isCloseButtonShown: false
}

export interface PipelineCanvasProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
  getOtherModal?: (
    onSubmit: (values: PipelineInfoConfig, gitDetails?: EntityGitDetails) => void,
    onClose: () => void
  ) => React.ReactElement<OtherModalProps>
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  toPipelineList,
  toPipelineStudio,
  getOtherModal
}): JSX.Element => {
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const {
    state,
    state: {
      selectionState: { selectedStageId },
      templateTypes,
      pipelineView: { drawerData }
    },
    updatePipeline,
    updateGitDetails,
    deletePipelineCache,
    fetchPipeline,
    view,
    setSchemaErrorView,
    setView,
    isReadonly,
    updateStage,
    updatePipelineView,
    setSelectedStageId,
    setSelectedSectionId,
    getStageFromPipeline,
    setTemplateTypes
  } = usePipelineContext()
  const {
    repoIdentifier,
    branch,
    runPipeline,
    executionId,
    inputSetType,
    inputSetValue,
    inputSetLabel,
    inputSetRepoIdentifier,
    inputSetBranch,
    stagesExecuted
  } = useQueryParams<GitQueryParams & RunPipelineQueryParams>()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<PipelineStudioQueryParams>()
  const { trackEvent } = useTelemetry()

  const {
    pipeline,
    isUpdated,
    pipelineView: { isYamlEditable },
    pipelineView,
    isLoading,
    isInitialized,
    originalPipeline,
    yamlHandler,
    isBEPipelineUpdated,
    gitDetails,
    entityValidityDetails
  } = state

  const { getString } = useStrings()
  const { pipelineSchema } = usePipelineSchema()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }> &
      GitQueryParams
  >()

  const { data: template } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    body: {}
  })

  const { showSuccess, showError, clear } = useToaster()

  useDocumentTitle([parse(pipeline?.name || getString('pipelines'))])

  const [discardBEUpdateDialog, setDiscardBEUpdate] = React.useState(false)
  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipelines-studio.pipelineUpdatedError'),
    titleText: getString('pipelines-studio.pipelineUpdated'),
    confirmButtonText: getString('update'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        fetchPipeline({ forceFetch: true, forceUpdate: true })
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const history = useHistory()
  const isYaml = view === SelectedView.YAML
  const [isYamlError, setYamlError] = React.useState(false)
  const [blockNavigation, setBlockNavigation] = React.useState(false)
  const [selectedBranch, setSelectedBranch] = React.useState(branch || '')
  const [savedTemplate, setSavedTemplate] = React.useState<TemplateSummaryResponse>()
  const [disableVisualView, setDisableVisualView] = React.useState(entityValidityDetails.valid === false)
  const { OPA_PIPELINE_GOVERNANCE } = useFeatureFlags()
  const [governanceMetadata, setGovernanceMetadata] = useState<GovernanceMetadata>()
  const shouldShowGovernanceEvaluation =
    OPA_PIPELINE_GOVERNANCE && (governanceMetadata?.status === 'error' || governanceMetadata?.status === 'warning')

  const { openDialog: openUnsavedChangesDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
    titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deletePipelineCache(gitDetails).then(() => {
          history.push(
            routes.toPipelineStudio({
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier: pipeline?.identifier || '-1',
              accountId,
              module,
              branch: selectedBranch,
              repoIdentifier: repoIdentifier
            })
          )
          location.reload()
        })
      } else {
        setSelectedBranch(branch || '')
      }
      setBlockNavigation(false)
    }
  })

  const isValidYaml = function (): boolean {
    if (yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        if (!parsedYaml) {
          clear()
          showError(getString('invalidYamlText'))
          return false
        }
        if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          clear()
          setYamlError(true)
          showError(getString('invalidYamlText'))
          return false
        }
        updatePipeline(parsedYaml.pipeline)
      } catch (e) {
        clear()
        setYamlError(true)
        showError(e.message || getString('invalidYamlText'))
        return false
      }
    }
    return true
  }

  const navigateToLocation = (newPipelineId: string, updatedGitDetails?: SaveToGitFormInterface): void => {
    history.replace(
      toPipelineStudio({
        projectIdentifier,
        orgIdentifier,
        pipelineIdentifier: newPipelineId,
        accountId,
        module,
        repoIdentifier: updatedGitDetails?.repoIdentifier,
        branch: updatedGitDetails?.branch
      })
    )
  }

  useGlobalEventListener('TEMPLATE_SAVED', event => {
    const { detail: newTemplate } = event
    if (newTemplate) {
      setSavedTemplate(newTemplate)
      window.requestAnimationFrame(() => {
        openUseTemplateDialog()
      })
    }
  })

  const { openDialog: openUseTemplateDialog } = useConfirmationDialog({
    intent: Intent.WARNING,
    cancelButtonText: getString('no'),
    contentText: getString('pipeline.changeTemplate', {
      name: savedTemplate?.name,
      entity: savedTemplate?.templateEntityType?.toLowerCase()
    }),
    titleText: `Use Template ${savedTemplate?.name}?`,
    confirmButtonText: getString('yes'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        onUseTemplateConfirm()
      }
    }
  })

  const onUseTemplateConfirm = async () => {
    if (selectedStageId) {
      const { stage: selectedStage } = getStageFromPipeline(selectedStageId)
      if (savedTemplate?.templateEntityType === 'Stage') {
        if (selectedStage?.stage) {
          const processNode = createTemplate(selectedStage.stage, savedTemplate)
          await updateStage(processNode)
        }
      } else if (savedTemplate?.templateEntityType === 'Step') {
        const selectedStepId = drawerData.data?.stepConfig?.node.identifier
        if (selectedStepId) {
          const selectedStep = getStepFromStage(selectedStepId, selectedStage?.stage?.spec?.execution?.steps)
          if (selectedStep?.step) {
            const processNode = createTemplate(selectedStep?.step, savedTemplate)
            const newPipelineView = produce(pipelineView, draft => {
              set(draft, 'drawerData.data.stepConfig.node', processNode)
            })
            updatePipelineView(newPipelineView)
            const stageData = produce(selectedStage, draft => {
              if (draft?.stage?.spec?.execution) {
                updateStepWithinStage(draft.stage.spec.execution, selectedStepId, processNode as any)
              }
            })
            if (stageData?.stage) {
              await updateStage(stageData.stage)
            }
            drawerData.data?.stepConfig?.onUpdate?.(processNode)
          }
        }
      }
      if (savedTemplate?.identifier && savedTemplate?.childType) {
        templateTypes[savedTemplate.identifier] = savedTemplate.childType
        setTemplateTypes(templateTypes)
      }
    }
  }

  const saveAndPublishPipeline = async (
    latestPipeline: PipelineInfoConfig,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string }
  ): Promise<UseSaveSuccessResponse> => {
    setSchemaErrorView(false)
    const isEdit = pipelineIdentifier !== DefaultNewPipelineId
    const response = await savePipeline(
      {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        ...(updatedGitDetails ?? {}),
        ...(lastObject ?? {}),
        ...(updatedGitDetails && updatedGitDetails.isNewBranch ? { baseBranch: branch } : {})
      },
      omit(latestPipeline, 'repo', 'branch'),
      isEdit,
      !!OPA_PIPELINE_GOVERNANCE
    )
    const newPipelineId = latestPipeline?.identifier

    if (response && response.status === 'SUCCESS') {
      setGovernanceMetadata(get(response, 'data.governanceMetadata'))
      if (pipelineIdentifier === DefaultNewPipelineId) {
        await deletePipelineCache(gitDetails)

        showSuccess(getString('pipelines-studio.publishPipeline'))

        navigateToLocation(newPipelineId, updatedGitDetails)
        // note: without setTimeout does not redirect properly after save
        await fetchPipeline({ forceFetch: true, forceUpdate: true, newPipelineId })
      } else {
        await fetchPipeline({ forceFetch: true, forceUpdate: true })
      }
      if (updatedGitDetails?.isNewBranch) {
        navigateToLocation(newPipelineId, updatedGitDetails)
        location.reload()
      }
      if (isEdit) {
        trackEvent(isYaml ? PipelineActions.PipelineUpdatedViaYAML : PipelineActions.PipelineUpdatedViaVisual, {})
      } else {
        trackEvent(isYaml ? PipelineActions.PipelineCreatedViaYAML : PipelineActions.PipelineCreatedViaVisual, {})
      }
    } else {
      clear()
      setSchemaErrorView(true)
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(response?.message || getString('errorWhileSaving'), undefined, 'pipeline.save.pipeline.error')
      }
      throw response
    }
    return { status: response?.status }
  }

  const saveAngPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface,
    payload?: SavePipelineObj,
    objectId?: string
  ): Promise<UseSaveSuccessResponse> => {
    let latestPipeline: PipelineInfoConfig = payload?.pipeline || pipeline

    if (isYaml && yamlHandler) {
      try {
        latestPipeline = payload?.pipeline || (parse(yamlHandler.getLatestYaml()).pipeline as PipelineInfoConfig)
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.gitinfo.error')
      }
    }

    const response = await saveAndPublishPipeline(
      latestPipeline,
      omit(updatedGitDetails, 'name', 'identifier'),
      pipelineIdentifier !== DefaultNewPipelineId ? { lastObjectId: objectId } : {}
    )

    return {
      status: response?.status
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SavePipelineObj>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SavePipelineObj,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      saveAngPublishWithGitInfo(gitData, payload, objectId || gitDetails?.objectId || '')
  })

  const saveAndPublish = React.useCallback(async () => {
    window.dispatchEvent(new CustomEvent('SAVE_PIPELINE_CLICKED'))

    let latestPipeline: PipelineInfoConfig = pipeline

    if (isYaml && yamlHandler) {
      if (!parse(yamlHandler.getLatestYaml())) {
        clear()
        showError(getString('invalidYamlText'))
        return
      }
      try {
        latestPipeline = parse(yamlHandler.getLatestYaml()).pipeline as PipelineInfoConfig
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.pipeline.error')
      }
    }

    const ciCodeBaseConfigurationError = validateCICodebaseConfiguration({ pipeline: latestPipeline, getString })
    if (ciCodeBaseConfigurationError) {
      clear()
      showError(ciCodeBaseConfigurationError)
      return
    }

    // if Git sync enabled then display modal
    if (isGitSyncEnabled) {
      if (isEmpty(gitDetails.repoIdentifier) || isEmpty(gitDetails.branch)) {
        clear()
        showError(getString('pipeline.gitExperience.selectRepoBranch'))
        return
      }
      // When git sync enabled, do not irritate user by taking all git info then at the end showing BE errors related to schema
      const error = await validateJSONWithSchema({ pipeline: latestPipeline }, pipelineSchema?.data as any)
      if (error.size > 0) {
        clear()
        showError(error)
        return
      }
      if (isYaml && yamlHandler && !isValidYaml()) {
        return
      }

      openSaveToGitDialog({
        isEditing: pipelineIdentifier !== DefaultNewPipelineId,
        resource: {
          type: 'Pipelines',
          name: latestPipeline.name,
          identifier: latestPipeline.identifier,
          gitDetails: gitDetails ?? {}
        },
        payload: { pipeline: omit(latestPipeline, 'repo', 'branch') }
      })
    } else {
      await saveAndPublishPipeline(latestPipeline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const [showModal, hideModal] = useModalHook(() => {
    if (getOtherModal) {
      pipeline.identifier = ''
      updatePipeline(pipeline)
      return (
        <PipelineVariablesContextProvider pipeline={pipeline}>
          {getOtherModal(onSubmit, onCloseCreate)}
        </PipelineVariablesContextProvider>
      )
    } else {
      return (
        <PipelineVariablesContextProvider pipeline={pipeline}>
          <Dialog
            style={{
              width: isGitSyncEnabled ? '614px' : '385px',
              background: 'var(--form-bg)',
              paddingTop: '36px'
            }}
            enforceFocus={false}
            isOpen={true}
            className={'padded-dialog'}
            onClose={onCloseCreate}
            title={
              pipelineIdentifier === DefaultNewPipelineId
                ? getString('moduleRenderer.newPipeLine')
                : getString('editPipeline')
            }
          >
            <CreatePipelines
              afterSave={onSubmit}
              initialValues={merge(pipeline, {
                repo: gitDetails.repoIdentifier || '',
                branch: gitDetails.branch || ''
              })}
              closeModal={onCloseCreate}
              gitDetails={gitDetails as IGitContextFormProps}
            />
          </Dialog>
        </PipelineVariablesContextProvider>
      )
    }
  }, [pipeline?.identifier, pipeline])

  React.useEffect(() => {
    // for new pipeline always use UI as default view
    if (pipelineIdentifier === DefaultNewPipelineId) {
      setView(SelectedView.VISUAL)
    } else if (entityValidityDetails.valid === false || view === SelectedView.YAML) {
      setView(SelectedView.YAML)
    } else {
      setView(SelectedView.VISUAL)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineIdentifier, entityValidityDetails.valid])

  React.useEffect(() => {
    if (entityValidityDetails.valid === false) {
      setDisableVisualView(true)
    } else {
      setDisableVisualView(false)
    }
  }, [entityValidityDetails.valid])

  React.useEffect(() => {
    if (isInitialized) {
      if (pipeline?.identifier === DefaultNewPipelineId) {
        showModal()
      }
      if (isBEPipelineUpdated && !discardBEUpdateDialog) {
        openConfirmBEUpdateError()
      }
      if (blockNavigation && isUpdated) {
        openUnsavedChangesDialog()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipeline?.identifier,
    showModal,
    isInitialized,
    isBEPipelineUpdated,
    openConfirmBEUpdateError,
    discardBEUpdateDialog,
    blockNavigation
  ])

  React.useEffect(() => {
    if (pipeline?.name) {
      window.dispatchEvent(new CustomEvent('RENAME_PIPELINE', { detail: pipeline?.name }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline?.name])

  const onCloseCreate = React.useCallback(() => {
    if (pipelineIdentifier === DefaultNewPipelineId || getOtherModal) {
      if (getOtherModal) {
        deletePipelineCache(gitDetails)
      }
      history.push(toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }))
    }
    hideModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountId,
    hideModal,
    history,
    module,
    orgIdentifier,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipeline?.identifier,
    projectIdentifier,
    toPipelineList,
    getOtherModal,
    deletePipelineCache
  ])

  const onSubmit = React.useCallback(
    (data: PipelineInfoConfig, updatedGitDetails?: EntityGitDetails) => {
      pipeline.name = data.name
      pipeline.description = data.description
      pipeline.timeout = data.timeout
      pipeline.identifier = data.identifier
      pipeline.tags = data.tags ?? {}
      if (isEmpty(pipeline.timeout)) {
        delete pipeline.timeout
      }
      delete (pipeline as PipelineWithGitContextFormProps).repo
      delete (pipeline as PipelineWithGitContextFormProps).branch
      updatePipeline(pipeline)
      if (updatedGitDetails) {
        if (gitDetails?.objectId) {
          updatedGitDetails = { ...gitDetails, ...updatedGitDetails }
        }
        updateGitDetails(updatedGitDetails).then(() => {
          if (updatedGitDetails) {
            updateQueryParams(
              { repoIdentifier: updatedGitDetails.repoIdentifier, branch: updatedGitDetails.branch },
              { skipNulls: true }
            )
          }
        })
      }
      hideModal()
      trackEvent(PipelineActions.StartedPipelineCreation, { module })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hideModal, pipeline, updatePipeline]
  )

  function handleViewChange(newView: SelectedView): boolean {
    if (newView === view) return false
    if (newView === SelectedView.VISUAL && yamlHandler && isYamlEditable) {
      if (!isValidYaml()) return false
    }
    setView(newView)
    updatePipelineView({
      splitViewData: {},
      isDrawerOpened: false,
      isYamlEditable: false,
      isSplitViewOpen: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    setSelectedStageId(undefined)
    setSelectedSectionId(undefined)
    return true
  }

  const [inputSetYaml, setInputSetYaml] = React.useState('')

  const { data, refetch, loading } = useGetInputsetYaml({
    planExecutionId: executionId ?? '',
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const getInputSetSelected = (): InputSetValue[] => {
    if (inputSetType) {
      const inputSetSelected: InputSetValue[] = [
        {
          type: inputSetType as InputSetSummaryResponse['inputSetType'],
          value: inputSetValue ?? '',
          label: inputSetLabel ?? '',
          gitDetails: {
            repoIdentifier: inputSetRepoIdentifier,
            branch: inputSetBranch
          }
        }
      ]
      return inputSetSelected
    }
    return []
  }

  React.useEffect(() => {
    if (data) {
      ;(data as unknown as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [data])

  React.useEffect(() => {
    if (executionId && executionId !== null) {
      refetch()
    }
  }, [executionId])

  function onCloseRunPipelineModal(): void {
    closeRunPipelineModal()
    setInputSetYaml('')
    replaceQueryParams({ repoIdentifier: repoIdentifier, branch: branch }, { skipNulls: true }, true)
  }

  React.useEffect(() => {
    if (runPipeline) {
      openRunPipelineModal()
    }
  }, [runPipeline])

  const [openRunPipelineModal, closeRunPipelineModal] = useModalHook(
    () =>
      loading ? (
        <PageSpinner />
      ) : (
        <Dialog {...runModalProps}>
          <Layout.Vertical className={css.modalCard}>
            <RunPipelineForm
              pipelineIdentifier={pipelineIdentifier}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              accountId={accountId}
              module={module}
              inputSetYAML={inputSetYaml || ''}
              inputSetSelected={getInputSetSelected()}
              repoIdentifier={repoIdentifier}
              branch={branch}
              onClose={() => {
                onCloseRunPipelineModal()
              }}
              stagesExecuted={stagesExecuted}
            />
            <Button
              aria-label="close modal"
              icon="cross"
              variation={ButtonVariation.ICON}
              onClick={() => {
                onCloseRunPipelineModal()
              }}
              className={css.crossIcon}
            />
          </Layout.Vertical>
        </Dialog>
      ),
    [
      loading,
      inputSetYaml,
      inputSetRepoIdentifier,
      inputSetBranch,
      branch,
      repoIdentifier,
      inputSetType,
      inputSetValue,
      inputSetLabel,
      pipelineIdentifier
    ]
  )

  const onGitBranchChange = React.useMemo(
    () => (selectedFilter: GitFilterScope) => {
      setSelectedBranch(selectedFilter.branch as string)
      if (isUpdated && branch !== selectedFilter.branch) {
        setBlockNavigation(true)
      } else if (branch !== selectedFilter.branch) {
        deletePipelineCache({ repoIdentifier: selectedFilter.repo || '', branch: selectedFilter.branch || '' }).then(
          () => {
            history.push(
              routes.toPipelineStudio({
                projectIdentifier,
                orgIdentifier,
                pipelineIdentifier: pipelineIdentifier || '-1',
                accountId,
                module,
                branch: selectedFilter.branch,
                repoIdentifier: selectedFilter.repo
              })
            )
            location.reload()
          }
        )
      }
    },
    [repoIdentifier, branch, isUpdated, pipelineIdentifier]
  )

  if (isLoading) {
    return (
      <React.Fragment>
        <PageSpinner fixed />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
  }

  const getPipelineNameTextContainerWidth = (): number | undefined => {
    if (isGitSyncEnabled) {
      if (pipelineIdentifier === DefaultNewPipelineId) {
        if (!isEmpty(pipeline?.tags)) {
          return 150
        }
        return 175
      }
      if (!isEmpty(pipeline?.tags)) {
        return 125
      }
      return 155
    }
    return 400
  }

  return (
    <PipelineVariablesContextProvider pipeline={pipeline}>
      <div
        className={cx(Classes.POPOVER_DISMISS, css.content)}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <NavigationCheck
          when={getOtherModal && pipeline.identifier !== ''}
          shouldBlockNavigation={nextLocation => {
            let localUpdated = isUpdated
            const matchDefault = matchPath(nextLocation.pathname, {
              path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
              exact: true
            })

            // This is special handler when user update yaml and immediately click on run
            if (isYaml && yamlHandler && isYamlEditable && !localUpdated) {
              try {
                const parsedYaml = parse(yamlHandler.getLatestYaml())
                if (!parsedYaml) {
                  clear()
                  showError(getString('invalidYamlText'), undefined, 'pipeline.parse.yaml.error')
                  return true
                }
                if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
                  setYamlError(true)
                  return true
                }
                localUpdated = !isEqual(omit(originalPipeline, 'repo', 'branch'), parsedYaml.pipeline)
                updatePipeline(parsedYaml.pipeline)
              } catch (e) {
                setYamlError(true)
                return true
              }
            }
            setYamlError(false)
            return (
              !matchDefault?.isExact &&
              localUpdated &&
              !isReadonly &&
              !(pipelineIdentifier === DefaultNewPipelineId && isEmpty(pipeline?.name))
            )
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
            !isPipeline?.isExact && deletePipelineCache(gitDetails)
            history.push(newPath)
          }}
        />
        <div>
          <div className={css.titleBar}>
            <div className={css.breadcrumbsMenu}>
              <div className={css.pipelineMetadataContainer}>
                <Layout.Horizontal className={css.pipelineNameContainer}>
                  <Icon className={css.pipelineIcon} padding={{ right: 'small' }} name="pipeline" size={32} />
                  <Text
                    className={css.pipelineName}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: getPipelineNameTextContainerWidth()
                    }}
                    tooltip={pipeline?.name}
                  >
                    {pipeline?.name}
                  </Text>
                  {!isEmpty(pipeline?.tags) && pipeline.tags && (
                    <Container className={css.tagsContainer}>
                      <TagsPopover tags={pipeline.tags} />
                    </Container>
                  )}
                  {isGitSyncEnabled && (
                    <StudioGitPopover
                      gitDetails={gitDetails}
                      identifier={pipelineIdentifier}
                      isReadonly={isReadonly}
                      entityData={{ ...pipeline, versionLabel: '', type: 'Step' }} // Just to avoid type issues
                      onGitBranchChange={onGitBranchChange}
                      entityType={'Pipeline'}
                    />
                  )}
                  {isYaml || isReadonly ? null : (
                    <Button variation={ButtonVariation.ICON} icon="Edit" onClick={showModal} />
                  )}
                </Layout.Horizontal>
              </div>
            </div>
            <VisualYamlToggle
              className={css.visualYamlToggle}
              selectedView={isYaml || disableVisualView ? SelectedView.YAML : SelectedView.VISUAL}
              disableToggle={disableVisualView}
              onChange={nextMode => {
                handleViewChange(nextMode)
              }}
            />
            <div>
              <div className={css.savePublishContainer}>
                {isReadonly && (
                  <div className={css.readonlyAccessTag}>
                    <Icon name="eye-open" size={16} />
                    <div className={css.readonlyAccessText}>{getString('common.readonlyPermissions')}</div>
                  </div>
                )}
                {isUpdated && !isReadonly && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
                <div>
                  {!isReadonly && (
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      text={getString('save')}
                      onClick={saveAndPublish}
                      icon="send-data"
                      className={css.saveButton}
                    />
                  )}
                  {pipelineIdentifier !== DefaultNewPipelineId && !isReadonly && (
                    <Button
                      disabled={!isUpdated}
                      onClick={() => {
                        updatePipelineView({ ...pipelineView, isYamlEditable: false })
                        fetchPipeline({ forceFetch: true, forceUpdate: true })
                      }}
                      className={css.discardBtn}
                      variation={ButtonVariation.SECONDARY}
                      text={getString('pipeline.discard')}
                    />
                  )}
                  <RbacButton
                    data-testid="card-run-pipeline"
                    variation={ButtonVariation.PRIMARY}
                    icon="run-pipeline"
                    intent="success"
                    disabled={isUpdated}
                    className={css.runPipelineBtn}
                    text={getString('runPipelineText')}
                    tooltip={isUpdated ? 'Please click Save and then run the pipeline.' : ''}
                    onClick={e => {
                      e.stopPropagation()
                      openRunPipelineModal()
                    }}
                    featuresProps={getFeaturePropsForRunPipelineButton(template?.data?.modules)}
                    permission={{
                      resourceScope: {
                        accountIdentifier: accountId,
                        orgIdentifier,
                        projectIdentifier
                      },
                      resource: {
                        resourceType: ResourceType.PIPELINE,
                        resourceIdentifier: pipeline?.identifier as string
                      },
                      permission: PermissionIdentifier.EXECUTE_PIPELINE
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <PipelineFeatureLimitBreachedBanner featureIdentifier={FeatureIdentifier.SERVICES} module={module} />
          <PipelineFeatureLimitBreachedBanner
            featureIdentifier={FeatureIdentifier.DEPLOYMENTS_PER_MONTH}
            module={module}
          />
          <PipelineFeatureLimitBreachedBanner
            featureIdentifier={FeatureIdentifier.INITIAL_DEPLOYMENTS}
            module={module}
          />
        </div>
        {isYaml ? <PipelineYamlView /> : <StageBuilder />}
        {shouldShowGovernanceEvaluation && (
          <EvaluationModal
            accountId={accountId}
            metadata={governanceMetadata}
            headingErrorMessage={getString('pipeline.policyEvaluations.failedToSavePipeline')}
          />
        )}
      </div>
      <RightBar />
    </PipelineVariablesContextProvider>
  )
}

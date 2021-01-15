import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Button,
  useModalHook,
  Tag,
  Formik,
  FormikForm,
  FormInput,
  TextInput,
  Text,
  RUNTIME_INPUT_VALUE,
  IconName
} from '@wings-software/uicore'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { isEmpty, isEqual, set } from 'lodash-es'
import type { NgPipeline, Failure, PipelineInfoConfig } from 'services/cd-ng'
import { useAppStore, useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/components/Toaster/useToaster'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  ConnectorInfoDTO,
  useGetConnector,
  useGetTestConnectionResult,
  useGetTestGitRepoConnectionResult
} from 'services/cd-ng'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { accountPathProps, pipelinePathProps, pipelineModuleParams } from '@common/utils/routeUtils'
// import { DrawerTypes } from '../PipelineContext/PipelineActions'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  PipelineStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { PipelineContext, savePipeline } from '../PipelineContext/PipelineContext'
import CreatePipelines from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId, SplitViewTypes } from '../PipelineContext/PipelineActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'

// import AddDrawer, { DrawerContext } from '@common/components/AddDrawer/AddDrawer'
// import { getStageFromPipeline } from '../StageBuilder/StageBuilderUtil'
// import { addStepOrGroup, generateRandomString } from '../ExecutionGraph/ExecutionGraphUtil'

// import { getAddDrawerMap, getCategoryItems } from './PipelineCanvasUtils'
import PipelineYamlView from '../PipelineYamlView/PipelineYamlView'
import StageBuilder from '../StageBuilder/StageBuilder'
import css from './PipelineCanvas.module.scss'

export interface PipelineCanvasProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps & PipelineStudioQueryParams>>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
}
interface CodebaseValues {
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
}

enum CodebaseStatuses {
  NotConfigured = 'notConfigured',
  Valid = 'valid',
  Invalid = 'invalid',
  Validating = 'validating'
}

const codebaseIcons: Record<CodebaseStatuses, IconName> = {
  [CodebaseStatuses.NotConfigured]: 'execution-warning',
  [CodebaseStatuses.Valid]: 'command-artifact-check',
  [CodebaseStatuses.Invalid]: 'circle-cross',
  [CodebaseStatuses.Validating]: 'steps-spinner'
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  toPipelineDetail,
  toPipelineList,
  toPipelineProject,
  toPipelineStudio
}): JSX.Element => {
  const { state, updatePipeline, deletePipelineCache, updatePipelineView, fetchPipeline } = React.useContext(
    PipelineContext
  )

  const {
    pipeline,
    isUpdated,
    isLoading,
    isInitialized,
    originalPipeline,
    yamlHandler,
    isBEPipelineUpdated,
    pipelineView: {
      splitViewData: { type: splitViewType }
      // splitViewData: { type: splitViewType, selectedStageId }
    },
    // pipelineView: { drawerData, isDrawerOpened },
    pipelineView
  } = state
  // const { stage: selectedStage } = getStageFromPipeline(pipeline, selectedStageId || '')

  const { getString } = useStrings()

  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase
  const [codebaseStatus, setCodebaseStatus] = React.useState<CodebaseStatuses>()

  const ciStageExists = pipeline?.stages?.some(stage => {
    if (stage?.stage?.type) {
      return stage?.stage?.type === 'CI'
    } else {
      return false
    }
  })

  const [isCodebaseDialogOpen, setIsCodebaseDialogOpen] = React.useState(false)

  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const codebaseInitialValues: CodebaseValues = {
    repoName: codebase?.repoName
  }

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')

  const { mutate: testRepoLevelConnection } = useGetTestConnectionResult({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { mutate: testAccountLevelConnection } = useGetTestGitRepoConnectionResult({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      repoURL:
        (connector?.data?.connector?.spec.url[connector?.data?.connector?.spec.url.length - 1] === '/'
          ? connector?.data?.connector?.spec.url
          : connector?.data?.connector?.spec.url + '/') + codebase?.repoName
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    codebaseInitialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  React.useEffect(() => {
    if (connector?.data?.connector) {
      setConnectionType(connector?.data?.connector.spec.type)
      setConnectorUrl(connector?.data?.connector.spec.url)
    }
  }, [
    isCodebaseDialogOpen,
    connector?.data?.connector,
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setConnectionType,
    setConnectorUrl
  ])

  const { showSuccess, showError } = useToaster()
  // todo: test before enabling
  // const addDrawerMap =
  //   isDrawerOpened && stageType && selectedStage
  //     ? getAddDrawerMap(getCategoryItems(stageType, selectedStage), stageType)
  //     : null

  // const onStepSelect = (item: StepData) => {
  //   const paletteData = drawerData?.data.paletteData
  //   if (paletteData?.entity) {
  //     const { stage: pipelineStage } = getStageFromPipeline(pipeline, selectedStageId)
  //     addStepOrGroup(
  //       paletteData.entity,
  //       pipelineStage?.stage.spec.execution,
  //       {
  //         step: {
  //           type: item.type,
  //           name: item.name,
  //           identifier: generateRandomString(item.name)
  //         }
  //       },
  //       paletteData.isParallelNodeClicked,
  //       paletteData.isRollback
  //     )
  //     updatePipeline(pipeline)
  //   }
  //   updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
  // }

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

  const { selectedProject } = useAppStore()
  const project = selectedProject
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

  React.useEffect(() => {
    if (!loading) {
      if (!codebase) {
        setCodebaseStatus(CodebaseStatuses.NotConfigured)
      } else {
        const validate = async () => {
          setCodebaseStatus(CodebaseStatuses.Validating)

          if (connector?.data?.connector?.spec.type === 'Account') {
            try {
              const response = await testAccountLevelConnection()

              if (response?.data?.status === 'SUCCESS') {
                setCodebaseStatus(CodebaseStatuses.Valid)
              } else {
                setCodebaseStatus(CodebaseStatuses.Invalid)
              }
            } catch (error) {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } else {
            try {
              const response = await testRepoLevelConnection()

              if (response?.data?.status === 'SUCCESS') {
                setCodebaseStatus(CodebaseStatuses.Valid)
              } else {
                setCodebaseStatus(CodebaseStatuses.Invalid)
              }
            } catch (error) {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          }
        }

        if (connector) {
          validate()
        }
      }
    }
  }, [codebase, connector?.data?.connector?.spec.type, loading])

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
      pipeline.tags = data.tags

      updatePipeline(pipeline)
      hideModal()
    },
    [hideModal, pipeline, updatePipeline]
  )

  const openCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(true)
  }, [setIsCodebaseDialogOpen])

  const closeCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(false)

    if (!connector?.data?.connector?.spec.type && !connector?.data?.connector?.spec.url) {
      setConnectionType('')
      setConnectorUrl('')
    }
  }, [
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setIsCodebaseDialogOpen,
    setConnectionType,
    setConnectorUrl
  ])

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
            <Breadcrumbs
              links={[
                {
                  url: toPipelineProject({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: project?.name as string
                },
                {
                  url: toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: getString('pipelines')
                },
                ...(pipelineIdentifier !== DefaultNewPipelineId
                  ? [
                      {
                        url: toPipelineDetail({
                          projectIdentifier,
                          orgIdentifier,
                          pipelineIdentifier,
                          accountId,
                          module
                        }),
                        label: pipeline?.name
                      },
                      { url: '#', label: getString('studioText') }
                    ]
                  : [{ url: '#', label: getString('studioText') }])
              ]}
            />
            <div className={css.pipelineNameContainer}>
              <div>
                <Text className={css.pipelineName}>{pipeline?.name}</Text>
                <Button minimal icon="Edit" iconProps={{ size: 12 }} onClick={showModal} />
              </div>
            </div>
          </div>

          <div className={css.pipelineStudioTitleContainer}>
            <div className={css.pipelineStudioTitle}>
              <div className={css.rectangle}>
                <span>Pipeline Studio</span>
              </div>
            </div>
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
              <div>
                {isUpdated && (
                  <Tag intent="primary" className={css.tagRender} minimal>
                    {getString('unsavedChanges')}
                  </Tag>
                )}
              </div>
              <div>
                <Button
                  minimal
                  intent="primary"
                  text={getString('saveAndPublish')}
                  onClick={saveAndPublish}
                  icon="arrow-up"
                  className={css.savePublishBtn}
                />
              </div>
            </div>
            <div className={css.rightSideBottom}>
              {!isYaml && (
                <>
                  {typeof codebaseStatus !== 'undefined' &&
                    selectedProject?.modules &&
                    selectedProject.modules.indexOf?.('CI') > -1 &&
                    ciStageExists && (
                      <Button
                        className={cx(css.codebaseConfiguration, css[codebaseStatus])}
                        text={getString('codebase')}
                        font={{ weight: 'semi-bold' }}
                        icon={codebaseIcons[codebaseStatus] as IconName}
                        minimal
                        onClick={() => {
                          openCodebaseDialog()
                        }}
                      />
                    )}
                  <Button
                    minimal={!(splitViewType === SplitViewTypes.Notifications)}
                    text={getString('notifications')}
                    font={{ weight: 'semi-bold' }}
                    tooltip={getString('notifications')}
                    icon="yaml-builder-notifications"
                    iconProps={{ color: 'var(--dark-500)' }}
                    disabled
                    onClick={() => {
                      updatePipelineView({
                        ...pipelineView,
                        isSplitViewOpen: true,
                        splitViewData: { type: SplitViewTypes.Notifications }
                      })
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {isYaml ? <PipelineYamlView /> : <StageBuilder />}
      <RightDrawer />
      {/* todo: Requires more testing before merge */}
      {/* {isDrawerOpened && drawerData.data && stageType && addDrawerMap ? (
        <>
        <AddDrawer
          addDrawerMap={addDrawerMap}
          drawerContext={DrawerContext.STUDIO}
          onSelect={onStepSelect}
          onClose={() =>
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep }
            })
          }
        />
        // not tested RightBar yet but won't exist in AddDrawer
          <RightBar/>
        </>
      ) : null} */}

      {isCodebaseDialogOpen && (
        <Dialog
          isOpen={true}
          title={
            // TODO: Move to strings
            codebaseStatus === CodebaseStatuses.NotConfigured ? 'Configure Codebase' : 'Edit Codebase Configuration'
          }
          onClose={closeCodebaseDialog}
        >
          <Formik
            enableReinitialize
            initialValues={codebaseInitialValues}
            validationSchema={Yup.object().shape({
              connectorRef: Yup.mixed().required(
                getString('fieldRequired', { field: getString('pipelineSteps.build.create.connectorLabel') })
              ),
              ...(connectionType === 'Account' && {
                repoName: Yup.string().required(getString('pipelineSteps.build.create.repositoryNameRequiredError'))
              })
            })}
            onSubmit={(values): void => {
              set(pipeline, 'properties.ci.codebase', {
                connectorRef: values.connectorRef?.value,
                ...(values.repoName && { repoName: values.repoName }),
                build: RUNTIME_INPUT_VALUE
              })

              // Repo level connectors should not have repoName
              if (connectionType === 'Repo' && (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
                delete (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
              }

              updatePipeline(pipeline)

              closeCodebaseDialog()
            }}
          >
            {({ values, setFieldValue, submitForm, errors }) => (
              <>
                <div className={Classes.DIALOG_BODY}>
                  <FormikForm>
                    <ConnectorReferenceField
                      name="connectorRef"
                      category={'CODE_REPO'}
                      selected={values.connectorRef}
                      width={460}
                      error={errors?.connectorRef}
                      label={getString('pipelineSteps.build.create.connectorLabel')}
                      placeholder={loading ? getString('loading') : getString('select')}
                      disabled={loading}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={(value, scope) => {
                        setConnectionType(value.spec.type)
                        setConnectorUrl(value.spec.url)

                        setFieldValue('connectorRef', {
                          label: value.name || '',
                          value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                          scope: scope
                        })
                      }}
                    />
                    {connectionType === 'Repo' ? (
                      <>
                        <Text margin={{ bottom: 'xsmall' }}>
                          {getString('pipelineSteps.build.create.repositoryNameLabel')}
                        </Text>
                        <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                      </>
                    ) : (
                      <>
                        <FormInput.Text
                          // TODO: Move to strings, in EditStageView too
                          label={'Repository Name'}
                          name="repoName"
                          style={{ flexGrow: 1 }}
                        />
                        {connectorUrl.length > 0 ? (
                          <div className={css.predefinedValue}>
                            {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                              (values.repoName ? values.repoName : '')}
                          </div>
                        ) : null}
                      </>
                    )}
                  </FormikForm>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <Button intent="primary" text={getString('save')} onClick={submitForm} /> &nbsp; &nbsp;
                  <Button text={getString('cancel')} onClick={closeCodebaseDialog} />
                </div>
              </>
            )}
          </Formik>
        </Dialog>
      )}
    </div>
  )
}

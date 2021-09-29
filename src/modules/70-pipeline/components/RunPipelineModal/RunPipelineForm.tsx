import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Tooltip, Dialog, Classes, RadioGroup, Radio, PopoverPosition } from '@blueprintjs/core'
import {
  Button,
  Checkbox,
  Formik,
  FormikForm,
  Layout,
  Text,
  NestedAccordionProvider,
  Icon,
  useModalHook,
  Heading,
  Color,
  ButtonVariation
} from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { parse } from 'yaml'
import { pick, merge, isEmpty, isEqual } from 'lodash-es'
import type { FormikErrors } from 'formik'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { PipelineInfoConfig, ResponseJsonNode } from 'services/cd-ng'
import {
  useGetPipeline,
  usePostPipelineExecuteWithInputSetYaml,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  getInputSetForPipelinePromise,
  useGetInputSetsListForPipeline,
  useCreateInputSetForPipeline,
  useRePostPipelineExecuteWithInputSetYaml
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { usePermission } from '@rbac/hooks/usePermission'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { GitQueryParams, InputSetGitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageBody } from '@common/components/Page/PageBody'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import VisualYamlToggle, { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import { useQueryParams } from '@common/hooks'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import { clearRuntimeInput, validatePipeline, getErrorsList } from '../PipelineStudio/StepUtil'
import { PreFlightCheckModal } from '../PreFlightCheckModal/PreFlightCheckModal'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import type { Values } from '../PipelineStudio/StepCommands/StepCommandTypes'
import factory from '../PipelineSteps/PipelineStepFactory'
import { mergeTemplateWithInputSetData } from './RunPipelineHelper'
import { StepViewType } from '../AbstractSteps/Step'
import GitPopover from '../GitPopover/GitPopover'
import SaveAsInputSet from './SaveAsInputSet'
import css from './RunPipelineForm.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */
export interface RunPipelineFormProps extends PipelineType<PipelinePathProps & GitQueryParams> {
  inputSetSelected?: InputSetSelectorProps['value']
  inputSetYAML?: string
  onClose?: () => void
  executionView?: boolean
  mockData?: ResponseJsonNode
  executionInputSetTemplateYaml?: string
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `run-pipeline.yaml`,
  entityType: 'Pipelines',
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

function RunPipelineFormBasic({
  pipelineIdentifier,
  accountId,
  orgIdentifier,
  projectIdentifier,
  onClose,
  inputSetSelected,
  inputSetYAML,
  module,
  executionView,
  branch,
  repoIdentifier,
  executionInputSetTemplateYaml = ''
}: RunPipelineFormProps & InputSetGitQueryParams): React.ReactElement {
  const [skipPreFlightCheck, setSkipPreFlightCheck] = React.useState<boolean>(false)
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [notifyOnlyMe, setNotifyOnlyMe] = React.useState<boolean>(false)
  const [selectedInputSets, setSelectedInputSets] = React.useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [formErrors, setFormErrors] = React.useState<FormikErrors<InputSetDTO>>({})
  const [currentPipeline, setCurrentPipeline] = React.useState<{ pipeline?: PipelineInfoConfig } | undefined>(
    inputSetYAML ? parse(inputSetYAML) : undefined
  )
  const { showError, showSuccess, showWarning } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [triggerValidation, setTriggerValidation] = useState(false)
  const [runClicked, setRunClicked] = useState(false)

  React.useEffect(() => {
    getInputSetsList()
  }, [])

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const [canEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE]
    },
    [accountId, orgIdentifier, projectIdentifier, pipelineIdentifier]
  )

  useEffect(() => {
    if (inputSetYAML) {
      const parsedYAML = parse(inputSetYAML)
      setExistingProvide('provide')
      setCurrentPipeline(parsedYAML)
    }
  }, [inputSetYAML])

  const { data: template, loading: loadingTemplate } = useGetTemplateFromPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })
  const { data: pipelineResponse, loading: loadingPipeline } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })
  const { mutate: runPipeline, loading: runLoading } = usePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const { executionId } = useQueryParams<{ executionId?: string }>()

  const { mutate: reRunPipeline, loading: reRunLoading } = useRePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    originalExecutionId: executionId || '',
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const {
    refetch: getInputSetsList,
    data: inputSetResponse,
    loading: inputSetLoading
  } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      ...(!isEmpty(repoIdentifier) && !isEmpty(branch)
        ? {
            repoIdentifier,
            branch,
            getDefaultFromOtherRepo: true
          }
        : {})
    },
    lazy: true
  })

  const inputSets = inputSetResponse?.data?.content

  const yamlTemplate = React.useMemo(() => {
    return parse(template?.data?.inputSetTemplateYaml || '')?.pipeline
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    setTriggerValidation(true)
  }, [currentPipeline])

  React.useEffect(() => {
    const toBeUpdated = merge(parse(template?.data?.inputSetTemplateYaml || ''), currentPipeline || {}) as {
      pipeline: PipelineInfoConfig
    }
    setCurrentPipeline(toBeUpdated)
  }, [template?.data?.inputSetTemplateYaml])

  React.useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  React.useEffect(() => {
    if (template?.data?.inputSetTemplateYaml) {
      const parsedTemplate = parse(template?.data?.inputSetTemplateYaml) as { pipeline: PipelineInfoConfig }
      if ((selectedInputSets && selectedInputSets.length > 1) || selectedInputSets?.[0]?.type === 'OVERLAY_INPUT_SET') {
        const fetchData = async (): Promise<void> => {
          try {
            const data = await mergeInputSet({
              inputSetReferences: selectedInputSets.map(item => item.value as string)
            })
            if (data?.data?.pipelineYaml) {
              const inputSetPortion = parse(data.data.pipelineYaml) as {
                pipeline: PipelineInfoConfig
              }
              const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
              setCurrentPipeline(toBeUpdated)
            }
          } catch (e) {
            showError(e?.data?.message || e?.message, undefined, 'pipeline.feth.inputSetTemplateYaml.error')
          }
        }
        fetchData()
      } else if (selectedInputSets && selectedInputSets.length === 1) {
        const fetchData = async (): Promise<void> => {
          const data = await getInputSetForPipelinePromise({
            inputSetIdentifier: selectedInputSets[0].value as string,
            queryParams: {
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier,
              repoIdentifier: selectedInputSets[0]?.gitDetails?.repoIdentifier,
              branch: selectedInputSets[0]?.gitDetails?.branch
            }
          })
          if (data?.data?.inputSetYaml) {
            if (selectedInputSets[0].type === 'INPUT_SET') {
              const inputSetPortion = pick(parse(data.data.inputSetYaml)?.inputSet, 'pipeline') as {
                pipeline: PipelineInfoConfig
              }
              const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
              setCurrentPipeline(toBeUpdated)
            }
          }
        }
        fetchData()
      } else if (!selectedInputSets?.length && !inputSetYAML?.length) {
        setCurrentPipeline(parsedTemplate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier
  ])

  const { mutate: mergeInputSet, loading: loadingUpdate } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      ...(!isEmpty(repoIdentifier) && !isEmpty(branch)
        ? {
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            repoIdentifier,
            branch,
            getDefaultFromOtherRepo: true
          }
        : {})
    }
  })

  const pipeline: PipelineInfoConfig | undefined = parse(pipelineResponse?.data?.yamlPipeline || '')?.pipeline

  const valuesPipelineRef = useRef<PipelineInfoConfig>()

  const [showPreflightCheckModal, hidePreflightCheckModal] = useModalHook(() => {
    return (
      <Dialog
        className={cx(css.preFlightCheckModal, Classes.DIALOG)}
        enforceFocus={false}
        isOpen
        onClose={hidePreflightCheckModal}
      >
        <PreFlightCheckModal
          pipeline={valuesPipelineRef.current}
          module={module}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          pipelineIdentifier={pipelineIdentifier}
          branch={branch}
          repoIdentifier={repoIdentifier}
          onCloseButtonClick={hidePreflightCheckModal}
          onContinuePipelineClick={() => {
            hidePreflightCheckModal()
            handleRunPipeline(valuesPipelineRef.current, true)
          }}
        />
      </Dialog>
    )
  }, [])

  const handleRunPipeline = React.useCallback(
    async (valuesPipeline?: PipelineInfoConfig, forceSkipFlightCheck = false) => {
      if (Object.keys(formErrors).length) {
        return
      }
      valuesPipelineRef.current = valuesPipeline
      if (!skipPreFlightCheck && !forceSkipFlightCheck) {
        // Not skipping pre-flight check - open the new modal
        showPreflightCheckModal()
        return
      }

      try {
        const response = isEmpty(executionId)
          ? await runPipeline(
              !isEmpty(valuesPipelineRef.current) ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any) : ''
            )
          : await reRunPipeline(
              !isEmpty(valuesPipelineRef.current) ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any) : ''
            )
        const data = response.data
        if (response.status === 'SUCCESS') {
          if (response.data) {
            showSuccess(getString('runPipelineForm.pipelineRunSuccessFully'))
            history.push(
              routes.toExecutionPipelineView({
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                executionIdentifier: data?.planExecution?.uuid || '',
                accountId,
                module
              })
            )
          }
        }
      } catch (error) {
        showWarning(error?.data?.message || getString('runPipelineForm.runPipelineFailed'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      runPipeline,
      showWarning,
      showSuccess,
      pipelineIdentifier,
      history,
      orgIdentifier,
      module,
      projectIdentifier,
      onClose,
      accountId,
      skipPreFlightCheck,
      formErrors
    ]
  )

  const [existingProvide, setExistingProvide] = React.useState('existing')

  useEffect(() => {
    if (inputSets && !(inputSets.length > 0)) {
      setExistingProvide('provide')
    }
  }, [inputSets])

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [lastYaml, setLastYaml] = useState({})

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const presentPipeline = parse(yamlHandler?.getLatestYaml() || '') as { pipeline: PipelineInfoConfig }
        setCurrentPipeline(presentPipeline)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml]
  )

  useEffect(() => {
    try {
      if (yamlHandler) {
        const Interval = window.setInterval(() => {
          const parsedYaml = parse(yamlHandler.getLatestYaml() || '')
          if (!isEqual(lastYaml, parsedYaml)) {
            setCurrentPipeline(parsedYaml as { pipeline: PipelineInfoConfig })
            setLastYaml(parsedYaml)
          }
        }, POLL_INTERVAL)
        return () => {
          window.clearInterval(Interval)
        }
      }
    } catch (e) {
      // Ignore Error
    }
  }, [yamlHandler, lastYaml])

  useEffect(() => {
    let errors: FormikErrors<InputSetDTO> = formErrors

    if (
      triggerValidation &&
      currentPipeline?.pipeline &&
      template?.data?.inputSetTemplateYaml &&
      yamlTemplate &&
      pipeline &&
      runClicked
    ) {
      errors = validatePipeline({
        pipeline: { ...clearRuntimeInput(currentPipeline.pipeline) },
        template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
        originalPipeline: currentPipeline.pipeline,
        getString,
        viewType: StepViewType.DeploymentForm
      }) as any
      setFormErrors(errors)
      // triggerValidation should be true every time 'currentPipeline' changes
      // and it needs to be set as false here so that we do not trigger it indefinitely
      setTriggerValidation(false)
    }
  }, [
    existingProvide,
    currentPipeline,
    getString,
    pipeline,
    template?.data?.inputSetTemplateYaml,
    yamlTemplate,
    selectedInputSets,
    existingProvide
  ])

  if (loadingPipeline || loadingTemplate || runLoading || inputSetLoading || reRunLoading) {
    return <PageSpinner />
  }

  const checkIfRuntimeInputsNotPresent = (): string | undefined => {
    if (executionView && !executionInputSetTemplateYaml) {
      return getString('pipeline.inputSets.noRuntimeInputsWhileExecution')
    } else if (!executionView && pipeline && currentPipeline && !template?.data?.inputSetTemplateYaml) {
      return getString('runPipelineForm.noRuntimeInput')
    }
  }

  const renderPipelineInputSetForm = () => {
    if (loadingUpdate) {
      return (
        <PageSpinner
          className={css.inputSetsUpdatingSpinner}
          message={getString('pipeline.inputSets.applyingInputSets')}
        />
      )
    }
    if (currentPipeline?.pipeline && pipeline && template?.data?.inputSetTemplateYaml) {
      const templateSource = executionView ? executionInputSetTemplateYaml : template?.data?.inputSetTemplateYaml
      return (
        <>
          {existingProvide === 'existing' ? <div className={css.divider} /> : null}
          <PipelineInputSetForm
            originalPipeline={{ ...pipeline }}
            template={parse(templateSource)?.pipeline}
            readonly={executionView}
            path=""
            viewType={StepViewType.DeploymentForm}
            isRunPipelineForm
            maybeContainerClass={existingProvide === 'provide' ? css.inputSetFormRunPipeline : ''}
          />
        </>
      )
    }
  }

  const child = (
    <>
      <Formik<Values>
        initialValues={
          (pipeline && currentPipeline && template?.data?.inputSetTemplateYaml
            ? currentPipeline?.pipeline
              ? clearRuntimeInput(currentPipeline.pipeline)
              : {}
            : currentPipeline?.pipeline
            ? clearRuntimeInput(currentPipeline.pipeline)
            : {}) as Values
        }
        formName="runPipeline"
        onSubmit={values => {
          handleRunPipeline(values as any)
        }}
        enableReinitialize
        validate={async values => {
          let errors: FormikErrors<InputSetDTO> = formErrors

          setCurrentPipeline({ ...currentPipeline, pipeline: values as PipelineInfoConfig })

          function validateErrors(): Promise<FormikErrors<InputSetDTO>> {
            return new Promise(resolve => {
              setTimeout(() => {
                const validatedErrors =
                  (validatePipeline({
                    pipeline: values as PipelineInfoConfig,
                    template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
                    originalPipeline: pipeline,
                    getString,
                    viewType: StepViewType.DeploymentForm
                  }) as any) || formErrors
                resolve(validatedErrors)
              }, 300)
            })
          }

          errors = await validateErrors()

          if (typeof errors !== undefined && runClicked) {
            setFormErrors(errors)
          }
          return errors
        }}
      >
        {({ submitForm, values }) => {
          const noRuntimeInputs = checkIfRuntimeInputsNotPresent()
          return (
            <Layout.Vertical>
              {executionView ? null : (
                <>
                  <div className={css.runModalHeader}>
                    <Heading
                      level={2}
                      font={{ weight: 'bold' }}
                      color={Color.BLACK_100}
                      className={css.runModalHeaderTitle}
                    >
                      {getString('runPipeline')}
                    </Heading>
                    {isGitSyncEnabled && (
                      <GitSyncStoreProvider>
                        <GitPopover
                          data={pipelineResponse?.data?.gitDetails ?? {}}
                          iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                        />
                      </GitSyncStoreProvider>
                    )}
                    <div className={css.optionBtns}>
                      <VisualYamlToggle
                        initialSelectedView={selectedView}
                        beforeOnChange={(nextMode, callback) => {
                          handleModeSwitch(nextMode)
                          callback(nextMode)
                        }}
                        disableYaml={!template?.data?.inputSetTemplateYaml}
                      />
                    </div>
                  </div>
                  <ErrorsStrip formErrors={formErrors} />
                </>
              )}
              {selectedView === SelectedView.VISUAL ? (
                <div className={executionView ? css.runModalFormContentExecutionView : css.runModalFormContent}>
                  <FormikForm>
                    {noRuntimeInputs ? (
                      <Layout.Horizontal padding="medium" margin="medium">
                        <Text>{noRuntimeInputs}</Text>
                      </Layout.Horizontal>
                    ) : (
                      <>
                        {inputSets && inputSets.length > 0 && (
                          <>
                            {!executionView && (
                              <Layout.Vertical
                                className={css.pipelineHeader}
                                padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
                              >
                                <div>
                                  <Layout.Horizontal className={css.runModalSubHeading} id="use-input-set">
                                    <RadioGroup
                                      name="existingProvideRadio"
                                      label={getString(
                                        'pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide'
                                      )}
                                      inline
                                      selectedValue={existingProvide}
                                      onChange={ev => {
                                        setExistingProvide((ev.target as HTMLInputElement).value)
                                      }}
                                    >
                                      <Radio
                                        label={getString('pipeline.triggers.pipelineInputPanel.provide')}
                                        value="provide"
                                        className={cx(
                                          css.valueProviderRadio,
                                          existingProvide === 'provide' ? css.selectedValueProvider : ''
                                        )}
                                      />
                                      <Radio
                                        label={getString('pipeline.triggers.pipelineInputPanel.existing')}
                                        value="existing"
                                        className={cx(
                                          css.valueProviderRadio,
                                          existingProvide === 'existing' ? css.selectedValueProvider : ''
                                        )}
                                      />
                                    </RadioGroup>
                                    <span className={css.helpSection}>
                                      <Icon name="question" className={css.helpIcon} />
                                      <Text
                                        tooltipProps={{
                                          position: PopoverPosition.BOTTOM
                                        }}
                                        tooltip={
                                          <Text padding="medium" width={400}>
                                            {getString('pipeline.inputSets.aboutInputSets')}
                                            <a
                                              href="https://ngdocs.harness.io/article/3fqwa8et3d-input-sets"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {getString('learnMore')}
                                            </a>
                                          </Text>
                                        }
                                      >
                                        {getString('pipeline.triggers.pipelineInputPanel.whatAreInputsets')}
                                      </Text>
                                    </span>
                                  </Layout.Horizontal>
                                </div>
                                {!executionView &&
                                  pipeline &&
                                  currentPipeline &&
                                  template?.data?.inputSetTemplateYaml &&
                                  existingProvide === 'existing' && (
                                    <GitSyncStoreProvider>
                                      <InputSetSelector
                                        pipelineIdentifier={pipelineIdentifier}
                                        onChange={inputsets => {
                                          setSelectedInputSets(inputsets)
                                        }}
                                        value={selectedInputSets}
                                      />
                                    </GitSyncStoreProvider>
                                  )}
                              </Layout.Vertical>
                            )}
                          </>
                        )}
                        {existingProvide === 'provide' ||
                        (selectedInputSets && selectedInputSets?.length > 0) ||
                        executionView
                          ? renderPipelineInputSetForm()
                          : null}
                        {existingProvide === 'existing' && selectedInputSets && selectedInputSets?.length > 0 && (
                          <div className={css.noPipelineInputSetForm} />
                        )}
                      </>
                    )}
                  </FormikForm>
                </div>
              ) : (
                <div className={css.editor}>
                  <Layout.Vertical className={css.content} padding="xlarge">
                    <YamlBuilderMemo
                      {...yamlBuilderReadOnlyModeProps}
                      existingJSON={{ pipeline: values }}
                      bind={setYamlHandler}
                      schema={{}}
                      invocationMap={factory.getInvocationMap()}
                      height="55vh"
                      width="100%"
                      showSnippetSection={false}
                      isEditModeSupported={canEdit}
                    />
                  </Layout.Vertical>
                </div>
              )}
              {executionView ? null : (
                <Layout.Horizontal padding={{ left: 'xlarge', right: 'xlarge', top: 'medium', bottom: 'medium' }}>
                  <Checkbox
                    label={getString('pre-flight-check.skipCheckBtn')}
                    background={Color.GREY_100}
                    color={skipPreFlightCheck ? Color.PRIMARY_8 : Color.BLACK}
                    className={css.footerCheckbox}
                    padding={{ top: 'small', bottom: 'small', left: 'xxlarge', right: 'medium' }}
                    checked={skipPreFlightCheck}
                    onChange={e => setSkipPreFlightCheck(e.currentTarget.checked)}
                  />
                  <Tooltip position="top" content={getString('featureNA')}>
                    <Checkbox
                      background={notifyOnlyMe ? Color.PRIMARY_2 : Color.GREY_100}
                      color={notifyOnlyMe ? Color.PRIMARY_7 : Color.BLACK}
                      className={css.footerCheckbox}
                      margin={{ left: 'medium' }}
                      padding={{ top: 'small', bottom: 'small', left: 'xxlarge', right: 'medium' }}
                      disabled
                      label={getString('runPipelineForm.notifyOnlyMe')}
                      checked={notifyOnlyMe}
                      onChange={e => setNotifyOnlyMe(e.currentTarget.checked)}
                    />
                  </Tooltip>
                </Layout.Horizontal>
              )}
              {executionView ? null : (
                <Layout.Horizontal
                  padding={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
                  flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  className={css.footer}
                >
                  <Layout.Horizontal className={cx(css.actionButtons)}>
                    <RbacButton
                      variation={ButtonVariation.PRIMARY}
                      intent="success"
                      type="submit"
                      text={getString('runPipeline')}
                      onClick={event => {
                        event.stopPropagation()
                        setRunClicked(true)
                        if ((!selectedInputSets || selectedInputSets.length === 0) && existingProvide === 'existing') {
                          setExistingProvide('provide')
                        } else {
                          submitForm()
                        }
                      }}
                      permission={{
                        resource: {
                          resourceIdentifier: pipeline?.identifier as string,
                          resourceType: ResourceType.PIPELINE
                        },
                        permission: PermissionIdentifier.EXECUTE_PIPELINE
                      }}
                      disabled={getErrorsList(formErrors).errorCount > 0}
                    />
                    <div className={css.secondaryButton}>
                      <Button
                        variation={ButtonVariation.SECONDARY}
                        id="cancel-runpipeline"
                        text={getString('cancel')}
                        margin={{ left: 'medium' }}
                        background={Color.GREY_50}
                        onClick={() => {
                          if (onClose) {
                            onClose()
                          }
                        }}
                      />
                    </div>
                  </Layout.Horizontal>
                  <SaveAsInputSet
                    pipeline={pipeline}
                    currentPipeline={currentPipeline}
                    values={values}
                    template={template}
                    canEdit={canEdit}
                    accountId={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    createInputSet={createInputSet}
                    createInputSetLoading={createInputSetLoading}
                    repoIdentifier={repoIdentifier}
                    branch={branch}
                    isGitSyncEnabled={isGitSyncEnabled}
                    setFormErrors={setFormErrors}
                    getInputSetsList={getInputSetsList}
                  />
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )

  return executionView ? (
    <div className={css.runFormExecutionView}>{child}</div>
  ) : (
    <RunPipelineFormWrapper
      accountId={accountId}
      orgIdentifier={orgIdentifier}
      pipelineIdentifier={pipelineIdentifier}
      projectIdentifier={projectIdentifier}
      module={module}
      pipeline={pipeline}
    >
      {child}
    </RunPipelineFormWrapper>
  )
}

export interface RunPipelineFormWrapperProps extends PipelineType<PipelinePathProps> {
  children: React.ReactNode
  pipeline?: PipelineInfoConfig
}

export function RunPipelineFormWrapper(props: RunPipelineFormWrapperProps): React.ReactElement {
  const { children } = props

  return (
    <React.Fragment>
      <PageBody className={css.runForm}>{children}</PageBody>
    </React.Fragment>
  )
}

export const RunPipelineForm: React.FC<RunPipelineFormProps & InputSetGitQueryParams> = props => {
  return (
    <NestedAccordionProvider>
      <RunPipelineFormBasic {...props} />
    </NestedAccordionProvider>
  )
}

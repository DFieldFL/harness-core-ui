/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, Dialog, Classes } from '@blueprintjs/core'
import {
  Button,
  Checkbox,
  Formik,
  FormikForm,
  Layout,
  Text,
  NestedAccordionProvider,
  useModalHook,
  Heading,
  Color,
  ButtonVariation,
  SelectOption,
  HarnessDocTooltip,
  PageSpinner,
  MultiSelectDropDown,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { parse } from 'yaml'
import { pick, merge, isEmpty, isEqual, defaultTo, keyBy } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { PipelineInfoConfig, ResponseJsonNode } from 'services/cd-ng'
import {
  useGetPipeline,
  usePostPipelineExecuteWithInputSetYaml,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  getInputSetForPipelinePromise,
  useGetInputSetsListForPipeline,
  useCreateInputSetForPipeline,
  useRePostPipelineExecuteWithInputSetYaml,
  StageExecutionResponse,
  useGetStagesExecutionList,
  useRunStagesWithRuntimeInputYaml,
  useRerunStagesWithRuntimeInputYaml
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { usePermission } from '@rbac/hooks/usePermission'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type {
  GitQueryParams,
  InputSetGitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import {
  ALL_STAGE_VALUE,
  getAllStageData,
  getAllStageItem,
  getFeaturePropsForRunPipelineButton,
  mergeTemplateWithInputSetData,
  POLL_INTERVAL,
  SelectedStageData,
  StageSelectionData
} from '@pipeline/utils/runPipelineUtils'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { PipelineActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useGetYamlWithTemplateRefsResolved } from 'services/template-ng'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import { clearRuntimeInput, validatePipeline, getErrorsList } from '../PipelineStudio/StepUtil'
import { PreFlightCheckModal } from '../PreFlightCheckModal/PreFlightCheckModal'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import type { Values } from '../PipelineStudio/StepCommands/StepCommandTypes'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepViewType } from '../AbstractSteps/Step'
import GitPopover from '../GitPopover/GitPopover'
import SaveAsInputSet from './SaveAsInputSet'
import SelectExistingInputsOrProvideNew from './SelectExistingOrProvide'
import ReplacedExpressionInputForm from './ReplacedExpressionInputForm'
import type { KVPair } from '../PipelineVariablesContext/PipelineVariablesContext'
import { ApprovalStageInfo, ExpressionsInfo, RequiredStagesInfo } from './RunStageInfoComponents'
import css from './RunPipelineForm.module.scss'

export interface RunPipelineFormProps extends PipelineType<PipelinePathProps & GitQueryParams> {
  inputSetSelected?: InputSetSelectorProps['value']
  inputSetYAML?: string
  onClose?: () => void
  executionView?: boolean
  mockData?: ResponseJsonNode
  executionInputSetTemplateYaml?: string
  stagesExecuted?: string[]
  executionIdentifier?: string
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
  executionInputSetTemplateYaml = '',
  stagesExecuted,
  executionIdentifier
}: RunPipelineFormProps & InputSetGitQueryParams): React.ReactElement {
  const [skipPreFlightCheck, setSkipPreFlightCheck] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [notifyOnlyMe, setNotifyOnlyMe] = useState<boolean>(false)
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [formErrors, setFormErrors] = useState<FormikErrors<InputSetDTO>>({})
  const [currentPipeline, setCurrentPipeline] = useState<{ pipeline?: PipelineInfoConfig } | undefined>(
    inputSetYAML ? parse(inputSetYAML) : undefined
  )
  const { trackEvent } = useTelemetry()
  const { showError, showSuccess, showWarning } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [runClicked, setRunClicked] = useState(false)
  const [expressionFormState, setExpressionFormState] = useState<KVPair>({})
  const stageSelectionRef = useRef(false)
  const [selectedStageData, setSelectedStageData] = useState<StageSelectionData>({
    allStagesSelected: true,
    selectedStages: [getAllStageData(getString)],
    selectedStageItems: [getAllStageItem(getString)]
  })
  const [loadingInputSetUpdate, setLoadingInputSetUpdate] = useState(false)

  const { data: stageExecutionData } = useGetStagesExecutionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      branch,
      repoIdentifier
    }
  })

  useEffect(() => {
    getInputSetsList()
    getTemplateFromPipeline()
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

  const stageIdentifiers = useMemo((): string[] => {
    let stageIds: string[] = []
    stageIds = stagesExecuted?.length
      ? stagesExecuted
      : selectedStageData.allStagesSelected
      ? []
      : (selectedStageData.selectedStageItems.map(stageData => stageData.value) as string[])
    if (stageIds.includes(ALL_STAGE_VALUE)) {
      stageIds = []
    }
    return stageIds
  }, [stagesExecuted, selectedStageData])

  const {
    data: template,
    loading: loadingTemplate,
    error: getTemplateError,
    refetch: getTemplateFromPipeline
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    body: {
      stageIdentifiers
    },
    lazy: true
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

  const { data: templateRefsResolvedPipeline, loading: loadingResolvedPipeline } = useMutateAsGet(
    useGetYamlWithTemplateRefsResolved,
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        pipelineIdentifier,
        projectIdentifier
      },
      body: {
        originalEntityYaml: yamlStringify(parse(defaultTo(pipelineResponse?.data?.yamlPipeline, ''))?.pipeline)
      }
    }
  )

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

  const { mutate: runStage, loading: runStageLoading } = useRunStagesWithRuntimeInputYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier
  })
  const { executionId } = useQueryParams<{ executionId?: string }>()
  const pipelineExecutionId = executionIdentifier ?? executionId
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
    originalExecutionId: defaultTo(pipelineExecutionId, ''),
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })
  const { mutate: reRunStages, loading: reRunStagesLoading } = useRerunStagesWithRuntimeInputYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    originalExecutionId: defaultTo(pipelineExecutionId, '')
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

  const { mutate: mergeInputSet, loading: loadingMergeInputSetUpdate } =
    useGetMergeInputSetFromPipelineTemplateWithListInput({
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

  const executionStageList = useMemo((): SelectOption[] => {
    const executionStages: SelectOption[] =
      stageExecutionData?.data?.map((execStage: StageExecutionResponse) => {
        return {
          label: defaultTo(execStage?.stageName, ''),
          value: defaultTo(execStage?.stageIdentifier, '')
        }
      }) || []
    executionStages.unshift(getAllStageItem(getString))

    if (stagesExecuted?.length) {
      const updatedSelectedStageList: SelectedStageData[] = []
      const updatedSelectedItems: SelectOption[] = []
      stagesExecuted.forEach(stageExucuted => {
        const selectedStage = stageExecutionData?.data?.find(stageData => stageData.stageIdentifier === stageExucuted)
        selectedStage && updatedSelectedStageList.push(selectedStage)
        selectedStage &&
          updatedSelectedItems.push({
            label: selectedStage?.stageName as string,
            value: selectedStage?.stageIdentifier as string
          })
      })

      setSelectedStageData({
        selectedStages: updatedSelectedStageList,
        selectedStageItems: updatedSelectedItems,
        allStagesSelected: false
      })
      setSkipPreFlightCheck(true)
    } else {
      setSelectedStageData({
        selectedStages: [getAllStageData(getString)],
        selectedStageItems: [getAllStageItem(getString)],
        allStagesSelected: true
      })
    }
    return executionStages
  }, [stageExecutionData?.data])
  const inputSets = inputSetResponse?.data?.content

  const yamlTemplate = useMemo(() => {
    return parse(defaultTo(template?.data?.inputSetTemplateYaml, ''))?.pipeline
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    const parsedPipelineYaml = parse(defaultTo(template?.data?.inputSetTemplateYaml, '')) || {}
    const toBeUpdated = merge(parsedPipelineYaml, currentPipeline || {}) as {
      pipeline: PipelineInfoConfig
    }
    setCurrentPipeline(toBeUpdated)
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  useEffect(() => {
    if (getTemplateError) {
      showError(getTemplateError.message)
    }
  }, [getTemplateError])

  const shouldMakeMergeInputSetCall = useCallback(() => {
    return (selectedInputSets && selectedInputSets?.length > 1) || selectedInputSets?.[0]?.type === 'OVERLAY_INPUT_SET'
  }, [selectedInputSets])

  const shouldMakeInputSetCall = useCallback(() => {
    return selectedInputSets && selectedInputSets.length === 1
  }, [selectedInputSets])

  const makeMergeInputSetCall = useCallback(
    async (parsedTemplate: { pipeline: PipelineInfoConfig }) => {
      try {
        const data = await mergeInputSet({
          inputSetReferences: selectedInputSets?.map(item => item.value as string),
          stageIdentifiers: selectedStageData.allStagesSelected
            ? []
            : selectedStageData.selectedStageItems.map(stageData => stageData.value as string)
        })
        if (data?.data?.pipelineYaml) {
          const inputSetPortion = parse(data.data.pipelineYaml) as {
            pipeline: PipelineInfoConfig
          }
          const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
          setCurrentPipeline(toBeUpdated)
        }
      } catch (e: any) {
        showError(getErrorInfoFromErrorObject(e), undefined, 'pipeline.feth.inputSetTemplateYaml.error')
      }
    },
    [selectedInputSets]
  )

  const makeInputSetGetCall = useCallback(
    async (parsedTemplate: { pipeline: PipelineInfoConfig }) => {
      setLoadingInputSetUpdate(true)
      const firstInputSet = selectedInputSets?.[0]
      const data = await getInputSetForPipelinePromise({
        inputSetIdentifier: firstInputSet?.value as string,
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          pipelineIdentifier,
          repoIdentifier: firstInputSet?.gitDetails?.repoIdentifier,
          branch: firstInputSet?.gitDetails?.branch
        }
      })
      setLoadingInputSetUpdate(false)
      if (data?.data?.inputSetYaml) {
        if (firstInputSet?.type === 'INPUT_SET') {
          const inputSetPortion = pick(parse(data.data.inputSetYaml)?.inputSet, 'pipeline') as {
            pipeline: PipelineInfoConfig
          }
          const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
          setCurrentPipeline(toBeUpdated)
        }
      }
    },
    [selectedInputSets]
  )

  useEffect(() => {
    if (template?.data?.inputSetTemplateYaml) {
      const parsedTemplate = parse(template?.data?.inputSetTemplateYaml) as { pipeline: PipelineInfoConfig }
      if (shouldMakeMergeInputSetCall()) {
        makeMergeInputSetCall(parsedTemplate)
      } else if (shouldMakeInputSetCall()) {
        makeInputSetGetCall(parsedTemplate)
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

  const pipeline: PipelineInfoConfig | undefined = parse(defaultTo(pipelineResponse?.data?.yamlPipeline, ''))?.pipeline

  const resolvedPipeline: PipelineInfoConfig | undefined = parse(
    defaultTo(templateRefsResolvedPipeline?.data?.mergedPipelineYaml, '')
  )

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

  const handleRunPipeline = useCallback(
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
      const expressionValues: KVPair = {}
      Object.entries(expressionFormState).forEach(([key, value]: string[]) => {
        expressionValues[key] = value
      })

      try {
        let response
        if (isEmpty(pipelineExecutionId)) {
          response = selectedStageData.allStagesSelected
            ? await runPipeline(
                !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : ''
              )
            : await runStage({
                runtimeInputYaml: !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : '',
                stageIdentifiers: stageIdentifiers,
                expressionValues
              })
        } else {
          response = selectedStageData.allStagesSelected
            ? await reRunPipeline(
                !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : ''
              )
            : await reRunStages({
                runtimeInputYaml: !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : '',
                stageIdentifiers: stageIdentifiers,
                expressionValues
              })
        }

        const data = response.data
        const governanceMetadata = data?.planExecution?.governanceMetadata

        if (response.status === 'SUCCESS') {
          if (onClose) {
            onClose()
          }
          if (response.data) {
            showSuccess(getString('runPipelineForm.pipelineRunSuccessFully'))
            history.push({
              pathname: routes.toExecutionPipelineView({
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                executionIdentifier: defaultTo(data?.planExecution?.uuid, ''),
                accountId,
                module
              }),
              state: {
                shouldShowGovernanceEvaluations:
                  governanceMetadata?.status === 'error' || governanceMetadata?.status === 'warning',
                governanceMetadata
              }
            })
            trackEvent(PipelineActions.StartedExecution, { module })
          }
        }
      } catch (error: any) {
        showWarning(defaultTo(getErrorInfoFromErrorObject(error), getString('runPipelineForm.runPipelineFailed')))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      runPipeline,
      runStage,
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
      formErrors,
      selectedStageData
    ]
  )

  const [existingProvide, setExistingProvide] = useState('existing')

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
        const presentPipeline = parse(defaultTo(yamlHandler?.getLatestYaml(), '')) as { pipeline: PipelineInfoConfig }
        setCurrentPipeline(presentPipeline)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml]
  )

  const blockedStagesSelected = useMemo(() => {
    let areDependentStagesSelected = false
    if (selectedStageData.allStagesSelected) {
      return areDependentStagesSelected
    }

    const allRequiredStagesUpdated: string[] = []
    const stagesSelectedMap: { [key: string]: SelectedStageData } = keyBy(
      selectedStageData.selectedStages,
      'stageIdentifier'
    )
    selectedStageData.selectedStages.forEach((stage: StageExecutionResponse) => {
      if (stage.toBeBlocked) {
        allRequiredStagesUpdated.push(...(stage.stagesRequired || []))
      }
    })

    allRequiredStagesUpdated.forEach((stageId: string) => {
      if (!stagesSelectedMap[stageId]) {
        areDependentStagesSelected = true
      }
    })

    return areDependentStagesSelected
  }, [selectedStageData])

  useEffect(() => {
    try {
      if (yamlHandler) {
        const Interval = window.setInterval(() => {
          const parsedYaml = parse(defaultTo(yamlHandler.getLatestYaml(), ''))
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

  const updateExpressionValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target) {
      return
    }

    const keyName: string = e.target.name
    const exprValue: string = defaultTo(e.target.value, '').trim()
    setExpressionFormState(
      (oldState: KVPair): KVPair => ({
        ...oldState,
        [keyName]: exprValue
      })
    )
    if (formErrors) {
      const formErrorsUpdated = { ...formErrors }
      if (!(formErrors as any)[keyName] && isEmpty(exprValue)) {
        ;(formErrorsUpdated as any)[keyName] = getString('pipeline.expressionRequired')
      } else if ((formErrors as any)[keyName] && !isEmpty(exprValue)) {
        delete (formErrorsUpdated as any)[keyName]
      }

      setFormErrors(formErrorsUpdated)
    }
  }

  const getFormErrors = async (
    latestPipeline: { pipeline: PipelineInfoConfig },
    latestYamlTemplate: PipelineInfoConfig,
    orgPipeline: PipelineInfoConfig | undefined
  ) => {
    let errors = formErrors
    function validateErrors(): Promise<FormikErrors<InputSetDTO>> {
      return new Promise(resolve => {
        setTimeout(() => {
          const validatedErrors =
            (validatePipeline({
              pipeline: { ...clearRuntimeInput(latestPipeline.pipeline) },
              template: latestYamlTemplate,
              originalPipeline: orgPipeline,
              getString,
              viewType: StepViewType.DeploymentForm
            }) as any) || formErrors
          resolve(validatedErrors)
        }, 300)
      })
    }
    if (latestPipeline?.pipeline && latestYamlTemplate && orgPipeline) {
      errors = await validateErrors()
      const expressionErrors: KVPair = {}

      // vaidate replacedExpressions
      if (template?.data?.replacedExpressions?.length) {
        template.data.replacedExpressions.forEach((value: string) => {
          const currValue = defaultTo(expressionFormState[value], '')
          if (currValue.trim() === '') expressionErrors[value] = getString('pipeline.expressionRequired')
        })
      }
      setFormErrors({ ...errors, ...expressionErrors })
    }
    return errors
  }

  const shouldShowPageSpinner = useCallback(() => {
    return (
      loadingPipeline ||
      loadingResolvedPipeline ||
      loadingTemplate ||
      runLoading ||
      runStageLoading ||
      inputSetLoading ||
      reRunLoading ||
      reRunStagesLoading
    )
  }, [
    loadingPipeline,
    loadingResolvedPipeline,
    loadingTemplate,
    runLoading,
    runStageLoading,
    inputSetLoading,
    reRunLoading,
    reRunStagesLoading
  ])

  if (shouldShowPageSpinner()) {
    return <PageSpinner />
  }

  const checkIfRuntimeInputsNotPresent = (): string | undefined => {
    if (executionView && !executionInputSetTemplateYaml) {
      return getString('pipeline.inputSets.noRuntimeInputsWhileExecution')
    } else if (
      !executionView &&
      resolvedPipeline &&
      currentPipeline &&
      !template?.data?.inputSetTemplateYaml &&
      !getTemplateError
    ) {
      /*
      We don't have any runtime inputs required for running this pipeline
        - if API doesn't fail and
        - the inputSetTemplateYaml is not present
      */
      return getString('runPipelineForm.noRuntimeInput')
    }
  }

  const onExistingProvideRadioChange = (ev: FormEvent<HTMLInputElement>): void => {
    setExistingProvide((ev.target as HTMLInputElement).value)
  }

  const renderPipelineInputSetForm = () => {
    const showSpinner = loadingMergeInputSetUpdate || loadingInputSetUpdate
    if (showSpinner) {
      return (
        <PageSpinner
          className={css.inputSetsUpdatingSpinner}
          message={
            loadingMergeInputSetUpdate
              ? getString('pipeline.inputSets.applyingInputSets')
              : getString('pipeline.inputSets.applyingInputSet')
          }
        />
      )
    }
    if (currentPipeline?.pipeline && resolvedPipeline && template?.data?.inputSetTemplateYaml) {
      const templateSource = executionView ? executionInputSetTemplateYaml : template.data.inputSetTemplateYaml
      return (
        <>
          {existingProvide === 'existing' ? <div className={css.divider} /> : null}
          <PipelineInputSetForm
            originalPipeline={resolvedPipeline}
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

  const onStageSelect = (items: SelectOption[]): void => {
    stageSelectionRef.current = true
    const allStagesSelected = items.find(item => item.value === ALL_STAGE_VALUE)
    const updatedSelectedStages: SelectedStageData[] = []
    const hasOnlyAllStagesUnChecked =
      items.length === stageExecutionData?.data?.length &&
      !items.find(item => item.value === getAllStageItem(getString).value)
    if (
      (!selectedStageData.allStagesSelected && allStagesSelected) ||
      hasOnlyAllStagesUnChecked ||
      items?.length === 0
    ) {
      const updatedSelectedStageItems = []
      updatedSelectedStageItems.push(getAllStageItem(getString))
      updatedSelectedStages.push(getAllStageData(getString))

      setSelectedStageData({
        selectedStages: updatedSelectedStages,
        selectedStageItems: updatedSelectedStageItems,
        allStagesSelected: true
      })
    } else {
      const newItems = items.filter((option: SelectOption) => {
        const stageDetails = stageExecutionData?.data?.find(stageData => stageData.stageIdentifier === option.value)
        stageDetails && updatedSelectedStages.push(stageDetails)
        return option.value !== ALL_STAGE_VALUE
      })
      setSelectedStageData({
        selectedStages: updatedSelectedStages,
        selectedStageItems: newItems,
        allStagesSelected: false
      })
    }
    setSkipPreFlightCheck(true)
  }

  const getFormikInitialValues = () => {
    if (isEmpty(yamlTemplate)) {
      return {}
    } else if (pipeline && currentPipeline && template?.data?.inputSetTemplateYaml) {
      if (currentPipeline?.pipeline) {
        return clearRuntimeInput(currentPipeline.pipeline)
      }
      return {}
    } else if (currentPipeline?.pipeline) {
      return clearRuntimeInput(currentPipeline.pipeline)
    }
    return {}
  }

  const runModalHeader = () => {
    return (
      <div className={css.runModalHeader}>
        <Heading
          level={2}
          font={{ weight: 'bold' }}
          color={Color.BLACK_100}
          className={css.runModalHeaderTitle}
          data-tooltip-id="runPipelineFormTitle"
        >
          {getString('runPipeline')}
          <HarnessDocTooltip tooltipId="runPipelineFormTitle" useStandAlone={true} />
        </Heading>
        {isGitSyncEnabled && (
          <GitSyncStoreProvider>
            <GitPopover
              data={pipelineResponse?.data?.gitDetails ?? {}}
              iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
            />
          </GitSyncStoreProvider>
        )}

        <div>
          <MultiSelectDropDown
            popoverClassName={css.disabledStageDropdown}
            hideItemCount={selectedStageData.allStagesSelected}
            disabled={Boolean(pipelineExecutionId)}
            buttonTestId={'stage-select'}
            onChange={onStageSelect}
            onPopoverClose={() => {
              if (stageSelectionRef.current) {
                getTemplateFromPipeline()?.then(() => {
                  stageSelectionRef.current = false
                })
              }
            }}
            value={selectedStageData.selectedStageItems}
            items={executionStageList}
            minWidth={150}
            usePortal={true}
            placeholder={selectedStageData.allStagesSelected ? getString('pipeline.allStages') : getString('stages')}
            className={cx({ [css.stagesDropdown]: isGitSyncEnabled })}
          />
        </div>

        <div className={css.optionBtns}>
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={nextMode => {
              handleModeSwitch(nextMode)
            }}
            disableToggle={!template?.data?.inputSetTemplateYaml}
          />
        </div>
      </div>
    )
  }

  const runIndividualStageInfo = (): JSX.Element => {
    return (
      <>
        <RequiredStagesInfo
          selectedStageData={selectedStageData}
          blockedStagesSelected={blockedStagesSelected}
          getString={getString}
        />
        <ApprovalStageInfo pipeline={pipeline} selectedStageData={selectedStageData} />
        <ExpressionsInfo template={template} getString={getString} />
        <ReplacedExpressionInputForm
          updateExpressionValue={updateExpressionValue}
          expressions={template?.data?.replacedExpressions}
        />
      </>
    )
  }

  const showInputSetSelector = () => {
    return pipeline && currentPipeline && template?.data?.inputSetTemplateYaml && existingProvide === 'existing'
  }

  const showPipelineInputSetForm = () => {
    return existingProvide === 'provide' || selectedInputSets?.length || executionView
  }

  const showVoidPipelineInputSetForm = () => {
    return existingProvide === 'existing' && selectedInputSets?.length
  }

  const visualView = (submitForm: () => void) => {
    const noRuntimeInputs = checkIfRuntimeInputsNotPresent()
    return (
      <div
        className={cx(executionView ? css.runModalFormContentExecutionView : css.runModalFormContent, {
          [css.noRuntimeInput]: (template as any)?.data?.replacedExpressions?.length > 0 && noRuntimeInputs
        })}
        data-testid="runPipelineVisualView"
        onKeyDown={ev => {
          if (ev.key === 'Enter') {
            ev.preventDefault()
            ev.stopPropagation()
            setRunClicked(true)

            if ((!selectedInputSets || selectedInputSets.length === 0) && existingProvide === 'existing') {
              setExistingProvide('provide')
            } else {
              submitForm()
            }
          }
        }}
      >
        <FormikForm>
          {noRuntimeInputs ? (
            <Layout.Horizontal padding="medium" margin="medium">
              <Text>{noRuntimeInputs}</Text>
            </Layout.Horizontal>
          ) : (
            <>
              {inputSets?.length ? (
                <>
                  {executionView ? null : (
                    <Layout.Vertical
                      className={css.pipelineHeader}
                      padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
                    >
                      <SelectExistingInputsOrProvideNew
                        existingProvide={existingProvide}
                        onExistingProvideRadioChange={onExistingProvideRadioChange}
                      />

                      {showInputSetSelector() ? (
                        <GitSyncStoreProvider>
                          <InputSetSelector
                            pipelineIdentifier={pipelineIdentifier}
                            onChange={inputsets => {
                              setSelectedInputSets(inputsets)
                            }}
                            value={selectedInputSets}
                          />
                        </GitSyncStoreProvider>
                      ) : null}
                    </Layout.Vertical>
                  )}
                </>
              ) : null}
              {showPipelineInputSetForm() ? renderPipelineInputSetForm() : null}
              {showVoidPipelineInputSetForm() ? <div className={css.noPipelineInputSetForm} /> : null}
            </>
          )}
        </FormikForm>
      </div>
    )
  }

  const checkboxActions = () => {
    return (
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
            label={getString('pipeline.runPipelineForm.notifyOnlyMe')}
            checked={notifyOnlyMe}
            onChange={e => setNotifyOnlyMe(e.currentTarget.checked)}
          />
        </Tooltip>
      </Layout.Horizontal>
    )
  }

  const runPipelineContent = (
    <>
      <Formik<Values>
        initialValues={getFormikInitialValues() as Values}
        formName="runPipeline"
        onSubmit={values => {
          handleRunPipeline(values as any)
        }}
        enableReinitialize
        validate={async values => {
          const latestPipeline = { ...currentPipeline, pipeline: values as PipelineInfoConfig }
          setCurrentPipeline(latestPipeline)
          const runPipelineFormErrors = await getFormErrors(latestPipeline, yamlTemplate, pipeline)
          // https://github.com/formium/formik/issues/1392
          throw runPipelineFormErrors
        }}
      >
        {({ submitForm, values }) => {
          return (
            <Layout.Vertical>
              {executionView ? null : (
                <>
                  {runModalHeader()}
                  {runClicked ? <ErrorsStrip formErrors={formErrors} /> : null}
                </>
              )}
              {runIndividualStageInfo()}
              {selectedView === SelectedView.VISUAL ? (
                visualView(submitForm)
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
              {executionView ? null : checkboxActions()}
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
                      featuresProps={getFeaturePropsForRunPipelineButton(template?.data?.modules)}
                      permission={{
                        resource: {
                          resourceIdentifier: pipeline?.identifier as string,
                          resourceType: ResourceType.PIPELINE
                        },
                        permission: PermissionIdentifier.EXECUTE_PIPELINE
                      }}
                      disabled={blockedStagesSelected || (getErrorsList(formErrors).errorCount > 0 && runClicked)}
                    />
                    <div className={css.secondaryButton}>
                      <Button
                        variation={ButtonVariation.TERTIARY}
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
                    key="saveasinput"
                    pipeline={pipeline}
                    currentPipeline={currentPipeline}
                    values={values}
                    template={template?.data?.inputSetTemplateYaml}
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
    <div className={css.runFormExecutionView}>{runPipelineContent}</div>
  ) : (
    <RunPipelineFormWrapper
      accountId={accountId}
      orgIdentifier={orgIdentifier}
      pipelineIdentifier={pipelineIdentifier}
      projectIdentifier={projectIdentifier}
      module={module}
      pipeline={pipeline}
    >
      {runPipelineContent}
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
      <div className={css.runForm}>{children}</div>
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

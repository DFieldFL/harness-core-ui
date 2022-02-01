/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import type { FormikErrors, FormikProps } from 'formik'
import { useHistory, useParams } from 'react-router-dom'
import {
  Layout,
  SelectOption,
  Color,
  Text,
  Switch,
  PageSpinner,
  VisualYamlSelectedView as SelectedView
} from '@wings-software/uicore'
import { parse } from 'yaml'
import { isEmpty, isUndefined, merge, cloneDeep, get, defaultTo, set } from 'lodash-es'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { Page, useToaster } from '@common/exports'
import Wizard from '@common/components/Wizard/Wizard'
import { connectorUrlType } from '@connectors/constants'
import routes from '@common/RouteDefinitions'
import {
  PipelineInfoConfig,
  useGetConnector,
  GetConnectorQueryParams,
  getConnectorListV2Promise,
  Failure
} from 'services/cd-ng'
import {
  useGetPipeline,
  useGetTemplateFromPipeline,
  useCreateTrigger,
  useGetTrigger,
  useUpdateTrigger,
  NGTriggerConfigV2,
  NGTriggerSourceV2,
  useGetSchemaYaml
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { clearRuntimeInput, validatePipeline } from '@pipeline/components/PipelineStudio/StepUtil'
import type { KVPair } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getIdentifierFromValue,
  getScopeFromValue,
  getScopeFromDTO
} from '@common/components/EntityReference/EntityReference'
import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction,
  CompletionItemInterface
} from '@common/interfaces/YAMLBuilderProps'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useMutateAsGet } from '@common/hooks'
import {
  scheduleTabsId,
  getDefaultExpressionBreakdownValues,
  resetScheduleObject,
  getBreakdownValues
} from './views/subviews/ScheduleUtils'
import type { AddConditionInterface } from './views/AddConditionsSection'
import { GitSourceProviders } from './utils/TriggersListUtils'
import {
  getConnectorName,
  getConnectorValue,
  isRowFilled,
  isArtifactOrManifestTrigger,
  FlatValidArtifactFormikValuesInterface,
  clearRuntimeInputValue,
  replaceTriggerDefaultBuild,
  TriggerDefaultFieldList,
  PRIMARY_ARTIFACT,
  clearNullUndefined,
  ConnectorRefInterface,
  FlatInitialValuesInterface,
  FlatOnEditValuesInterface,
  FlatValidWebhookFormikValuesInterface,
  FlatValidScheduleFormikValuesInterface,
  getQueryParamsOnNew,
  getWizardMap,
  PayloadConditionTypes,
  EventConditionTypes,
  ResponseStatus,
  TriggerTypes,
  scheduledTypes,
  getValidationSchema,
  TriggerConfigDTO,
  eventTypes
} from './utils/TriggersWizardPageUtils'
import {
  ArtifactTriggerConfigPanel,
  WebhookTriggerConfigPanel,
  WebhookConditionsPanel,
  WebhookPipelineInputPanel,
  SchedulePanel,
  TriggerOverviewPanel
} from './views'
import ArtifactConditionsPanel from './views/ArtifactConditionsPanel'

import css from './TriggersWizardPage.module.scss'

const replaceRunTimeVariables = ({
  manifestType,
  artifactType,
  selectedArtifact
}: {
  artifactType: string
  selectedArtifact: any
  manifestType?: string
}) => {
  if (manifestType) {
    if (selectedArtifact?.spec?.chartVersion) {
      // hardcode manifest chart version to default
      selectedArtifact.spec.chartVersion = replaceTriggerDefaultBuild({
        chartVersion: selectedArtifact?.spec?.chartVersion
      })
    } else if (!isEmpty(selectedArtifact) && selectedArtifact?.spec?.chartVersion === '') {
      selectedArtifact.spec.chartVersion = TriggerDefaultFieldList.chartVersion
    }
  } else if (artifactType && selectedArtifact?.spec?.tag) {
    selectedArtifact.spec.tag = TriggerDefaultFieldList.build
  }
}

const replaceStageManifests = ({ filteredStage, selectedArtifact }: { filteredStage: any; selectedArtifact: any }) => {
  const stageArtifacts = filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests
  const stageArtifactIdx = filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests?.findIndex(
    (item: any) => item.manifest?.identifier === selectedArtifact?.identifier
  )

  if (stageArtifactIdx >= 0) {
    stageArtifacts[stageArtifactIdx].manifest = selectedArtifact
  }
}

const replaceStageArtifacts = ({ filteredStage, selectedArtifact }: { filteredStage: any; selectedArtifact: any }) => {
  const stageArtifacts = filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts
  const stageArtifactIdx =
    filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars?.findIndex(
      (item: any) => item.sidecar?.identifier === selectedArtifact?.identifier
    )

  if (stageArtifactIdx >= 0) {
    stageArtifacts['sidecars'][stageArtifactIdx].sidecar = selectedArtifact
  }
}

const replaceEventConditions = ({
  values,
  persistIncomplete,
  triggerYaml
}: {
  values: any
  persistIncomplete: boolean
  triggerYaml: any
}) => {
  const { versionOperator, versionValue, buildOperator, buildValue, eventConditions = [] } = values
  if (
    ((versionOperator && versionValue?.trim()) || (persistIncomplete && (versionOperator || versionValue?.trim()))) &&
    !eventConditions.some((eventCondition: AddConditionInterface) => eventCondition.key === EventConditionTypes.VERSION)
  ) {
    eventConditions.unshift({
      key: EventConditionTypes.VERSION,
      operator: versionOperator || '',
      value: versionValue || ''
    })
  } else if (
    ((buildOperator && buildValue?.trim()) || (persistIncomplete && (buildOperator || buildValue?.trim()))) &&
    !eventConditions.some((eventCondition: AddConditionInterface) => eventCondition.key === EventConditionTypes.BUILD)
  ) {
    eventConditions.unshift({
      key: EventConditionTypes.BUILD,
      operator: buildOperator || '',
      value: buildValue || ''
    })
  }

  if (triggerYaml.source?.spec) {
    const sourceSpecSpec = { ...triggerYaml.source?.spec.spec }
    sourceSpecSpec.eventConditions = persistIncomplete
      ? eventConditions
      : eventConditions.filter((eventCondition: AddConditionInterface) => isRowFilled(eventCondition))
    triggerYaml.source.spec.spec = sourceSpecSpec
  }
}

const getArtifactManifestTriggerYaml = ({
  values: val,
  manifestType,
  orgIdentifier,
  enabledStatus,
  projectIdentifier,
  pipelineIdentifier,
  persistIncomplete = false
}: {
  values: any

  orgIdentifier: string
  enabledStatus: boolean
  projectIdentifier: string
  pipelineIdentifier: string
  manifestType?: string
  persistIncomplete?: boolean
}): TriggerConfigDTO => {
  const {
    name,
    identifier,
    description,
    tags,
    pipeline: pipelineRuntimeInput,
    triggerType: formikValueTriggerType,
    selectedArtifact,
    stageId,
    manifestType: onEditManifestType,
    artifactType
  } = val

  replaceRunTimeVariables({ manifestType, artifactType, selectedArtifact })
  const newPipelineObj = { ...pipelineRuntimeInput }
  const filteredStage = newPipelineObj.stages?.find((item: any) => item.stage?.identifier === stageId)
  if (manifestType) {
    replaceStageManifests({ filteredStage, selectedArtifact })
  } else if (artifactType) {
    replaceStageArtifacts({ filteredStage, selectedArtifact })
  }

  // actions will be required thru validation
  const stringifyPipelineRuntimeInput = yamlStringify({
    pipeline: clearNullUndefined(newPipelineObj)
  })

  // clears any runtime inputs
  const artifactSourceSpec = clearRuntimeInputValue(
    cloneDeep(
      parse(
        JSON.stringify({
          spec: selectedArtifact?.spec
        }) || ''
      )
    )
  )
  const triggerYaml: NGTriggerConfigV2 = {
    name,
    identifier,
    enabled: enabledStatus,
    description,
    tags,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    source: {
      type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
      spec: {
        stageIdentifier: stageId,
        manifestRef: selectedArtifact?.identifier,
        type: onEditManifestType ? onEditManifestType : artifactType,
        ...artifactSourceSpec
      }
    },
    inputYaml: stringifyPipelineRuntimeInput
  }
  if (artifactType) {
    if (triggerYaml?.source?.spec && Object.getOwnPropertyDescriptor(triggerYaml?.source?.spec, 'manifestRef')) {
      delete triggerYaml.source.spec.manifestRef
    }
    if (triggerYaml?.source?.spec) {
      triggerYaml.source.spec.artifactRef = selectedArtifact?.identifier
        ? selectedArtifact?.identifier
        : PRIMARY_ARTIFACT
    }
  }

  replaceEventConditions({ values: val, persistIncomplete, triggerYaml })

  return clearNullUndefined(triggerYaml)
}

const TriggersWizardPage: React.FC = (): JSX.Element => {
  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      targetIdentifier: string
      triggerIdentifier: string
    }>
  >()
  const history = useHistory()
  const { location } = useHistory()
  const { getString } = useStrings()
  // use passed params on new trigger
  const queryParamsOnNew = location?.search ? getQueryParamsOnNew(location.search) : undefined
  const {
    sourceRepo: sourceRepoOnNew,
    triggerType: triggerTypeOnNew,
    manifestType,
    artifactType
  } = queryParamsOnNew || {}

  const { data: template } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier
    },
    body: {
      stageIdentifiers: []
    }
  })

  const { data: triggerResponse, loading: loadingGetTrigger } = useGetTrigger({
    // const { data: triggerResponse, refetch: getTriggerDetails, loading: loadingGetTrigger } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
    // lazy: true
  })

  const [connectorScopeParams, setConnectorScopeParams] = useState<GetConnectorQueryParams | undefined>(undefined)

  const { mutate: createTrigger, loading: createTriggerLoading } = useCreateTrigger({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateTrigger, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const [errorToasterMessage, setErrorToasterMessage] = useState<string>('')

  const { loading: loadingYamlSchema, data: triggerSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Triggers',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      })
    }
  })

  const convertFormikValuesToYaml = (values: any): { trigger: TriggerConfigDTO } | undefined => {
    if (values.triggerType === TriggerTypes.WEBHOOK) {
      const res = getWebhookTriggerYaml({ values, persistIncomplete: true })
      // remove invalid values
      if (res?.source?.spec?.spec && !res.source.spec.spec.actions) {
        delete res.source.spec.spec.actions
      }
      if (res?.source?.spec?.spec && !res.source.spec.spec.event) {
        delete res.source.spec.spec.event
      }

      return { trigger: res }
    } else if (values.triggerType === TriggerTypes.SCHEDULE) {
      const res = getScheduleTriggerYaml({ values })

      return { trigger: res }
    } else if (values.triggerType === TriggerTypes.MANIFEST || values.triggerType === TriggerTypes.ARTIFACT) {
      const res = getArtifactManifestTriggerYaml({
        values,
        persistIncomplete: true,
        manifestType,
        enabledStatus,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier
      })

      return { trigger: res }
    }
  }

  const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
    fileName: `${triggerResponse?.data?.identifier ?? 'Trigger'}.yaml`,
    entityType: 'Triggers',
    width: 'calc(100vw - 350px)',
    height: 'calc(100vh - 280px)',
    showSnippetSection: false,
    yamlSanityConfig: {
      removeEmptyString: false,
      removeEmptyObject: false,
      removeEmptyArray: false
    }
  }

  const [enabledStatus, setEnabledStatus] = useState<boolean>(true)
  const [currentPipeline, setCurrentPipeline] = useState<{ pipeline?: PipelineInfoConfig } | undefined>(undefined)
  const [wizardKey, setWizardKey] = useState<number>(0)
  const [artifactManifestType, setArtifactManifestType] = useState<string | undefined>(undefined)
  const [mergedPipelineKey, setMergedPipelineKey] = useState<number>(0)

  const [onEditInitialValues, setOnEditInitialValues] = useState<
    | FlatOnEditValuesInterface
    | {
        triggerType: NGTriggerSourceV2['type']
        pipeline?: PipelineInfoConfig | Record<string, never>
        originalPipeline?: PipelineInfoConfig
        identifier?: string
        connectorRef?: { identifier?: string; scope?: string }
        inputSetTemplateYamlObj?: {
          pipeline: PipelineInfoConfig | Record<string, never>
        }
      }
  >({ triggerType: triggerTypeOnNew })

  useEffect(() => {
    if (onEditInitialValues?.pipeline && template?.data?.inputSetTemplateYaml && mergedPipelineKey < 1) {
      const newOnEditPipeline = merge(
        parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
        onEditInitialValues.pipeline || {}
      )
      const newPipeline = clearRuntimeInput(newOnEditPipeline)
      setOnEditInitialValues({
        ...onEditInitialValues,
        pipeline: newPipeline as unknown as PipelineInfoConfig
      })
      setCurrentPipeline({ pipeline: newPipeline }) // will reset initialValues
      setMergedPipelineKey(1)
    } else if (template?.data?.inputSetTemplateYaml) {
      setCurrentPipeline(
        merge(clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || '')), currentPipeline || {}) as {
          pipeline: PipelineInfoConfig
        }
      )
    }
  }, [template?.data?.inputSetTemplateYaml, onEditInitialValues?.pipeline])

  useEffect(() => {
    if (triggerResponse?.data?.enabled === false) {
      setEnabledStatus(false)
    }
  }, [triggerResponse?.data?.enabled])

  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const originalPipeline: PipelineInfoConfig | undefined = parse(
    (pipelineResponse?.data?.yamlPipeline as any) || ''
  )?.pipeline

  useEffect(() => {
    if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.WEBHOOK) {
      const newOnEditInitialValues = getWebhookTriggerValues({
        triggerResponseYaml: triggerResponse.data.yaml
      })
      setOnEditInitialValues({
        ...onEditInitialValues,
        ...newOnEditInitialValues
      })
    } else if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.SCHEDULE) {
      const newOnEditInitialValues = getScheduleTriggerValues({
        triggerResponseYaml: triggerResponse.data.yaml
      })
      setOnEditInitialValues({
        ...onEditInitialValues,
        ...newOnEditInitialValues
      })
    } else if (
      triggerResponse?.data?.yaml &&
      (triggerResponse.data.type === TriggerTypes.MANIFEST || triggerResponse.data.type === TriggerTypes.ARTIFACT)
    ) {
      const newOnEditInitialValues = getArtifactTriggerValues({
        triggerResponseYaml: triggerResponse?.data?.yaml
      })
      setOnEditInitialValues({
        ...onEditInitialValues,
        ...newOnEditInitialValues
      })
    }
  }, [triggerIdentifier, triggerResponse, template])

  const returnToTriggersPage = (): void => {
    history.push(
      routes.toTriggersPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })
    )
  }
  const { showSuccess } = useToaster()

  const getWebhookTriggerYaml = ({
    values: val,
    persistIncomplete = false
  }: {
    values: FlatValidWebhookFormikValuesInterface
    persistIncomplete?: boolean
  }): TriggerConfigDTO => {
    const {
      name = '',
      identifier,
      description = '',
      tags,
      pipeline: pipelineRuntimeInput,
      sourceRepo: formikValueSourceRepo,
      triggerType: formikValueTriggerType,
      repoName,
      connectorRef,
      event = '',
      actions,
      sourceBranchOperator,
      sourceBranchValue,
      targetBranchOperator,
      targetBranchValue,
      changedFilesOperator,
      changedFilesValue,
      tagConditionOperator,
      tagConditionValue,
      headerConditions = [],
      payloadConditions = [],
      jexlCondition,
      secureToken,
      autoAbortPreviousExecutions = false
    } = val

    const stringifyPipelineRuntimeInput = yamlStringify({
      pipeline: clearNullUndefined(pipelineRuntimeInput)
    })

    if (formikValueSourceRepo !== GitSourceProviders.CUSTOM.value) {
      if (
        ((targetBranchOperator && targetBranchValue?.trim()) ||
          (persistIncomplete && (targetBranchOperator || targetBranchValue?.trim()))) &&
        !payloadConditions.some(pc => pc.key === PayloadConditionTypes.TARGET_BRANCH) &&
        event !== eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.TARGET_BRANCH,
          operator: targetBranchOperator || '',
          value: targetBranchValue || ''
        })
      }
      if (
        ((sourceBranchOperator && sourceBranchValue?.trim()) ||
          (persistIncomplete && (sourceBranchOperator || sourceBranchValue?.trim()))) &&
        !payloadConditions.some((pc: AddConditionInterface) => pc.key === PayloadConditionTypes.SOURCE_BRANCH) &&
        event !== eventTypes.PUSH &&
        event !== eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.SOURCE_BRANCH,
          operator: sourceBranchOperator || '',
          value: sourceBranchValue || ''
        })
      }
      if (
        ((changedFilesOperator && changedFilesValue?.trim()) ||
          (persistIncomplete && (changedFilesOperator || changedFilesValue?.trim()))) &&
        !payloadConditions.some((pc: AddConditionInterface) => pc.key === PayloadConditionTypes.CHANGED_FILES) &&
        event !== eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.CHANGED_FILES,
          operator: changedFilesOperator || '',
          value: changedFilesValue || ''
        })
      }
      if (
        ((tagConditionOperator && tagConditionValue?.trim()) ||
          (persistIncomplete && (tagConditionOperator || tagConditionValue?.trim()))) &&
        !payloadConditions.some((pc: AddConditionInterface) => pc.key === PayloadConditionTypes.TAG) &&
        event === eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.TAG,
          operator: tagConditionOperator || '',
          value: tagConditionValue || ''
        })
      }

      // actions will be required thru validation
      const actionsValues = (actions as unknown as SelectOption[])?.map(action => action.value)
      const triggerYaml: NGTriggerConfigV2 = {
        name,
        identifier,
        enabled: enabledStatus,
        description,
        tags,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        source: {
          type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
          spec: {
            type: formikValueSourceRepo, // Github
            spec: {
              type: event,
              spec: {
                connectorRef: connectorRef?.value || '',
                autoAbortPreviousExecutions
              }
            }
          }
        },
        inputYaml: stringifyPipelineRuntimeInput
      }
      if (triggerYaml.source?.spec?.spec) {
        triggerYaml.source.spec.spec.spec.payloadConditions = persistIncomplete
          ? payloadConditions
          : payloadConditions.filter(payloadCondition => isRowFilled(payloadCondition))

        triggerYaml.source.spec.spec.spec.headerConditions = persistIncomplete
          ? headerConditions
          : headerConditions.filter(headerCondition => isRowFilled(headerCondition))

        if (jexlCondition) {
          triggerYaml.source.spec.spec.spec.jexlCondition = jexlCondition
        }

        if (repoName) {
          triggerYaml.source.spec.spec.spec.repoName = repoName
        } else if (connectorRef?.connector?.spec?.type === connectorUrlType.ACCOUNT) {
          triggerYaml.source.spec.spec.spec.repoName = ''
        }
        if (actionsValues) {
          triggerYaml.source.spec.spec.spec.actions = actionsValues
        }
      }
      return clearNullUndefined(triggerYaml)
    } else {
      const triggerYaml: NGTriggerConfigV2 = {
        name,
        identifier,
        enabled: enabledStatus,
        description,
        tags,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        source: {
          type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
          spec: {
            type: formikValueSourceRepo, // Custom
            spec: {
              payloadConditions: []
            }
          }
        },
        inputYaml: stringifyPipelineRuntimeInput
      }

      if (secureToken && triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec = {
          authToken: { type: 'inline', spec: { value: secureToken } }
        }
      }

      if (triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec.payloadConditions = persistIncomplete
          ? payloadConditions
          : payloadConditions.filter(payloadCondition => isRowFilled(payloadCondition))
      }

      if (triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec.headerConditions = persistIncomplete
          ? headerConditions
          : headerConditions.filter(headerCondition => isRowFilled(headerCondition))
      }

      if (jexlCondition && triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec.jexlCondition = jexlCondition
      }

      if (triggerYaml?.source?.spec && isEmpty(triggerYaml.source.spec.spec)) {
        delete triggerYaml.source.spec.spec
      }

      return clearNullUndefined(triggerYaml)
    }
  }

  const getWebhookTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfigV2 }
  }): FlatOnEditValuesInterface | undefined => {
    // triggerResponseYaml comes from onEdit render, triggerYaml comes from visualYaml toggle
    let triggerValues: FlatOnEditValuesInterface | undefined

    if (triggerYaml && triggerYaml?.trigger?.enabled === false) {
      setEnabledStatus(false)
    } else if (triggerYaml && triggerYaml?.trigger?.enabled === true) {
      setEnabledStatus(true)
    }
    try {
      const triggerResponseJson = triggerResponseYaml ? parse(triggerResponseYaml) : triggerYaml

      if (triggerResponseJson?.trigger?.source?.spec?.type !== GitSourceProviders.CUSTOM.value) {
        // non-custom flow #github | gitlab | bitbucket
        const {
          trigger: {
            name,
            identifier,
            description,
            tags,
            inputYaml,
            source: {
              spec: {
                type: sourceRepo,
                spec: {
                  type: event,
                  spec: {
                    actions,
                    connectorRef,
                    repoName,
                    payloadConditions,
                    headerConditions,
                    authToken,
                    jexlCondition,
                    autoAbortPreviousExecutions = false
                  }
                }
              }
            }
          }
        } = triggerResponseJson

        const { value: sourceBranchValue, operator: sourceBranchOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.SOURCE_BRANCH
          ) || {}
        const { value: targetBranchValue, operator: targetBranchOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.TARGET_BRANCH
          ) || {}
        const { value: changedFilesValue, operator: changedFilesOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.CHANGED_FILES
          ) || {}
        const { value: tagConditionValue, operator: tagConditionOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.TAG
          ) || {}

        let pipelineJson = undefined
        try {
          pipelineJson = parse(inputYaml)?.pipeline
        } catch (e) {
          // set error
          setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
        }

        triggerValues = {
          name,
          identifier,
          description,
          tags,
          pipeline: pipelineJson,
          sourceRepo,
          triggerType: TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
          event,
          autoAbortPreviousExecutions,
          connectorRef,
          repoName,
          secureToken: authToken?.spec?.value,
          actions: (actions || []).map((action: string) => ({
            label: action,
            value: action
          })),
          anyAction: (actions || []).length === 0,
          sourceBranchOperator,
          sourceBranchValue,
          targetBranchOperator,
          targetBranchValue,
          changedFilesOperator,
          changedFilesValue,
          tagConditionOperator,
          tagConditionValue,
          headerConditions,
          payloadConditions: payloadConditions?.filter(
            (payloadCondition: AddConditionInterface) =>
              payloadCondition.key !== PayloadConditionTypes.SOURCE_BRANCH &&
              payloadCondition.key !== PayloadConditionTypes.TARGET_BRANCH &&
              payloadCondition.key !== PayloadConditionTypes.CHANGED_FILES &&
              payloadCondition.key !== PayloadConditionTypes.TAG
          ),
          jexlCondition
        }

        // connectorRef in Visual UI is an object (with the label), but in YAML is a string
        if (triggerValues?.connectorRef && typeof triggerValues.connectorRef === 'string') {
          const connectorRefWithBlankLabel: ConnectorRefInterface = {
            value: triggerValues.connectorRef,
            identifier: triggerValues.connectorRef
          }

          if (triggerYaml && connectorData?.data?.connector?.name) {
            const { connector } = connectorData.data

            connectorRefWithBlankLabel.connector = connector
            connectorRefWithBlankLabel.connector.identifier = triggerValues.connectorRef

            connectorRefWithBlankLabel.label = '' // will fetch details on useEffect
          }

          triggerValues.connectorRef = connectorRefWithBlankLabel

          const connectorParams: GetConnectorQueryParams = {
            accountIdentifier: accountId
          }
          if (triggerValues?.connectorRef?.value) {
            if (getScopeFromValue(triggerValues.connectorRef?.value) === Scope.ORG) {
              connectorParams.orgIdentifier = orgIdentifier
            } else if (getScopeFromValue(triggerValues.connectorRef?.value) === Scope.PROJECT) {
              connectorParams.orgIdentifier = orgIdentifier
              connectorParams.projectIdentifier = projectIdentifier
            }

            setConnectorScopeParams(connectorParams)
          }
        }

        return triggerValues
      } else {
        // custom webhook flow
        const {
          trigger: {
            name,
            identifier,
            description,
            tags,
            inputYaml,
            source: {
              spec: {
                type: sourceRepo,
                spec: { payloadConditions, headerConditions, authToken, jexlCondition }
              }
            }
          }
        } = triggerResponseJson

        let pipelineJson = undefined
        try {
          pipelineJson = parse(inputYaml)?.pipeline
        } catch (e) {
          // set error
          setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
        }

        triggerValues = {
          name,
          identifier,
          description,
          tags,
          pipeline: pipelineJson,
          sourceRepo,
          triggerType: TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
          secureToken: authToken?.spec?.value,
          headerConditions,
          payloadConditions,
          jexlCondition
        }

        return triggerValues
      }
    } catch (e) {
      // set error
      setErrorToasterMessage(getString('pipeline.triggers.cannotParseTriggersData'))
    }

    return triggerValues
  }

  const getScheduleTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfigV2 }
  }): FlatOnEditValuesInterface | undefined => {
    let newOnEditInitialValues: FlatOnEditValuesInterface | undefined
    try {
      const triggerResponseJson = triggerYaml ? triggerYaml : triggerResponseYaml ? parse(triggerResponseYaml) : {}
      const {
        trigger: {
          name,
          identifier,
          description,
          tags,
          inputYaml,
          source: {
            spec: {
              spec: { expression }
            }
          }
        }
      } = triggerResponseJson

      let pipelineJson = undefined
      try {
        pipelineJson = parse(inputYaml)?.pipeline
      } catch (e) {
        // set error
        setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
      const expressionBreakdownValues = getBreakdownValues(expression)
      const newExpressionBreakdown = {
        ...resetScheduleObject,
        ...expressionBreakdownValues
      }
      newOnEditInitialValues = {
        name,
        identifier,
        description,
        tags,
        pipeline: pipelineJson,
        triggerType: TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
        expression,
        ...newExpressionBreakdown,
        selectedScheduleTab: scheduleTabsId.CUSTOM // only show CUSTOM on edit
      }
      return newOnEditInitialValues
    } catch (e) {
      // set error
      setErrorToasterMessage(getString('pipeline.triggers.cannotParseTriggersData'))
    }
  }

  const getArtifactTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfigV2 }
  }): FlatOnEditValuesInterface | undefined => {
    let newOnEditInitialValues: FlatOnEditValuesInterface | undefined
    try {
      const triggerResponseJson = triggerYaml ? triggerYaml : triggerResponseYaml ? parse(triggerResponseYaml) : {}
      const {
        trigger: {
          name,
          identifier,
          description,
          tags,
          inputYaml,
          source: { type },
          source
        }
      } = triggerResponseJson

      let selectedArtifact
      let triggerType

      if (type === TriggerTypes.MANIFEST) {
        const { manifestRef, type: _manifestType, spec } = source?.spec || {}
        if (_manifestType) {
          setArtifactManifestType(_manifestType)
        }
        triggerType = TriggerTypes.MANIFEST
        selectedArtifact = {
          identifier: manifestRef,
          type: artifactManifestType || _manifestType,
          spec
        }
      } else if (type === TriggerTypes.ARTIFACT) {
        const { artifactRef, type: _artifactType, spec } = source?.spec || {}
        if (_artifactType) {
          setArtifactManifestType(_artifactType)
        }
        triggerType = TriggerTypes.ARTIFACT
        selectedArtifact = {
          identifier: artifactRef,
          type: artifactManifestType || _artifactType,
          spec
        }
      }

      let pipelineJson = undefined
      try {
        pipelineJson = parse(inputYaml)?.pipeline
      } catch (e) {
        // set error
        setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
      const eventConditions = source?.spec?.spec?.eventConditions || []
      const { value: versionValue, operator: versionOperator } =
        eventConditions?.find(
          (eventCondition: AddConditionInterface) => eventCondition.key === EventConditionTypes.VERSION
        ) || {}
      const { value: buildValue, operator: buildOperator } =
        eventConditions?.find(
          (eventCondition: AddConditionInterface) => eventCondition.key === EventConditionTypes.BUILD
        ) || {}

      newOnEditInitialValues = {
        name,
        identifier,
        description,
        tags,
        pipeline: pipelineJson,
        triggerType: triggerType as unknown as NGTriggerSourceV2['type'],
        manifestType: selectedArtifact?.type,
        stageId: source?.spec?.stageIdentifier,
        inputSetTemplateYamlObj: parse(template?.data?.inputSetTemplateYaml || ''),
        selectedArtifact,
        versionValue,
        versionOperator,
        buildValue,
        buildOperator,
        eventConditions: eventConditions?.filter(
          (eventCondition: AddConditionInterface) =>
            eventCondition.key !== EventConditionTypes.BUILD && eventCondition.key !== EventConditionTypes.VERSION
        )
      }
      if (type === TriggerTypes.ARTIFACT) {
        delete newOnEditInitialValues['manifestType']
        newOnEditInitialValues.artifactType = selectedArtifact?.type
      }
      return newOnEditInitialValues
    } catch (e) {
      // set error
      setErrorToasterMessage(getString('pipeline.triggers.cannotParseTriggersData'))
    }
  }
  const getScheduleTriggerYaml = ({
    values: val
  }: {
    values: FlatValidScheduleFormikValuesInterface
  }): TriggerConfigDTO => {
    const {
      name,
      identifier,
      description,
      tags,
      pipeline: pipelineRuntimeInput,
      triggerType: formikValueTriggerType,
      expression
    } = val

    // actions will be required thru validation
    const stringifyPipelineRuntimeInput = yamlStringify({
      pipeline: clearNullUndefined(pipelineRuntimeInput)
    })
    return clearNullUndefined({
      name,
      identifier,
      enabled: enabledStatus,
      description,
      tags,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      source: {
        type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
        spec: {
          type: scheduledTypes.CRON,
          spec: {
            expression
          }
        }
      },
      inputYaml: stringifyPipelineRuntimeInput
    })
  }

  const [formErrors, setFormErrors] = useState<
    FormikErrors<
      | FlatValidArtifactFormikValuesInterface
      | FlatValidWebhookFormikValuesInterface
      | FlatValidScheduleFormikValuesInterface
    >
  >({})
  // const [expressionFormState, setExpressionFormState] = useState<KVPair>({})
  const yamlTemplate = useMemo(() => {
    return parse(defaultTo(template?.data?.inputSetTemplateYaml, ''))?.pipeline
  }, [template?.data?.inputSetTemplateYaml])

  const getFormErrors = async (
    latestPipeline: { pipeline: PipelineInfoConfig },
    latestYamlTemplate: PipelineInfoConfig,
    orgPipeline: PipelineInfoConfig | undefined
  ) => {
    let errors = formErrors
    function validateErrors(): Promise<
      FormikErrors<
        | FlatValidArtifactFormikValuesInterface
        | FlatValidWebhookFormikValuesInterface
        | FlatValidScheduleFormikValuesInterface
      >
    > {
      return new Promise(resolve => {
        setTimeout(() => {
          const validatedErrors =
            (validatePipeline({
              pipeline: { ...clearRuntimeInput(latestPipeline.pipeline) },
              template: latestYamlTemplate,
              originalPipeline: orgPipeline,
              getString,
              viewType: StepViewType.TriggerForm
            }) as any) || formErrors
          resolve(validatedErrors)
        }, 300)
      })
    }
    if (latestPipeline?.pipeline && latestYamlTemplate && orgPipeline) {
      errors = await validateErrors()
      const expressionErrors: KVPair = {}
      // !TODO
      // // vaidate replacedExpressions
      // if (template?.data?.replacedExpressions?.length) {
      //   template.data.replacedExpressions.forEach((value: string) => {
      //     const currValue = defaultTo(expressionFormState[value], '')
      //     if (currValue.trim() === '') expressionErrors[value] = getString('pipeline.expressionRequired')
      //   })
      // }
      setFormErrors({ ...errors, ...expressionErrors })
    }
    return errors
  }

  // TriggerConfigDTO is NGTriggerConfigV2 with optional identifier
  const submitTrigger = async (triggerYaml: NGTriggerConfigV2 | TriggerConfigDTO): Promise<void> => {
    if (onEditInitialValues?.identifier) {
      try {
        const { status, data } = await updateTrigger(yamlStringify({ trigger: clearNullUndefined(triggerYaml) }) as any)
        if (status === ResponseStatus.SUCCESS) {
          showSuccess(
            getString('pipeline.triggers.toast.successfulUpdate', {
              name: data?.name
            })
          )
          history.push(
            routes.toTriggersPage({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              module
            })
          )
        }
      } catch (err) {
        setErrorToasterMessage(err?.data?.message)
      }
      // error flow sent to Wizard
    } else {
      try {
        const { status, data } = await createTrigger(yamlStringify({ trigger: clearNullUndefined(triggerYaml) }) as any)
        if (status === ResponseStatus.SUCCESS) {
          showSuccess(
            getString('pipeline.triggers.toast.successfulCreate', {
              name: data?.name
            })
          )
          history.push(
            routes.toTriggersPage({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              module
            })
          )
        }
      } catch (err) {
        setErrorToasterMessage(err?.data?.message)
      }
    }
  }

  const handleWebhookSubmit = async (val: FlatValidWebhookFormikValuesInterface): Promise<void> => {
    const triggerYaml = getWebhookTriggerYaml({ values: val })

    submitTrigger(triggerYaml)
  }

  const handleScheduleSubmit = async (val: FlatValidScheduleFormikValuesInterface): Promise<void> => {
    const triggerYaml = getScheduleTriggerYaml({ values: val })
    submitTrigger(triggerYaml)
  }

  const handleArtifactSubmit = async (val: FlatValidArtifactFormikValuesInterface): Promise<void> => {
    const triggerYaml = getArtifactManifestTriggerYaml({
      values: val,
      manifestType,
      enabledStatus,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier
    })
    submitTrigger(triggerYaml)
  }

  const getInitialValues = (triggerType: NGTriggerSourceV2['type']): FlatInitialValuesInterface | any => {
    if (triggerType === TriggerTypes.WEBHOOK) {
      const newPipeline: any = { ...(currentPipeline?.pipeline || {}) }

      return {
        triggerType: triggerTypeOnNew,
        sourceRepo: sourceRepoOnNew,
        identifier: '',
        tags: {},
        pipeline: newPipeline,
        originalPipeline,
        anyAction: false,
        autoAbortPreviousExecutions: false
      }
    } else if (triggerType === TriggerTypes.SCHEDULE) {
      return {
        triggerType: triggerTypeOnNew,
        identifier: '',
        tags: {},
        selectedScheduleTab: scheduleTabsId.MINUTES,
        pipeline: currentPipeline?.pipeline,
        originalPipeline,
        ...getDefaultExpressionBreakdownValues(scheduleTabsId.MINUTES)
      }
    } else if (isArtifactOrManifestTrigger(triggerType)) {
      const inputSetTemplateYamlObj = parse(template?.data?.inputSetTemplateYaml || '')

      return {
        triggerType: triggerTypeOnNew,
        identifier: '',
        tags: {},
        artifactType,
        manifestType,
        pipeline: currentPipeline?.pipeline,
        originalPipeline,
        inputSetTemplateYamlObj,
        selectedArtifact: {}
      }
    }
    return {}
  }

  const [initialValues, setInitialValues] = useState<FlatInitialValuesInterface>(
    Object.assign(getInitialValues(triggerTypeOnNew), onEditInitialValues)
  )

  useEffect(() => {
    setInitialValues(Object.assign(getInitialValues(triggerTypeOnNew), onEditInitialValues))
  }, [onEditInitialValues, currentPipeline])

  useEffect(() => {
    const yamlPipeline = pipelineResponse?.data?.yamlPipeline

    if (
      yamlPipeline &&
      ((initialValues && !initialValues.originalPipeline) ||
        (onEditInitialValues?.identifier && !onEditInitialValues.originalPipeline))
    ) {
      try {
        const newOriginalPipeline = parse(yamlPipeline)?.pipeline
        const additionalValues: {
          inputSetTemplateYamlObj?: {
            pipeline: PipelineInfoConfig | Record<string, never>
          }
        } = {}

        if (isArtifactOrManifestTrigger(initialValues?.triggerType)) {
          const inputSetTemplateYamlObj = parse(template?.data?.inputSetTemplateYaml || '')
          additionalValues.inputSetTemplateYamlObj = inputSetTemplateYamlObj
        }

        if (onEditInitialValues?.identifier) {
          const newPipeline = currentPipeline?.pipeline ? currentPipeline.pipeline : onEditInitialValues.pipeline || {}
          setOnEditInitialValues({
            ...onEditInitialValues,
            originalPipeline: newOriginalPipeline,
            pipeline: newPipeline,
            ...additionalValues
          })
        } else {
          setInitialValues({
            ...initialValues,
            originalPipeline: newOriginalPipeline,
            ...additionalValues
          })
        }
      } catch (e) {
        // set error
        setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }, [pipelineResponse?.data?.yamlPipeline, onEditInitialValues?.identifier, initialValues, currentPipeline])

  const { data: connectorData, refetch: getConnectorDetails } = useGetConnector({
    identifier: getIdentifierFromValue(
      wizardKey < 1 // wizardKey >1 means we've reset initialValues cause of Yaml Switching (onEdit or new) and should use those formik values instead
        ? onEditInitialValues?.connectorRef?.identifier || ''
        : initialValues?.connectorRef?.identifier || ''
    ),
    queryParams: connectorScopeParams,
    lazy: true
  })

  useEffect(() => {
    if (onEditInitialValues?.connectorRef?.identifier && !isUndefined(connectorScopeParams) && !connectorData) {
      getConnectorDetails()
    } else if (
      initialValues?.connectorRef?.value &&
      (!initialValues.connectorRef.label ||
        (connectorData?.data?.connector?.identifier &&
          !initialValues?.connectorRef?.identifier?.includes(connectorData?.data?.connector?.identifier)))
    ) {
      // need to get label due to switching from yaml to visual
      getConnectorDetails()
    }
  }, [onEditInitialValues?.connectorRef?.identifier, connectorScopeParams, initialValues?.connectorRef])

  useEffect(() => {
    if (connectorData?.data?.connector?.name && onEditInitialValues?.connectorRef?.identifier && wizardKey < 1) {
      // Assigns label on Visual mode for onEdit
      const { connector, status } = connectorData.data
      const connectorRef: ConnectorRefInterface = {
        ...(onEditInitialValues || initialValues).connectorRef,
        label: connector.name,
        connector,
        live: status?.status === 'SUCCESS'
      }
      if (onEditInitialValues?.connectorRef?.identifier) {
        setOnEditInitialValues({ ...onEditInitialValues, connectorRef })
      }
    } else if (connectorData?.data?.connector?.name && initialValues?.connectorRef?.identifier) {
      // means we switched from yaml to visual and need to get the label
      const { connector, status } = connectorData.data
      const connectorRef: ConnectorRefInterface = {
        ...initialValues.connectorRef,
        label: connector.name,
        connector,
        live: status?.status === 'SUCCESS'
      }
      setInitialValues({ ...initialValues, connectorRef })
    }
  }, [
    connectorData?.data?.connector,
    onEditInitialValues?.connectorRef?.identifier,
    initialValues?.connectorRef?.identifier
  ])

  const handleWebhookModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      setErrorToasterMessage('')
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({
          ...initialValues,
          ...getWebhookTriggerValues({ triggerYaml })
        })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }

  const handleScheduleModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      setErrorToasterMessage('')
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({
          ...initialValues,
          ...getScheduleTriggerValues({ triggerYaml })
        })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }

  const handleArtifactModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      setErrorToasterMessage('')
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({
          ...initialValues,
          ...getArtifactTriggerValues({ triggerYaml })
        })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setErrorToasterMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }

  const [isExecutable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const isTriggerRbacDisabled = !isExecutable

  const wizardMap = initialValues.triggerType
    ? getWizardMap({
        triggerType: initialValues.triggerType,
        getString,
        triggerName: initialValues?.name
      })
    : undefined

  const titleWithSwitch = ({ selectedView }: { selectedView: SelectedView }): JSX.Element => (
    <Layout.Horizontal
      spacing="medium"
      style={{
        paddingLeft: 'var(--spacing-xlarge)',
        paddingTop: 'var(--spacing-xsmall)',
        alignItems: 'baseline'
      }}
    >
      <Text color={Color.GREY_800} font={{ weight: 'bold' }} style={{ fontSize: 20 }}>
        {wizardMap?.wizardLabel}{' '}
      </Text>
      {selectedView !== SelectedView.YAML ? (
        <>
          <Switch
            style={{ paddingLeft: '46px' }}
            label={getString('enabledLabel')}
            disabled={isTriggerRbacDisabled}
            data-name="enabled-switch"
            key={Date.now()}
            checked={enabledStatus}
            onChange={() => setEnabledStatus(!enabledStatus)}
          />
        </>
      ) : null}
    </Layout.Horizontal>
  )
  const ConnectorRefRegex = /^.+source\.spec\.spec\.spec\.connectorRef$/
  const invocationMapWebhook: YamlBuilderProps['invocationMap'] = new Map<RegExp, InvocationMapFunction>()

  invocationMapWebhook.set(
    ConnectorRefRegex,

    (_matchingPath: string, _currentYaml: string): Promise<CompletionItemInterface[]> => {
      return new Promise(resolve => {
        const request = getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { filterType: 'Connector', categories: ['CODE_REPO'] }
        })
          .then(response => {
            const data =
              response?.data?.content?.map(connector => ({
                label: getConnectorName(connector),
                insertText: getConnectorValue(connector),
                kind: CompletionItemKind.Field
              })) || []
            return data
          })
          .catch((err: Failure) => {
            throw err.message
          })

        resolve(request)
      })
    }
  )

  const validateCICodebase = (
    formData:
      | FlatValidArtifactFormikValuesInterface
      | FlatValidWebhookFormikValuesInterface
      | FlatValidScheduleFormikValuesInterface
  ): FormikErrors<Record<string, any>> => {
    const pipeline = get(formData, 'originalPipeline') as PipelineInfoConfig
    const isCloneCodebaseEnabledAtLeastAtOneStage = pipeline?.stages?.some(stage =>
      get(stage, 'stage.spec.cloneCodebase')
    )
    if (!isCloneCodebaseEnabledAtLeastAtOneStage) {
      return {}
    }
    if (isEmpty(get(formData, 'pipeline.properties.ci.codebase.build.type'))) {
      return {
        'pipeline.properties.ci.codebase.build.type': getString(
          'pipeline.failureStrategies.validation.ciCodebaseRequired'
        )
      }
    }
    const ciCodeBaseType = get(formData, 'pipeline.properties.ci.codebase.build.type')
    if (ciCodeBaseType === 'branch' && isEmpty(get(formData, 'pipeline.properties.ci.codebase.build.spec.branch'))) {
      return {
        'pipeline.properties.ci.codebase.build.spec.branch': getString(
          'pipeline.failureStrategies.validation.gitBranchRequired'
        )
      }
    } else if (ciCodeBaseType === 'tag' && isEmpty(get(formData, 'pipeline.properties.ci.codebase.build.spec.tag'))) {
      return {
        'pipeline.properties.ci.codebase.build.spec.tag': getString(
          'pipeline.failureStrategies.validation.gitTagRequired'
        )
      }
    } else if (ciCodeBaseType === 'PR' && isEmpty(get(formData, 'pipeline.properties.ci.codebase.build.spec.number'))) {
      return {
        'pipeline.properties.ci.codebase.build.spec.number': getString(
          'pipeline.failureStrategies.validation.gitPRRequired'
        )
      }
    }
    return {}
  }

  const renderErrorsStrip = (): JSX.Element => <ErrorsStrip formErrors={formErrors} />

  const validateTriggerPipeline = async (
    formikProps: FormikProps<any>
  ): Promise<FormikErrors<FlatValidWebhookFormikValuesInterface>> => {
    const { values, setErrors } = formikProps
    const latestPipeline = {
      ...currentPipeline,
      pipeline: values.pipeline as PipelineInfoConfig
    }
    const runPipelineFormErrors = await getFormErrors(latestPipeline, yamlTemplate, values.pipeline)
    // https://github.com/formium/formik/issues/1392
    const errors: any = await { ...runPipelineFormErrors }
    const ciCodebaseErrors = validateCICodebase(values)
    if (!isEmpty(ciCodebaseErrors)) {
      const [ciCodebaseErrorsEntry] = Object.entries(ciCodebaseErrors)
      set(errors, ciCodebaseErrorsEntry[0], ciCodebaseErrorsEntry[1])
      setErrors({ pipeline: errors?.pipeline })
      setFormErrors({ pipeline: errors }) // error strip
      return errors
    } else if (!isEmpty(runPipelineFormErrors)) {
      setErrors(runPipelineFormErrors)
      // To do: have errors outlines display
      return runPipelineFormErrors
    }
    return errors
  }

  const renderWebhookWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined
    return (
      <Wizard
        key={wizardKey} // re-renders with yaml to visual initialValues
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidWebhookFormikValuesInterface) => handleWebhookSubmit(val),
          validationSchema: getValidationSchema(
            TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
            getString
          ),
          validate: validateTriggerPipeline,
          validateOnChange: true,
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="200px"
        tabChevronOffset="178px"
        onHide={returnToTriggersPage}
        wizardType="webhook"
        // defaultTabId="Schedule"
        submitLabel={
          isEdit ? getString('pipeline.triggers.updateTrigger') : getString('pipeline.triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading || isTriggerRbacDisabled}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        visualYamlProps={{
          handleModeSwitch: handleWebhookModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema,
          invocationMap: invocationMapWebhook,
          positionInHeader: true
        }}
        leftNav={titleWithSwitch}
        renderErrorsStrip={renderErrorsStrip}
      >
        <WebhookTriggerConfigPanel />
        <WebhookConditionsPanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  const renderArtifactWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined

    return (
      <Wizard
        key={wizardKey} // re-renders with yaml to visual initialValues
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidArtifactFormikValuesInterface) => handleArtifactSubmit(val),
          validationSchema: getValidationSchema(
            initialValues.triggerType as unknown as NGTriggerSourceV2['type'],
            getString
          ),
          validate: validateTriggerPipeline,
          validateOnChange: true,
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="200px"
        tabChevronOffset="178px"
        onHide={returnToTriggersPage}
        // defaultTabId="Schedule"
        submitLabel={
          isEdit ? getString('pipeline.triggers.updateTrigger') : getString('pipeline.triggers.createTrigger')
        }
        wizardType="artifacts"
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading || isTriggerRbacDisabled}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        visualYamlProps={{
          handleModeSwitch: handleArtifactModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema,
          invocationMap: invocationMapWebhook
        }}
        renderErrorsStrip={renderErrorsStrip}
        leftNav={titleWithSwitch}
      >
        <ArtifactTriggerConfigPanel />
        <ArtifactConditionsPanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  const renderScheduleWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined
    return (
      <Wizard
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidScheduleFormikValuesInterface) => handleScheduleSubmit(val),
          validationSchema: getValidationSchema(
            TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
            getString
          ),
          validate: validateTriggerPipeline,
          validateOnChange: true,
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="200px"
        tabChevronOffset="178px"
        onHide={returnToTriggersPage}
        // defaultTabId="Conditions"
        submitLabel={
          isEdit ? getString('pipeline.triggers.updateTrigger') : getString('pipeline.triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading}
        isEdit={isEdit}
        wizardType="scheduled"
        errorToasterMessage={errorToasterMessage}
        leftNav={titleWithSwitch}
        visualYamlProps={{
          handleModeSwitch: handleScheduleModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema
        }}
        renderErrorsStrip={renderErrorsStrip}
      >
        <TriggerOverviewPanel />
        <SchedulePanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  if (initialValues?.triggerType && !Object.values(TriggerTypes).includes(initialValues.triggerType)) {
    return (
      <Layout.Vertical spacing="medium" padding="medium">
        <Page.Body>
          <h2>{getString('pipeline.triggers.pageNotFound')}</h2>
        </Page.Body>
      </Layout.Vertical>
    )
  }

  return triggerIdentifier && !wizardMap ? (
    <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
      <PageSpinner />
    </div>
  ) : (
    <>
      <Page.Body>
        {!loadingGetTrigger && initialValues.triggerType === TriggerTypes.WEBHOOK && renderWebhookWizard()}
        {!loadingGetTrigger && initialValues.triggerType === TriggerTypes.SCHEDULE && renderScheduleWizard()}

        {!loadingGetTrigger && isArtifactOrManifestTrigger(initialValues.triggerType) && renderArtifactWizard()}
      </Page.Body>
    </>
  )
}
export default TriggersWizardPage

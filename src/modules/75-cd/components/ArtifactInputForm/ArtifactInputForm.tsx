/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'

import { connect } from 'formik'
import produce from 'immer'
import get from 'lodash-es/get'
import { Tooltip, Menu } from '@blueprintjs/core'
import { cloneDeep, isEmpty, set } from 'lodash-es'

import memoize from 'lodash-es/memoize'

import { parse } from 'yaml'

import { useParams } from 'react-router-dom'

import {
  Text,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Icon,
  SelectOption,
  useToaster
} from '@wings-software/uicore'
import { useDeepCompareEffect, useMutateAsGet, useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'

import type { PipelineType, InputSetPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { gcrUrlList } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'

import {
  ConnectorInfoDTO,
  useGetBuildDetailsForDockerWithYaml,
  useGetBuildDetailsForGcrWithYaml,
  useGetBuildDetailsForEcrWithYaml
} from 'services/cd-ng'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type {
  K8SDirectServiceStep,
  KubernetesServiceInputFormProps
} from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import {
  PRIMARY_ARTIFACT,
  TriggerDefaultFieldList,
  TriggerTypes
} from '@pipeline/pages/triggers/utils/TriggersWizardPageUtils'
import ExperimentalInput from '../PipelineSteps/K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'

import { clearRuntimeInputValue, getNonRuntimeFields } from '../PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import type { LastQueryData } from '../PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import css from './ArtifactInputForm.module.scss'

const setSideCarInitialValues = (initialValues: K8SDirectServiceStep, formik: any, stageIdentifier: string) => {
  let selectedArtifact: any = initialValues?.artifacts?.sidecars?.find(
    (item: any) => item?.sidecar?.identifier === formik?.values?.selectedArtifact?.identifier
  ) || {
    artifact: {
      identifier: '',
      type: formik?.values?.selectedArtifact?.type,
      spec: {
        store: {
          spec: {}
        }
      }
    }
  }
  const selectedIndex =
    initialValues?.artifacts?.sidecars?.findIndex(
      (item: any) => item?.sidecar?.identifier === formik?.values?.selectedArtifact?.identifier
    ) || 0

  if (stageIdentifier === formik?.values?.stageId) {
    if (selectedArtifact && initialValues && initialValues.artifacts && selectedIndex >= 0) {
      const artifactSpec = formik?.values?.selectedArtifact?.spec || {}
      /*
       backend requires eventConditions inside selectedArtifact but should not be added to inputYaml
      */
      if (artifactSpec.eventConditions) {
        delete artifactSpec.eventConditions
      }

      selectedArtifact = {
        artifact: {
          identifier: formik?.values?.selectedArtifact?.identifier,
          type: formik?.values?.selectedArtifact?.type,
          spec: {
            ...artifactSpec
          }
        }
      }
    }
    if (selectedIndex >= 0 && initialValues?.artifacts?.sidecars) {
      initialValues.artifacts['sidecars'][selectedIndex].sidecar = selectedArtifact?.artifact
    }
  }
}

const setPrimaryInitialValues = (initialValues: K8SDirectServiceStep, formik: any, stageIdentifier: string) => {
  let selectedArtifact: any = initialValues?.artifacts?.primary
  if (stageIdentifier === formik?.values?.stageId) {
    if (selectedArtifact && initialValues && initialValues.artifacts && initialValues?.artifacts?.primary) {
      const artifactSpec = formik?.values?.selectedArtifact?.spec || {}
      /*
       backend requires eventConditions inside selectedArtifact but should not be added to inputYaml
      */
      if (artifactSpec.eventConditions) {
        delete artifactSpec.eventConditions
      }

      selectedArtifact = {
        artifact: {
          identifier: formik?.values?.selectedArtifact?.identifier,
          type: formik?.values?.selectedArtifact?.type,
          spec: {
            ...artifactSpec
          }
        }
      }
    }
    if (initialValues?.artifacts?.primary) {
      initialValues.artifacts['primary'] = selectedArtifact?.artifact
    }
  }
  return initialValues
}

const ArtifactInputSetForm: React.FC<KubernetesServiceInputFormProps> = ({
  template,
  path,
  allValues,
  initialValues,
  readonly = false,
  stageIdentifier,
  formik,
  fromTrigger
}) => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const [lastQueryData, setLastQueryData] = React.useState<LastQueryData>({})

  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch: branchParam } = useQueryParams<GitQueryParams>()
  const [tagListMap, setTagListMap] = React.useState<{ [key: string]: Record<string, any>[] | Record<string, any> }>({
    sidecars: [],
    primary: {}
  })
  const artifacts = allValues?.artifacts || {}
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const getFqnPath = useCallback((): string => {
    let lastQueryDataPath
    if (lastQueryData.path && lastQueryData.path !== 'primary') {
      lastQueryDataPath = `sidecars.${get(template, `artifacts[${lastQueryData.path}].sidecar.identifier`)}`
    } else {
      lastQueryDataPath = lastQueryData.path
    }
    if (isPropagatedStage) {
      return `pipeline.stages.${stageIdentifier}.spec.serviceConfig.stageOverrides.artifacts.${lastQueryDataPath}.spec.tag`
    }
    return `pipeline.stages.${stageIdentifier}.spec.serviceConfig.serviceDefinition.spec.artifacts.${lastQueryDataPath}.spec.tag`
  }, [lastQueryData])

  const yamlData = clearRuntimeInputValue(
    cloneDeep(
      parse(
        JSON.stringify({
          pipeline: formik?.values
        }) || ''
      )
    )
  )
  //Not using lodash defaultTo on purpose, as it is leading to lint error because defaultPipelineId is treated to have nullable value
  const defaultPipelineId = pipelineIdentifier ?? formik?.values?.identifier

  const {
    data: dockerdata,
    loading: dockerLoading,
    refetch: refetchDockerBuildData,
    error: dockerError
  } = useMutateAsGet(useGetBuildDetailsForDockerWithYaml, {
    body: yamlStringify({ ...yamlData }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: lastQueryData.connectorRef,
      pipelineIdentifier: defaultPipelineId,
      fqnPath: getFqnPath(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch: branchParam
    },
    lazy: true
  })

  const {
    data: gcrdata,
    loading: gcrLoading,
    refetch: refetchGcrBuildData,
    error: gcrError
  } = useMutateAsGet(useGetBuildDetailsForGcrWithYaml, {
    body: yamlStringify({ ...yamlData }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      pipelineIdentifier: defaultPipelineId,
      fqnPath: getFqnPath(),
      registryHostname: lastQueryData.registryHostname || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch: branchParam
    },
    lazy: true
  })

  const {
    data: ecrdata,
    loading: ecrLoading,
    refetch: refetchEcrBuildData,
    error: ecrError
  } = useMutateAsGet(useGetBuildDetailsForEcrWithYaml, {
    body: yamlStringify({ ...yamlData }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      pipelineIdentifier: defaultPipelineId,
      fqnPath: getFqnPath(),
      region: lastQueryData.region || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch: branchParam
    },
    lazy: true
  })

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useDeepCompareEffect(() => {
    if (gcrError || dockerError || ecrError) {
      showError(
        `Stage ${stageIdentifier}: ${get(ecrError || gcrError || dockerError, 'data.message', null)}`,
        undefined,
        'cd.tag.fetch.error'
      )
      return
    }
    if (Array.isArray(dockerdata?.data?.buildDetailsList)) {
      let tagList: any[] = dockerdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    } else if (Array.isArray(gcrdata?.data?.buildDetailsList)) {
      let tagList: any[] = gcrdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    } else if (Array.isArray(ecrdata?.data?.buildDetailsList)) {
      let tagList: any[] = ecrdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    }
  }, [
    dockerdata?.data?.buildDetailsList,
    dockerError,
    gcrdata?.data?.buildDetailsList,
    gcrError,
    ecrdata?.data?.buildDetailsList,
    ecrError,
    getString,
    lastQueryData.path,
    showError,
    tagListMap,
    clear
  ])
  React.useEffect(() => {
    if (lastQueryData.connectorRef) {
      switch (lastQueryData.connectorType) {
        case ENABLED_ARTIFACT_TYPES.DockerRegistry:
          refetchDockerBuildData()
          break
        case ENABLED_ARTIFACT_TYPES.Gcr:
          refetchGcrBuildData()
          break
        case ENABLED_ARTIFACT_TYPES.Ecr:
          refetchEcrBuildData()
          break
      }
    }
  }, [lastQueryData])

  const getSelectItems = (tagsPath: string): SelectOption[] => {
    return get(tagListMap, `${tagsPath}.tags`, []) as SelectOption[]
  }

  const fetchTags = ({
    path: tagsPath = '',
    imagePath = '',
    connectorRef = '',
    connectorType = '',
    registryHostname,
    region
  }: LastQueryData): void => {
    if (connectorType === ENABLED_ARTIFACT_TYPES.DockerRegistry) {
      if (imagePath?.length && connectorRef?.length) {
        setLastQueryData({
          path: tagsPath,
          imagePath,
          connectorRef,
          connectorType,
          registryHostname: registryHostname as string
        })
      }
    } else if (connectorType === ENABLED_ARTIFACT_TYPES.Gcr) {
      if (imagePath?.length && connectorRef?.length && registryHostname?.length) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, registryHostname })
      }
    } else {
      if (imagePath?.length && connectorRef?.length && region?.length) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, region })
      }
    }
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={dockerLoading || gcrLoading || ecrLoading}
        onClick={handleClick}
      />
    </div>
  ))

  const isTagSelectionDisabled = (connectorType: string, index = -1): boolean => {
    let imagePath, connectorRef, registryHostname, region
    if (index > -1) {
      imagePath =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
      connectorRef =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
      registryHostname =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname) !==
        MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
      region =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.region
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.region
    } else {
      imagePath =
        getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.imagePath
          : initialValues.artifacts?.primary?.spec?.imagePath
      connectorRef =
        getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.connectorRef
          : initialValues.artifacts?.primary?.spec?.connectorRef
      registryHostname =
        getMultiTypeFromValue(artifacts?.primary?.spec?.registryHostname) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.registryHostname
          : initialValues.artifacts?.primary?.spec?.registryHostname
      region =
        getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.region
          : initialValues.artifacts?.primary?.spec?.region
    }
    if (connectorType === ENABLED_ARTIFACT_TYPES.DockerRegistry) {
      return !imagePath?.length || !connectorRef?.length
    } else if (connectorType === ENABLED_ARTIFACT_TYPES.Ecr) {
      return !imagePath?.length || !connectorRef?.length || !region?.length
    } else {
      return !imagePath?.length || !connectorRef?.length || !registryHostname?.length
    }
  }
  const regions = (regionData?.resource || []).map((region: any) => ({
    value: region.value,
    label: region.name
  }))

  const resetTags = (tagPath: string): void => {
    const tagValue = get(formik.values, tagPath, '')
    getMultiTypeFromValue(tagValue) === MultiTypeInputType.FIXED &&
      tagValue?.length &&
      formik.setFieldValue(tagPath, '')
  }

  const fromPipelineInputTriggerTab = () => {
    return (
      formik?.values?.triggerType === TriggerTypes.ARTIFACT && formik?.values?.selectedArtifact !== null && !fromTrigger
    )
  }

  const isPipelineInputTab = fromPipelineInputTriggerTab()
  const isSelectedStage = stageIdentifier === formik?.values?.stageId
  // If it is from pipeline input tab
  // values have to propogate from the selected artifact
  // and disable the fields

  if (isPipelineInputTab && formik?.values?.selectedArtifact && !formik?.values?.selectedArtifact?.identifier) {
    setPrimaryInitialValues(initialValues, formik, stageIdentifier)
  }

  const isSelectedPrimaryManifest: boolean =
    isPipelineInputTab &&
    stageIdentifier === formik?.values?.stageId &&
    formik?.values?.selectedArtifact &&
    (!formik?.values?.selectedArtifact.identifier || formik?.values?.selectedArtifact.identifier === PRIMARY_ARTIFACT)
  const disablePrimaryFields = (fieldName: string, isTag = false) => {
    if (fromTrigger) {
      // Trigger Configuration Tab
      return get(TriggerDefaultFieldList, fieldName) ? true : false
    } else if (isPipelineInputTab && isSelectedPrimaryManifest && isSelectedStage) {
      return true
    }
    return isTag ? isTagSelectionDisabled(artifacts?.primary?.type || '') : readonly
  }

  return (
    <>
      {get(template, 'artifacts', false) && (
        <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${stageIdentifier}.Service.Artifacts`}>
          <div className={css.subheading}>
            {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}{' '}
          </div>

          <div className={css.artifactsAccordion}>
            {template?.artifacts?.primary && (
              <Text className={css.inputheader}>
                {getString('primaryArtifactText')}
                {!isEmpty(
                  JSON.parse(
                    getNonRuntimeFields(get(artifacts, `primary.spec`), get(template, 'artifacts.primary.spec'))
                  )
                ) && (
                  <Tooltip
                    position="top"
                    className={css.artifactInfoTooltip}
                    content={getNonRuntimeFields(
                      get(artifacts, `primary.spec`),
                      get(template, 'artifacts.primary.spec')
                    )}
                  >
                    <Icon name="info" />
                  </Tooltip>
                )}
              </Text>
            )}
            {template?.artifacts?.primary && (
              <Layout.Vertical data-name="primary" key="primary" className={css.inputWidth}>
                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.connectorRef`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <FormMultiTypeConnectorField
                    name={`${path}.artifacts.primary.spec.connectorRef`}
                    label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                    selected={get(initialValues, 'artifacts.primary.spec.connectorRef', '')}
                    placeholder={''}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    width={445}
                    setRefValue
                    disabled={disablePrimaryFields(`artifacts.primary.spec.connectorRef`)}
                    multiTypeProps={{
                      allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                      expressions
                    }}
                    onChange={() => resetTags(`${path}.artifacts.primary.spec.tag`)}
                    className={css.connectorMargin}
                    type={ArtifactToConnectorMap[artifacts?.primary?.type || ''] as ConnectorInfoDTO['type']}
                    gitScope={{ repo: repoIdentifier || '', branch: branchParam, getDefaultFromOtherRepo: true }}
                  />
                )}
                {getMultiTypeFromValue(artifacts?.primary?.spec?.region) === MultiTypeInputType.RUNTIME && (
                  <ExperimentalInput
                    formik={formik}
                    multiTypeInputProps={{
                      onChange: () => resetTags(`${path}.artifacts.primary.spec.tag`),
                      selectProps: {
                        usePortal: true,
                        addClearBtn: true && !readonly,
                        items: regions
                      },
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    useValue
                    disabled={disablePrimaryFields(`artifacts.primary.spec.region`)}
                    selectItems={regions}
                    label={getString('regionLabel')}
                    name={`${path}.artifacts.primary.spec.region`}
                  />
                )}
                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.imagePath`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <FormInput.MultiTextInput
                    label={getString('pipeline.imagePathLabel')}
                    disabled={disablePrimaryFields(`artifacts.primary.spec.imagePath`)}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    name={`${path}.artifacts.primary.spec.imagePath`}
                    onChange={() => resetTags(`${path}.artifacts.primary.spec.tag`)}
                  />
                )}

                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.registryHostname`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <ExperimentalInput
                    formik={formik}
                    disabled={disablePrimaryFields(`artifacts.primary.spec.registryHostname`)}
                    selectItems={gcrUrlList}
                    useValue
                    multiTypeInputProps={{
                      onChange: () => resetTags(`${path}.artifacts.primary.spec.tag`),
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                      selectProps: { allowCreatingNewItems: true, addClearBtn: true, items: gcrUrlList }
                    }}
                    label={getString('connectors.GCR.registryHostname')}
                    name={`${path}.artifacts.primary.spec.registryHostname`}
                  />
                )}

                {fromTrigger &&
                  getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME && (
                    <FormInput.MultiTextInput
                      label={getString('tagLabel')}
                      multiTextInputProps={{
                        expressions,
                        value: TriggerDefaultFieldList.build,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      disabled={true}
                      name={`${path}.artifacts.primary.spec.tag`}
                    />
                  )}

                {!fromTrigger &&
                  getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME && (
                    <ExperimentalInput
                      formik={formik}
                      disabled={disablePrimaryFields(`artifacts.primary.spec.tag`, true)}
                      // disabled={fromTrigger ? false : isTagSelectionDisabled(artifacts?.primary?.type || '')}
                      selectItems={
                        dockerLoading || gcrLoading || ecrLoading
                          ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                          : getSelectItems('primary')
                      }
                      useValue
                      multiTypeInputProps={{
                        onFocus: (e: any) => {
                          if (
                            e?.target?.type !== 'text' ||
                            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                          ) {
                            return
                          }
                          const imagePath =
                            getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
                              ? artifacts?.primary?.spec?.imagePath
                              : initialValues.artifacts?.primary?.spec?.imagePath
                          const connectorRef =
                            getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
                              ? artifacts?.primary?.spec?.connectorRef
                              : initialValues.artifacts?.primary?.spec?.connectorRef
                          const regionCurrent =
                            getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
                              ? artifacts?.primary?.spec?.region
                              : initialValues.artifacts?.primary?.spec?.region
                          const registryHostnameCurrent =
                            getMultiTypeFromValue(artifacts?.primary?.spec?.registryHostname) !==
                            MultiTypeInputType.RUNTIME
                              ? artifacts?.primary?.spec?.registryHostname
                              : initialValues.artifacts?.primary?.spec?.registryHostname
                          const tagsPath = `primary`
                          !isTagSelectionDisabled(artifacts?.primary?.type || '') &&
                            fetchTags({
                              path: tagsPath,
                              imagePath,
                              connectorRef,
                              connectorType: artifacts?.primary?.type,
                              registryHostname: registryHostnameCurrent,
                              region: regionCurrent
                            })
                        },
                        selectProps: {
                          items:
                            dockerLoading || gcrLoading || ecrLoading
                              ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                              : getSelectItems('primary'),
                          usePortal: true,
                          addClearBtn: !(readonly || isTagSelectionDisabled(artifacts?.primary?.type || '')),
                          noResults: (
                            <Text lineClamp={1}>
                              {get(ecrError || gcrError || dockerError, 'data.message', null) ||
                                getString('pipelineSteps.deploy.errors.notags')}
                            </Text>
                          ),
                          itemRenderer: itemRenderer,
                          allowCreatingNewItems: true,
                          popoverClassName: css.selectPopover
                        },
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      label={getString('tagLabel')}
                      name={`${path}.artifacts.primary.spec.tag`}
                    />
                  )}
                {getMultiTypeFromValue(artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME && (
                  <FormInput.MultiTextInput
                    disabled={disablePrimaryFields('artifacts.primary.spec.tagRegex')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    label={getString('tagRegex')}
                    name={`${path}.artifacts.primary.spec.tagRegex`}
                  />
                )}
              </Layout.Vertical>
            )}

            {template?.artifacts?.sidecars?.length && (
              <Text className={css.sectionHeader}>{getString('sidecarArtifactText')}</Text>
            )}

            {template?.artifacts?.sidecars?.map(
              (
                {
                  sidecar: {
                    identifier = '',
                    spec: { connectorRef = '', imagePath = '', registryHostname = '' } = {}
                  } = {}
                }: any,
                index: number
              ) => {
                /*
                  If it is sidecar and from pipeline input tab
                  disable the selected artifact values and prepopulate the values
                */
                if (isPipelineInputTab) {
                  setSideCarInitialValues(initialValues, formik, stageIdentifier)
                }

                const isSelectedManifest: boolean =
                  isPipelineInputTab &&
                  stageIdentifier === formik?.values?.stageId &&
                  formik?.values?.selectedArtifact &&
                  identifier === formik?.values?.selectedArtifact?.identifier

                const disableField = (fieldName: string, isTag = false) => {
                  if (fromTrigger) {
                    // Trigger Configuration Tab
                    return get(TriggerDefaultFieldList, fieldName) ? true : false
                  } else if (isPipelineInputTab && isSelectedManifest && isSelectedStage) {
                    return true
                  }
                  return isTag
                    ? isTagSelectionDisabled(artifacts?.sidecars?.[index]?.sidecar?.type || '', index)
                    : readonly
                }
                const currentSidecarSpec = initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec
                return (
                  <Layout.Vertical data-name="sidecar" key={identifier} className={css.inputWidth}>
                    <Text className={css.subSectionHeader}>
                      {identifier}
                      {!isEmpty(
                        JSON.parse(
                          getNonRuntimeFields(
                            get(artifacts, `sidecars[${index}].sidecar.spec`),
                            get(template, 'artifacts.primary.spec')
                          )
                        )
                      ) && (
                        <Tooltip
                          position="top"
                          className={css.artifactInfoTooltip}
                          content={getNonRuntimeFields(
                            get(artifacts, `sidecars[${index}].sidecar.spec`),
                            get(template, `artifacts.sidecars[${index}].sidecar.spec`)
                          )}
                        >
                          <Icon name="info" />
                        </Tooltip>
                      )}
                    </Text>
                    {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                      <FormMultiTypeConnectorField
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.connectorRef`}
                        selected={get(initialValues, `artifacts.sidecars[${index}].sidecar.spec.connectorRef`, '')}
                        label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                        placeholder={''}
                        setRefValue
                        disabled={disableField(`sidecars[${index}].sidecar.spec.connectorRef`)}
                        // disabled={readonly}
                        multiTypeProps={{
                          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                          expressions
                        }}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        onChange={() => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`)}
                        type={
                          ArtifactToConnectorMap[
                            artifacts?.sidecars?.[index]?.sidecar?.type || ''
                          ] as ConnectorInfoDTO['type']
                        }
                        gitScope={{ repo: repoIdentifier || '', branch: branchParam, getDefaultFromOtherRepo: true }}
                      />
                    )}
                    {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.region) ===
                      MultiTypeInputType.RUNTIME && (
                      <ExperimentalInput
                        formik={formik}
                        useValue
                        multiTypeInputProps={{
                          onChange: () => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`),
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          selectProps: {
                            items: regions,
                            usePortal: true,
                            addClearBtn: true && !readonly,
                            allowCreatingNewItems: true
                          }
                        }}
                        disabled={disableField(`sidecars[${index}].sidecar.spec.region`)}
                        selectItems={regions}
                        label={getString('regionLabel')}
                        name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.region`}
                      />
                    )}
                    {getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME && (
                      <FormInput.MultiTextInput
                        label={getString('pipeline.imagePathLabel')}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                        disabled={disableField(`sidecars[${index}].sidecar.spec.imagePath`)}
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.imagePath`}
                        onChange={() => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`)}
                      />
                    )}
                    {getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME && (
                      <ExperimentalInput
                        formik={formik}
                        disabled={disableField(`sidecars[${index}].sidecar.spec.registryHostname`)}
                        selectItems={gcrUrlList}
                        useValue
                        multiTypeInputProps={{
                          onChange: () => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`),
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          selectProps: { allowCreatingNewItems: true, addClearBtn: true, items: gcrUrlList }
                        }}
                        label={getString('connectors.GCR.registryHostname')}
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.registryHostname`}
                      />
                    )}
                    {/* If it is selectedartifact modal/triggers we need the tag to be disabled and have the default value */}
                    {fromTrigger &&
                      getMultiTypeFromValue(template?.artifacts?.sidecars?.[index]?.sidecar?.spec?.tag) ===
                        MultiTypeInputType.RUNTIME && (
                        <FormInput.MultiTextInput
                          label={getString('tagLabel')}
                          multiTextInputProps={{
                            expressions,
                            value: TriggerDefaultFieldList.build,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                          disabled={true}
                          name={`${path}.artifacts.sidecars[${index}].sidecar.spec.tag`}
                        />
                      )}
                    {!fromTrigger &&
                      getMultiTypeFromValue(template?.artifacts?.sidecars?.[index]?.sidecar?.spec?.tag) ===
                        MultiTypeInputType.RUNTIME && (
                        <ExperimentalInput
                          formik={formik}
                          useValue
                          disabled={disableField(`sidecars[${index}].sidecar.spec.tag`, true)}
                          selectItems={
                            dockerLoading || gcrLoading || ecrLoading
                              ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                              : getSelectItems(`sidecars[${index}]`)
                          }
                          multiTypeInputProps={{
                            onFocus: (e: any) => {
                              if (
                                e?.target?.type !== 'text' ||
                                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                              ) {
                                return
                              }
                              const sidecarIndex =
                                initialValues?.artifacts?.sidecars?.findIndex(
                                  (sidecar: any) => sidecar.sidecar?.identifier === identifier
                                ) ?? -1
                              const imagePathCurrent =
                                getMultiTypeFromValue(artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.imagePath) !==
                                MultiTypeInputType.RUNTIME
                                  ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.imagePath
                                  : currentSidecarSpec?.imagePath
                              const connectorRefCurrent =
                                getMultiTypeFromValue(
                                  artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.connectorRef
                                ) !== MultiTypeInputType.RUNTIME
                                  ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.connectorRef
                                  : currentSidecarSpec?.connectorRef
                              const regionCurrent =
                                getMultiTypeFromValue(artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.region) !==
                                MultiTypeInputType.RUNTIME
                                  ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.region
                                  : currentSidecarSpec?.region
                              const registryHostnameCurrent =
                                getMultiTypeFromValue(
                                  artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.registryHostname
                                ) !== MultiTypeInputType.RUNTIME
                                  ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.registryHostname
                                  : currentSidecarSpec?.registryHostname
                              const tagsPath = `sidecars[${sidecarIndex}]`
                              !isTagSelectionDisabled(
                                artifacts?.sidecars?.[sidecarIndex]?.sidecar?.type || '',
                                sidecarIndex
                              ) &&
                                fetchTags({
                                  path: tagsPath,
                                  imagePath: imagePathCurrent,
                                  connectorRef: connectorRefCurrent,
                                  connectorType: artifacts?.sidecars?.[index]?.sidecar?.type,
                                  registryHostname: registryHostnameCurrent,
                                  region: regionCurrent
                                })
                            },
                            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                            value: TriggerDefaultFieldList.build,
                            expressions,
                            selectProps: {
                              items:
                                dockerLoading || gcrLoading || ecrLoading
                                  ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                                  : getSelectItems(`sidecars[${index}]`),
                              usePortal: true,
                              addClearBtn: true && !readonly,
                              noResults: (
                                <Text lineClamp={1}>
                                  {get(ecrError || gcrError || dockerError, 'data.message', null) ||
                                    getString('pipelineSteps.deploy.errors.notags')}
                                </Text>
                              ),
                              itemRenderer: itemRenderer,
                              allowCreatingNewItems: true
                            }
                          }}
                          label={getString('tagLabel')}
                          name={`${path}.artifacts.sidecars[${index}].sidecar.spec.tag`}
                        />
                      )}
                    {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.tagRegex) ===
                      MultiTypeInputType.RUNTIME && (
                      <FormInput.MultiTextInput
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                        disabled={disableField(`sidecars[${index}].sidecar.spec.tagRegex`)}
                        label={getString('tagRegex')}
                        name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.tagRegex`}
                      />
                    )}
                  </Layout.Vertical>
                )
              }
            )}
          </div>
        </div>
      )}
    </>
  )
}

export const ArtifactInputForm = connect(ArtifactInputSetForm)

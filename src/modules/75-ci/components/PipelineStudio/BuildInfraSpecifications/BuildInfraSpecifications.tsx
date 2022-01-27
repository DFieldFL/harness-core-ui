/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import * as yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import {
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Text,
  Card,
  Accordion,
  FontVariation,
  ThumbnailSelect,
  IconName,
  Container,
  Icon
} from '@wings-software/uicore'
import { isEmpty, isUndefined, set, uniqBy } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { produce } from 'immer'
import type { FormikProps } from 'formik'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getStageIndexFromPipeline,
  getFlattenedStages
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { Separator } from '@common/components'
import type { MultiTypeMapType, MultiTypeMapUIType, MapType } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { K8sDirectInfraYaml, UseFromStageInfraYaml, VmInfraYaml, VmPoolYaml } from 'services/ci'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { k8sLabelRegex, k8sAnnotationRegex } from '@common/utils/StringUtils'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { BuildTabs } from '../CIPipelineStagesUtils'
import css from './BuildInfraSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)
const k8sClusterKeyRef = 'connectors.title.k8sCluster'
const namespaceKeyRef = 'pipelineSteps.build.infraSpecifications.namespace'
const poolIdKeyRef = 'pipeline.buildInfra.poolId'

interface BuildInfraTypeItem {
  label: string
  icon: IconName
  value: K8sDirectInfraYaml['type']
  disabled?: boolean
}

interface KubernetesBuildInfraFormValues {
  connectorRef?: string
  namespace?: string
  serviceAccountName?: string
  runAsUser?: string
  initTimeout?: string
  useFromStage?: string
  annotations?: MultiTypeMapUIType
  labels?: MultiTypeMapUIType
}

interface AWSVMInfraFormValues {
  poolId?: string
}

type BuildInfraFormValues = (KubernetesBuildInfraFormValues | AWSVMInfraFormValues) & {
  buildInfraType?: K8sDirectInfraYaml['type']
}

enum Modes {
  Propagate,
  NewConfiguration
}

type FieldValueType = yup.Ref | yup.Schema<any> | yup.MixedSchema<any>

const getInitialMapValues: (value: MultiTypeMapType) => MultiTypeMapUIType = value => {
  const map =
    typeof value === 'string'
      ? value
      : Object.keys(value || {}).map(key => ({
          id: uuid('', nameSpace()),
          key: key,
          value: value[key]
        }))

  return map
}

const getMapValues: (value: MultiTypeMapUIType) => MultiTypeMapType = value => {
  const map: MapType = {}
  if (Array.isArray(value)) {
    value.forEach(mapValue => {
      if (mapValue.key) {
        map[mapValue.key] = mapValue.value
      }
    })
  }

  return typeof value === 'string' ? value : map
}

const testLabelKey = (value: string): boolean => {
  return (
    ['accountid', 'orgid', 'projectid', 'pipelineid', 'pipelineexecutionid', 'stageid', 'buildnumber'].indexOf(
      value.toLowerCase()
    ) === -1
  )
}

const getFieldSchema = (
  value: FieldValueType,
  regex: RegExp,
  getString?: UseStringsReturn['getString']
): Record<string, any> => {
  if (Array.isArray(value)) {
    return yup
      .array()
      .of(
        yup.object().shape(
          {
            key: yup.string().when('value', {
              is: val => val?.length,
              then: yup
                .string()
                .matches(regex, getString?.('validation.validKeyRegex'))
                .required(getString?.('validation.keyRequired'))
            }),
            value: yup.string().when('key', {
              is: val => val?.length,
              then: yup.string().required(getString?.('validation.valueRequired'))
            })
          },
          [['key', 'value']]
        )
      )
      .test('keysShouldBeUnique', getString?.('validation.uniqueKeys') || '', map => {
        if (!map) return true

        return uniqBy(map, 'key').length === map.length
      })
  } else {
    return yup.string()
  }
}

export default function BuildInfraSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitScope = useGitScope()
  const { CI_VM_INFRASTRUCTURE } = useFeatureFlags()

  const buildInfraTypes: BuildInfraTypeItem[] = [
    {
      label: getString('serviceDeploymentTypes.kubernetes'),
      icon: 'service-kubernetes',
      value: 'KubernetesDirect'
    },
    {
      label: getString('ci.buildInfa.awsVMs'),
      icon: 'service-aws',
      value: 'VM'
    }
  ]

  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    allowableTypes,
    isReadonly,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  const [currentMode, setCurrentMode] = React.useState(() =>
    (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
      ? Modes.Propagate
      : Modes.NewConfiguration
  )

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getFlattenedStages(pipeline)
  const { stage: propagatedStage } = getStageFromPipeline<BuildStageElementConfig>(
    (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage || ''
  )

  const [buildInfraType, setBuildInfraType] = useState<K8sDirectInfraYaml['type'] | undefined>(
    CI_VM_INFRASTRUCTURE ? undefined : 'KubernetesDirect'
  )

  React.useEffect(() => {
    if (CI_VM_INFRASTRUCTURE) {
      const stageBuildInfraType = (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.type
      const propagatedStageType = (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.type
      currentMode === Modes.NewConfiguration
        ? setBuildInfraType(stageBuildInfraType)
        : setBuildInfraType(propagatedStageType)
    }
  }, [stage, propagatedStage, currentMode])

  const otherBuildStagesWithInfraConfigurationOptions: { label: string; value: string }[] = []

  if (stages && stages.length > 0) {
    stages.forEach((item, index) => {
      if (
        index < stageIndex &&
        item.stage?.type === 'CI' &&
        ((item.stage as BuildStageElementConfig)?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
      ) {
        otherBuildStagesWithInfraConfigurationOptions.push({
          label: `Stage [${item.stage.name}]`,
          value: item.stage.identifier
        })
      }
    })
  }

  const getKubernetesInfraPayload = useMemo((): BuildInfraFormValues => {
    return {
      namespace: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace,
      serviceAccountName: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.serviceAccountName,
      runAsUser: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.runAsUser as unknown as string,
      initTimeout: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.initTimeout,
      annotations: getInitialMapValues(
        (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.annotations || {}
      ),
      labels: getInitialMapValues((stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.labels || {}),
      buildInfraType: 'KubernetesDirect'
    }
  }, [stage])

  const getInitialValues = useMemo((): BuildInfraFormValues => {
    if (stage?.stage?.spec?.infrastructure) {
      if ((stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage) {
        return {
          useFromStage: (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage,
          buildInfraType: undefined
        }
      } else {
        const infraType = (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.type
        if (infraType === 'KubernetesDirect') {
          const connectorId =
            ((stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef as string) || ''
          if (!isEmpty(connectorId)) {
            return {
              connectorRef: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef,
              ...getKubernetesInfraPayload
            }
          } else {
            return {
              connectorRef: undefined,
              ...getKubernetesInfraPayload
            }
          }
        } else if (infraType === 'VM') {
          const identifier =
            ((stage?.stage?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.identifier || ''
          if (!isEmpty(identifier)) {
            return {
              poolId: identifier,
              buildInfraType: 'VM'
            }
          } else {
            return {
              poolId: '',
              buildInfraType: 'VM'
            }
          }
        }
        return {
          connectorRef: undefined,
          namespace: '',
          annotations: '',
          labels: '',
          buildInfraType: undefined,
          poolId: undefined
        }
      }
    }
    return {
      connectorRef: undefined,
      namespace: '',
      annotations: '',
      labels: '',
      buildInfraType: undefined,
      poolId: undefined
    }
  }, [stage])

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: BuildTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: BuildTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  const handleValidate = (values: any): void => {
    if (stage) {
      const errors: { [key: string]: string } = {}
      const stageData = produce(stage, draft => {
        if (currentMode === Modes.Propagate && values.useFromStage) {
          set(draft, 'stage.spec.infrastructure', {
            useFromStage: values.useFromStage
          })
        } else {
          const filteredLabels = getMapValues(
            Array.isArray(values.labels) ? values.labels.filter((val: any) => testLabelKey(val.key)) : values.labels
          )
          try {
            getDurationValidationSchema().validateSync(values.initTimeout)
          } catch (e) {
            errors.initTimeout = e.message
          }
          set(
            draft,
            'stage.spec.infrastructure',
            buildInfraType === 'KubernetesDirect'
              ? {
                  type: 'KubernetesDirect',
                  spec: {
                    connectorRef:
                      values?.connectorRef?.value ||
                      values?.connectorRef ||
                      (draft.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef,
                    namespace: values.namespace,
                    serviceAccountName: values.serviceAccountName,
                    runAsUser: values.runAsUser,
                    initTimeout: errors.initTimeout ? undefined : values.initTimeout,
                    annotations: getMapValues(values.annotations),
                    labels: !isEmpty(filteredLabels) ? filteredLabels : undefined
                  }
                }
              : buildInfraType === 'VM'
              ? {
                  type: 'VM',
                  spec: {
                    type: 'Pool',
                    spec: {
                      identifier: values.poolId
                    }
                  }
                }
              : { type: undefined, spec: {} }
          )

          if (
            !values.annotations ||
            !values.annotations.length ||
            (values.annotations.length === 1 && !values.annotations[0].key)
          ) {
            delete (draft.stage?.spec?.infrastructure as K8sDirectInfraYaml).spec.annotations
          }
        }
      })

      if (stageData.stage) {
        updateStage(stageData.stage)
      }

      return values.labels?.reduce?.((acc: Record<string, string>, curr: any, index: number) => {
        if (!testLabelKey(curr.key)) {
          acc[`labels[${index}].key`] = curr.key + ' is not allowed.'
        }
        return acc
      }, errors)
    }
  }

  const renderUserAndTimeOutFields = React.useCallback((): React.ReactElement => {
    return (
      <>
        <Container className={css.bottomMargin7}>
          <MultiTypeTextField
            label={
              <Text
                font={{ variation: FontVariation.FORM_LABEL }}
                margin={{ bottom: 'xsmall' }}
                tooltipProps={{ dataTooltipId: 'runAsUser' }}
              >
                {getString('pipeline.stepCommonFields.runAsUser')}
              </Text>
            }
            name="runAsUser"
            style={{ width: 300, marginBottom: 'var(--spacing-xsmall)' }}
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: isReadonly,
              placeholder: '1000'
            }}
          />
        </Container>
        <Container className={css.bottomMargin7}>
          <FormMultiTypeDurationField
            name="initTimeout"
            multiTypeDurationProps={{ expressions, allowableTypes }}
            label={
              <Text
                font={{ variation: FontVariation.FORM_LABEL }}
                margin={{ bottom: 'xsmall' }}
                tooltipProps={{ dataTooltipId: 'timeout' }}
              >
                {getString('pipeline.infraSpecifications.initTimeout')}
              </Text>
            }
            disabled={isReadonly}
            style={{ width: 300 }}
          />
        </Container>
      </>
    )
  }, [])

  const renderMultiTypeMap = React.useCallback(
    (fieldName: string, stringKey: keyof StringsMap): React.ReactElement => (
      <Container className={cx(css.bottomMargin7, css.formGroup, { [css.md]: CI_VM_INFRASTRUCTURE })}>
        <MultiTypeMap
          appearance={'minimal'}
          cardStyle={{ width: '50%' }}
          name={fieldName}
          valueMultiTextInputProps={{ expressions, allowableTypes }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                {getString(stringKey)}
              </Text>
            ),
            disableTypeSelection: true
          }}
          disabled={isReadonly}
        />
      </Container>
    ),
    []
  )

  const renderKubernetesBuildInfraAdvancedSection = React.useCallback((showCardView = false): React.ReactElement => {
    return (
      <Container padding={{ bottom: 'medium' }}>
        <Accordion activeId={''}>
          <Accordion.Panel
            id="advanced"
            addDomId={true}
            summary={
              <div
                className={css.tabHeading}
                id="advanced"
                style={{ paddingLeft: 'var(--spacing-small)', marginBottom: 0 }}
              >
                {getString('advancedTitle')}
              </div>
            }
            details={
              showCardView ? (
                <Card disabled={isReadonly} className={css.sectionCard}>
                  {renderAccordianDetailSection()}
                </Card>
              ) : (
                renderAccordianDetailSection()
              )
            }
          />
        </Accordion>
      </Container>
    )
  }, [])

  const renderBuildInfraMainSection = React.useCallback((): React.ReactElement => {
    return buildInfraType === 'KubernetesDirect' ? (
      renderKubernetesBuildInfraForm()
    ) : buildInfraType === 'VM' ? (
      renderAWSVMBuildInfraForm()
    ) : (
      <></>
    )
  }, [buildInfraType])

  const renderAWSVMBuildInfraForm = React.useCallback((): React.ReactElement => {
    return (
      <MultiTypeTextField
        label={
          <Text
            tooltipProps={{ dataTooltipId: 'poolId' }}
            font={{ variation: FontVariation.FORM_LABEL }}
            margin={{ bottom: 'xsmall' }}
          >
            {getString('pipeline.buildInfra.poolId')}
          </Text>
        }
        name={'poolId'}
        style={{ width: 300 }}
        multiTextInputProps={{
          multiTextInputProps: { expressions, allowableTypes },
          disabled: isReadonly
        }}
      />
    )
  }, [])

  const renderKubernetesBuildInfraForm = React.useCallback((): React.ReactElement => {
    return (
      <>
        <Container className={css.bottomMargin3}>
          <FormMultiTypeConnectorField
            width={300}
            name="connectorRef"
            label={
              <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                {getString(k8sClusterKeyRef)}
              </Text>
            }
            placeholder={getString('pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            gitScope={gitScope}
            multiTypeProps={{ expressions, disabled: isReadonly, allowableTypes }}
          />
        </Container>
        <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
          <MultiTypeTextField
            label={
              <Text
                tooltipProps={{ dataTooltipId: 'namespace' }}
                font={{ variation: FontVariation.FORM_LABEL }}
                margin={{ bottom: 'xsmall' }}
              >
                {getString(namespaceKeyRef)}
              </Text>
            }
            name={'namespace'}
            style={{ width: 300 }}
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: isReadonly,
              placeholder: getString('pipeline.infraSpecifications.namespacePlaceholder')
            }}
          />
        </div>
      </>
    )
  }, [])

  const renderAccordianDetailSection = React.useCallback((): React.ReactElement => {
    return (
      <>
        <Container className={css.bottomMargin7}>
          <FormInput.MultiTextInput
            label={
              <Text
                font={{ variation: FontVariation.FORM_LABEL }}
                margin={{ bottom: 'xsmall' }}
                tooltipProps={{ dataTooltipId: 'serviceAccountName' }}
              >
                {getString('pipeline.infraSpecifications.serviceAccountName')}
              </Text>
            }
            name="serviceAccountName"
            placeholder={getString('pipeline.infraSpecifications.serviceAccountNamePlaceholder')}
            style={{
              width: 300
            }}
            multiTextInputProps={{ expressions, disabled: isReadonly, allowableTypes }}
          />
        </Container>
        {renderUserAndTimeOutFields()}
        <Container className={css.bottomMargin7}>{renderMultiTypeMap('annotations', 'ci.annotations')}</Container>
        <Container className={css.bottomMargin7}>{renderMultiTypeMap('labels', 'ci.labels')}</Container>
      </>
    )
  }, [])

  const getValidationSchema = React.useCallback(
    (): yup.Schema<unknown> =>
      buildInfraType === 'KubernetesDirect'
        ? yup.object().shape({
            connectorRef: yup
              .string()
              .nullable()
              .test(
                'connectorRef required only for New configuration',
                getString('fieldRequired', { field: getString(k8sClusterKeyRef) }) || '',
                function (connectorRef) {
                  if (isEmpty(connectorRef) && currentMode === Modes.NewConfiguration) {
                    return false
                  }
                  return true
                }
              ),
            namespace: yup
              .string()
              .nullable()
              .test(
                'namespace required only for New configuration',
                getString('fieldRequired', { field: getString(namespaceKeyRef) }) || '',
                function (namespace) {
                  if (isEmpty(namespace) && currentMode === Modes.NewConfiguration) {
                    return false
                  }
                  return true
                }
              ),
            useFromStage: yup
              .string()
              .nullable()
              .test(
                'useFromStage required only when Propagate from an existing stage',
                getString('pipeline.infraSpecifications.validation.requiredExistingStage') || '',
                function (useFromStage) {
                  if (isEmpty(useFromStage) && currentMode === Modes.Propagate) {
                    return false
                  }
                  return true
                }
              ),
            runAsUser: yup.string().test(
              'Must be a number and allows runtimeinput or expression',
              getString('pipeline.stepCommonFields.validation.mustBeANumber', {
                label: getString('pipeline.stepCommonFields.runAsUser')
              }) || '',
              function (runAsUser) {
                if (isUndefined(runAsUser) || !runAsUser) {
                  return true
                } else if (runAsUser.startsWith('<+')) {
                  return true
                }
                return !isNaN(runAsUser)
              }
            ),
            annotations: yup.lazy(
              (value: FieldValueType) => getFieldSchema(value, k8sAnnotationRegex) as yup.Schema<FieldValueType>
            ),
            labels: yup.lazy(
              (value: FieldValueType) => getFieldSchema(value, k8sLabelRegex) as yup.Schema<FieldValueType>
            )
          })
        : buildInfraType === 'VM'
        ? yup.object().shape({
            useFromStage: yup
              .string()
              .nullable()
              .test(
                'useFromStage required only when Propagate from an existing stage',
                getString('pipeline.infraSpecifications.validation.requiredExistingStage') || '',
                function (useFromStage) {
                  if (isEmpty(useFromStage) && currentMode === Modes.Propagate) {
                    return false
                  }
                  return true
                }
              ),
            poolId: yup
              .string()
              .nullable()
              .test(
                'pool id required only for New configuration',
                getString('fieldRequired', { field: getString(poolIdKeyRef) }) || '',
                function (poolId) {
                  if (isEmpty(poolId) && currentMode === Modes.NewConfiguration) {
                    return false
                  }
                  return true
                }
              )
          })
        : yup.object().shape({
            buildInfraType: yup
              .string()
              .nullable()
              .test(
                'buildInfraType required only when Propagate from an existing stage',
                getString('ci.buildInfa.label') || '',
                function (buildInfra) {
                  return !isEmpty(buildInfra)
                }
              )
          }),
    [buildInfraType, currentMode]
  )

  return (
    <div className={css.wrapper}>
      <ErrorsStripBinded />
      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues}
          validationSchema={getValidationSchema()}
          validate={handleValidate}
          formName="ciBuildInfra"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {formik => {
            const { setFieldValue } = formik
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: BuildTabs.INFRASTRUCTURE }))
            formikRef.current = formik
            return (
              <Layout.Vertical>
                <Text font={{ variation: FontVariation.H5 }} id="infrastructureDefinition">
                  {getString('pipelineSteps.build.infraSpecifications.whereToRun')}
                </Text>
                <FormikForm>
                  <Layout.Horizontal spacing="xxlarge">
                    <Layout.Vertical>
                      {otherBuildStagesWithInfraConfigurationOptions.length ? (
                        <>
                          <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                            <Layout.Horizontal spacing="xxlarge">
                              {/* Propagate section */}
                              <div
                                className={cx(css.card, { [css.active]: currentMode === Modes.Propagate })}
                                onClick={() => {
                                  setCurrentMode(Modes.Propagate)
                                }}
                              >
                                <Text className={css.cardTitle} color="black" margin={{ bottom: 'large' }}>
                                  {getString('pipelineSteps.build.infraSpecifications.propagate')}
                                </Text>
                                <FormInput.Select
                                  name="useFromStage"
                                  items={otherBuildStagesWithInfraConfigurationOptions}
                                  disabled={isReadonly}
                                />
                                {buildInfraType === 'KubernetesDirect' ? (
                                  <>
                                    {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                      ?.connectorRef && (
                                      <>
                                        <Text
                                          font={{ variation: FontVariation.FORM_LABEL }}
                                          margin={{ bottom: 'xsmall' }}
                                        >
                                          {getString(k8sClusterKeyRef)}
                                        </Text>
                                        <Text color="black" margin={{ bottom: 'medium' }}>
                                          {
                                            (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                              ?.connectorRef
                                          }
                                        </Text>
                                      </>
                                    )}
                                    {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                      ?.namespace && (
                                      <>
                                        <Text
                                          font={{ variation: FontVariation.FORM_LABEL }}
                                          margin={{ bottom: 'xsmall' }}
                                          tooltipProps={{ dataTooltipId: 'namespace' }}
                                        >
                                          {getString(namespaceKeyRef)}
                                        </Text>
                                        <Text color="black">
                                          {
                                            (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                              ?.namespace
                                          }
                                        </Text>
                                      </>
                                    )}
                                    {((propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                      ?.serviceAccountName ||
                                      (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                        ?.runAsUser ||
                                      (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                        ?.initTimeout ||
                                      (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                        ?.annotations ||
                                      (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                        ?.labels) && (
                                      <Accordion activeId={''}>
                                        <Accordion.Panel
                                          id="advanced"
                                          addDomId={true}
                                          summary={
                                            <div
                                              className={css.tabHeading}
                                              id="advanced"
                                              style={{ paddingLeft: 'var(--spacing-small)', marginBottom: 0 }}
                                            >
                                              {getString('advancedTitle')}
                                            </div>
                                          }
                                          details={
                                            <>
                                              {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)
                                                ?.spec?.serviceAccountName && (
                                                <>
                                                  <Text
                                                    font={{ variation: FontVariation.FORM_LABEL }}
                                                    margin={{ bottom: 'xsmall' }}
                                                    tooltipProps={{ dataTooltipId: 'serviceAccountName' }}
                                                  >
                                                    {getString('pipeline.infraSpecifications.serviceAccountName')}
                                                  </Text>
                                                  <Text color="black" margin={{ bottom: 'medium' }}>
                                                    {
                                                      (
                                                        propagatedStage?.stage?.spec
                                                          ?.infrastructure as K8sDirectInfraYaml
                                                      )?.spec?.serviceAccountName
                                                    }
                                                  </Text>
                                                </>
                                              )}
                                              {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)
                                                ?.spec?.runAsUser && (
                                                <>
                                                  <Text
                                                    font={{ variation: FontVariation.FORM_LABEL }}
                                                    margin={{ bottom: 'xsmall' }}
                                                    tooltipProps={{ dataTooltipId: 'runAsUser' }}
                                                  >
                                                    {getString('pipeline.stepCommonFields.runAsUser')}
                                                  </Text>
                                                  <Text color="black" margin={{ bottom: 'medium' }}>
                                                    {
                                                      (
                                                        propagatedStage?.stage?.spec
                                                          ?.infrastructure as K8sDirectInfraYaml
                                                      )?.spec?.runAsUser
                                                    }
                                                  </Text>
                                                </>
                                              )}
                                              {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)
                                                ?.spec?.initTimeout && (
                                                <>
                                                  <Text
                                                    font={{ variation: FontVariation.FORM_LABEL }}
                                                    margin={{ bottom: 'xsmall' }}
                                                    tooltipProps={{ dataTooltipId: 'timeout' }}
                                                  >
                                                    {getString('pipeline.infraSpecifications.initTimeout')}
                                                  </Text>
                                                  <Text color="black" margin={{ bottom: 'medium' }}>
                                                    {
                                                      (
                                                        propagatedStage?.stage?.spec
                                                          ?.infrastructure as K8sDirectInfraYaml
                                                      )?.spec?.initTimeout
                                                    }
                                                  </Text>
                                                </>
                                              )}
                                              {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)
                                                ?.spec?.annotations && (
                                                <>
                                                  <Text
                                                    font={{ variation: FontVariation.FORM_LABEL }}
                                                    margin={{ bottom: 'xsmall' }}
                                                  >
                                                    {getString('ci.annotations')}
                                                  </Text>
                                                  {typeof (
                                                    propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml
                                                  )?.spec?.annotations === 'string' ? (
                                                    <Text color="black">
                                                      {
                                                        (
                                                          propagatedStage?.stage?.spec
                                                            ?.infrastructure as K8sDirectInfraYaml
                                                        )?.spec.annotations
                                                      }
                                                    </Text>
                                                  ) : (
                                                    <ul className={css.plainList}>
                                                      {Object.entries(
                                                        (
                                                          propagatedStage?.stage?.spec
                                                            ?.infrastructure as K8sDirectInfraYaml
                                                        )?.spec?.annotations || {}
                                                      )?.map((entry, idx) => (
                                                        <li key={idx}>
                                                          <Text color="black">
                                                            {entry[0]}:{entry[1]}
                                                          </Text>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  )}
                                                </>
                                              )}
                                              {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)
                                                ?.spec?.labels && (
                                                <>
                                                  <Text
                                                    font={{ variation: FontVariation.FORM_LABEL }}
                                                    margin={{ bottom: 'xsmall' }}
                                                  >
                                                    {getString('ci.labels')}
                                                  </Text>
                                                  {typeof (
                                                    propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml
                                                  )?.spec?.labels === 'string' ? (
                                                    <Text color="black">
                                                      {
                                                        (
                                                          propagatedStage?.stage?.spec
                                                            ?.infrastructure as K8sDirectInfraYaml
                                                        )?.spec?.labels
                                                      }
                                                    </Text>
                                                  ) : (
                                                    <ul className={css.plainList}>
                                                      {Object.entries(
                                                        (
                                                          propagatedStage?.stage?.spec
                                                            ?.infrastructure as K8sDirectInfraYaml
                                                        )?.spec?.labels || {}
                                                      )?.map((entry, idx) => (
                                                        <li key={idx}>
                                                          <Text color="black">
                                                            {entry[0]}:{entry[1]}
                                                          </Text>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  )}
                                                </>
                                              )}
                                            </>
                                          }
                                        />
                                      </Accordion>
                                    )}
                                  </>
                                ) : buildInfraType === 'VM' &&
                                  ((propagatedStage?.stage?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)
                                    ?.spec?.identifier ? (
                                  <>
                                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                                      {getString(poolIdKeyRef)}
                                    </Text>
                                    <Text color="black" margin={{ bottom: 'medium' }}>
                                      {
                                        (
                                          (propagatedStage?.stage?.spec?.infrastructure as VmInfraYaml)
                                            ?.spec as VmPoolYaml
                                        )?.spec?.identifier
                                      }
                                    </Text>
                                  </>
                                ) : null}
                              </div>
                              {/* New configuration section */}
                              <div
                                className={cx(css.card, { [css.active]: currentMode === Modes.NewConfiguration })}
                                onClick={() => {
                                  if (currentMode === Modes.Propagate) {
                                    const newStageData = produce(stage, draft => {
                                      if (draft) {
                                        set(
                                          draft,
                                          'stage.spec.infrastructure',
                                          buildInfraType === 'KubernetesDirect'
                                            ? {
                                                type: 'KubernetesDirect',
                                                spec: {
                                                  connectorRef: '',
                                                  namespace: '',
                                                  annotations: {},
                                                  labels: {}
                                                }
                                              }
                                            : buildInfraType === 'VM'
                                            ? {
                                                type: 'VM',
                                                spec: {
                                                  identifier: ''
                                                }
                                              }
                                            : { type: undefined, spec: {} }
                                        )
                                      }
                                    })
                                    setFieldValue('buildInfraType', buildInfraType)
                                    setFieldValue('useFromStage', '')
                                    if (newStageData?.stage) {
                                      updateStage(newStageData.stage)
                                    }
                                  }
                                  setCurrentMode(Modes.NewConfiguration)
                                }}
                              >
                                <>
                                  {CI_VM_INFRASTRUCTURE ? (
                                    <>
                                      <Text className={css.cardTitle} color="black" margin={{ bottom: 'large' }}>
                                        {getString('ci.buildInfa.useNewInfra')}
                                      </Text>
                                      <ThumbnailSelect
                                        name={'buildInfraType'}
                                        items={buildInfraTypes}
                                        isReadonly={isReadonly}
                                        onChange={val => {
                                          const infraType = val as K8sDirectInfraYaml['type']
                                          setFieldValue('buildInfraType', infraType)
                                          setBuildInfraType(val as K8sDirectInfraYaml['type'])
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <Text className={css.cardTitle} color="black" margin={{ bottom: 'large' }}>
                                      {getString('pipelineSteps.build.infraSpecifications.newConfiguration')}
                                    </Text>
                                  )}
                                  {CI_VM_INFRASTRUCTURE ? null : (
                                    <>
                                      {renderKubernetesBuildInfraForm()}
                                      {renderKubernetesBuildInfraAdvancedSection()}
                                    </>
                                  )}
                                </>
                              </div>
                            </Layout.Horizontal>
                            {CI_VM_INFRASTRUCTURE && currentMode === Modes.NewConfiguration ? (
                              <>
                                {buildInfraType ? <Separator topSeparation={30} /> : null}
                                {renderBuildInfraMainSection()}
                              </>
                            ) : null}
                          </Card>
                          {CI_VM_INFRASTRUCTURE &&
                          currentMode === Modes.NewConfiguration &&
                          buildInfraType === 'KubernetesDirect'
                            ? renderKubernetesBuildInfraAdvancedSection(true)
                            : null}
                        </>
                      ) : (
                        <>
                          <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                            <Layout.Vertical spacing="small">
                              {CI_VM_INFRASTRUCTURE ? (
                                <>
                                  <Text font={{ variation: FontVariation.FORM_HELP }} padding={{ bottom: 'medium' }}>
                                    {getString('ci.buildInfa.selectInfra')}
                                  </Text>
                                  <ThumbnailSelect
                                    name={'buildInfraType'}
                                    items={buildInfraTypes}
                                    isReadonly={isReadonly}
                                    onChange={val => {
                                      const infraType = val as K8sDirectInfraYaml['type']
                                      setFieldValue('buildInfraType', infraType)
                                      setBuildInfraType(val as K8sDirectInfraYaml['type'])
                                    }}
                                  />
                                </>
                              ) : null}
                              {CI_VM_INFRASTRUCTURE ? (
                                <>
                                  {buildInfraType ? <Separator topSeparation={10} /> : null}
                                  {renderBuildInfraMainSection()}
                                </>
                              ) : (
                                renderKubernetesBuildInfraForm()
                              )}
                            </Layout.Vertical>
                          </Card>
                          {buildInfraType === 'KubernetesDirect'
                            ? renderKubernetesBuildInfraAdvancedSection(true)
                            : null}
                        </>
                      )}
                    </Layout.Vertical>
                    {CI_VM_INFRASTRUCTURE ? (
                      <Container className={css.helptext} margin={{ top: 'medium' }} padding="large">
                        <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'start' }}>
                          <Icon name="info-messaging" size={20} />
                          <Text font={{ variation: FontVariation.H5 }}>
                            {getString('ci.buildInfa.infrastructureTypesLabel')}
                          </Text>
                        </Layout.Horizontal>
                        <>
                          <Text font={{ variation: FontVariation.BODY2 }} padding={{ top: 'xlarge', bottom: 'xsmall' }}>
                            {getString('ci.buildInfa.k8sLabel')}
                          </Text>
                          <Text font={{ variation: FontVariation.SMALL }}>
                            {getString('ci.buildInfa.kubernetesHelpText')}
                          </Text>
                        </>
                        <Separator />
                        <>
                          <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }}>
                            {getString('ci.buildInfa.vmLabel')}
                          </Text>
                          <Text font={{ variation: FontVariation.SMALL }}>{getString('ci.buildInfa.awsHelpText')}</Text>
                        </>
                        {/* <Container padding={{ top: 'medium' }}>
                          <Link to="/">{getString('learnMore')}</Link>
                        </Container> */}
                      </Container>
                    ) : null}
                  </Layout.Horizontal>
                </FormikForm>
              </Layout.Vertical>
            )
          }}
        </Formik>
        {children}
      </div>
    </div>
  )
}

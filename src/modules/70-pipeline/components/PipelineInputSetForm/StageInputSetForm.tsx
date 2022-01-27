/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Label,
  FormInput,
  MultiTypeInputType,
  Icon,
  Layout,
  Text,
  getMultiTypeFromValue,
  FontVariation,
  Container
} from '@wings-software/uicore'
import { connect } from 'formik'
import { get, set, isEmpty, pickBy, identity, isNil } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type {
  DeploymentStageConfig,
  ServiceSpec,
  ExecutionWrapperConfig,
  ServiceConfig,
  PipelineInfrastructure,
  Infrastructure,
  StageOverridesConfig,
  StepElementConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { ConnectorRefWidth } from '@pipeline/utils/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'

import { CollapseForm } from './CollapseForm'
import { getStepFromStage } from '../PipelineStudio/StepUtil'
import { StepWidget } from '../AbstractSteps/StepWidget'
import type { StepViewType } from '../AbstractSteps/Step'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PipelineInputSetForm.module.scss'

function ServiceDependencyForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes
}: {
  template?: any
  allValues?: any
  values?: any
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      <Label>
        <Icon
          padding={{ right: 'small' }}
          name={factory.getStepIcon(allValues.type || /* istanbul ignore next */ '')}
        />
        {getString('pipeline.serviceDependencyText')}: {getString('pipeline.stepLabel', allValues)}
      </Label>
      <div>
        <StepWidget<any>
          factory={factory}
          readonly={readonly}
          path={path}
          allowableTypes={allowableTypes}
          template={template}
          initialValues={values || {}}
          allValues={allValues || {}}
          type={(allValues?.type as StepType) || ''}
          onUpdate={onUpdate}
          stepViewType={viewType}
        />
      </div>
    </Layout.Vertical>
  )
}

function StepFormInternal({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { expressions } = useVariablesExpression()
  return (
    <div>
      <StepWidget<Partial<StepElementConfig>>
        factory={factory}
        readonly={readonly}
        path={path}
        allowableTypes={allowableTypes}
        template={template?.step}
        initialValues={values?.step || {}}
        allValues={allValues?.step || {}}
        type={(allValues?.step as StepElementConfig)?.type as StepType}
        onUpdate={onUpdate}
        stepViewType={viewType}
      />
      {getMultiTypeFromValue((template?.step as StepElementConfig)?.spec?.delegateSelectors) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <MultiTypeDelegateSelector
            expressions={expressions}
            inputProps={{ projectIdentifier, orgIdentifier }}
            allowableTypes={allowableTypes}
            label={getString('delegate.DelegateSelector')}
            name={`${path}.spec.delegateSelectors`}
            disabled={readonly}
          />
        </div>
      )}
    </div>
  )
}

export function StepForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes,
  hideTitle = false
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: MultiTypeInputType[]
  hideTitle?: boolean
}): JSX.Element {
  const { getString } = useStrings()
  const isTemplateStep = (template?.step as unknown as TemplateStepNode)?.template
  const type = isTemplateStep
    ? ((template?.step as unknown as TemplateStepNode)?.template.templateInputs as StepElementConfig)?.type
    : ((template?.step as StepElementConfig)?.type as StepType)
  const iconColor = factory.getStepIconColor(type)

  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      {!hideTitle && (
        <Label>
          <Icon
            padding={{ right: 'small' }}
            {...(iconColor ? { color: iconColor } : {})}
            style={{ color: iconColor }}
            name={factory.getStepIcon(type)}
          />
          {getString('pipeline.execution.stepTitlePrefix')}
          {getString('pipeline.stepLabel', allValues?.step)}
        </Label>
      )}
      <StepFormInternal
        template={
          isTemplateStep
            ? { step: (template?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : template
        }
        allValues={
          (allValues?.step as unknown as TemplateStepNode)?.template
            ? { step: (allValues?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : allValues
        }
        values={
          isTemplateStep
            ? { step: (values?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : values
        }
        path={isTemplateStep ? `${path}.${TEMPLATE_INPUT_PATH}` : path}
        readonly={readonly}
        viewType={viewType}
        allowableTypes={allowableTypes}
        onUpdate={onUpdate}
      />
    </Layout.Vertical>
  )
}
export interface StageInputSetFormProps {
  deploymentStage?: DeploymentStageConfig
  deploymentStageTemplate: DeploymentStageConfig
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any
  readonly?: boolean
  viewType: StepViewType
  stageIdentifier?: string
  allowableTypes: MultiTypeInputType[]
}

function ExecutionWrapperInputSetForm(props: {
  stepsTemplate: ExecutionWrapperConfig[]
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
  viewType: StepViewType
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { stepsTemplate, allValues, values, path, formik, readonly, viewType, allowableTypes } = props
  return (
    <>
      {stepsTemplate?.map((item, index) => {
        /* istanbul ignore else */ if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', values)
          return originalStep && /* istanbul ignore next */ originalStep.step ? (
            /* istanbul ignore next */ <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              viewType={viewType}
              allowableTypes={allowableTypes}
              onUpdate={data => {
                /* istanbul ignore next */
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = {
                      identifier: originalStep.step?.identifier || '',
                      name: originalStep.step?.name || '',
                      type: (originalStep.step as StepElementConfig)?.type || ''
                    }
                  }

                  const execObj = {
                    ...data,
                    spec: {
                      ...pickBy(data.spec, identity)
                    }
                  }

                  initialValues.step = {
                    ...execObj,
                    identifier: originalStep.step?.identifier || '',
                    name: originalStep.step?.name || '',
                    type: (originalStep.step as StepElementConfig)?.type || ''
                  }

                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return item.parallel.map((nodep, indexp) => {
            if (nodep.step) {
              const originalStep = getStepFromStage(nodep.step?.identifier || '', allValues)
              const initialValues = getStepFromStage(nodep.step?.identifier || '', values)
              return originalStep && originalStep.step ? (
                <StepForm
                  key={nodep.step.identifier || index}
                  template={nodep}
                  allValues={originalStep}
                  values={initialValues}
                  readonly={readonly}
                  viewType={viewType}
                  path={`${path}[${index}].parallel[${indexp}].step`}
                  allowableTypes={allowableTypes}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.step) {
                        initialValues.step = {
                          identifier: originalStep.step?.identifier || '',
                          name: originalStep.step?.name || '',
                          type: (originalStep.step as StepElementConfig)?.type || '',
                          timeout: '10m'
                        }
                      }
                      initialValues.step = {
                        ...data,
                        identifier: originalStep.step?.identifier || '',
                        name: originalStep.step?.name || '',
                        type: (originalStep.step as StepElementConfig)?.type || '',
                        timeout: '10m'
                      }
                      formik?.setValues(
                        set(formik?.values, `${path}[${index}].parallel[${indexp}].step`, initialValues.step)
                      )
                    }
                  }}
                />
              ) : null
            } else if (nodep.stepGroup) {
              const stepGroup = getStepFromStage(nodep.stepGroup.identifier, allValues)
              const initialValues = getStepFromStage(nodep.stepGroup?.identifier || '', values)
              return (
                <>
                  <CollapseForm
                    header={stepGroup?.stepGroup?.name || ''}
                    headerProps={{ font: { size: 'normal' } }}
                    headerColor="var(--black)"
                  >
                    <ExecutionWrapperInputSetForm
                      stepsTemplate={nodep.stepGroup.steps}
                      formik={formik}
                      readonly={readonly}
                      path={`${path}[${index}].parallel[${indexp}].stepGroup.steps`}
                      allValues={stepGroup?.stepGroup?.steps}
                      values={initialValues?.stepGroup?.steps}
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                    />
                  </CollapseForm>
                </>
              )
            } else {
              return null
            }
          })
        } else if (item.stepGroup) {
          const stepGroup = getStepFromStage(item.stepGroup.identifier, allValues)
          const initialValues = getStepFromStage(item.stepGroup?.identifier || '', values)
          return (
            <>
              <CollapseForm
                header={stepGroup?.stepGroup?.name || ''}
                headerProps={{ font: { size: 'normal' } }}
                headerColor="var(--black)"
              >
                <ExecutionWrapperInputSetForm
                  stepsTemplate={item.stepGroup.steps}
                  formik={formik}
                  readonly={readonly}
                  path={`${path}[${index}].stepGroup.steps`}
                  allValues={stepGroup?.stepGroup?.steps}
                  values={initialValues?.stepGroup?.steps}
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                />
              </CollapseForm>
            </>
          )
        } else {
          return null
        }
      })}
    </>
  )
}

export const StageInputSetFormInternal: React.FC<StageInputSetFormProps> = ({
  deploymentStageTemplate,
  deploymentStage,
  path,
  formik,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes
}) => {
  const deploymentStageInputSet = get(formik?.values, path, {})
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isPropagating = deploymentStage?.serviceConfig?.useFromStage
  const gitScope = useGitScope()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <>
      {deploymentStageTemplate.serviceConfig && (
        <div id={`Stage.${stageIdentifier}.Service`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('service')}</div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate?.serviceConfig?.serviceRef && (
              /* istanbul ignore next */ <StepWidget<ServiceConfig>
                factory={factory}
                initialValues={deploymentStageInputSet?.serviceConfig || {}}
                template={deploymentStageTemplate?.serviceConfig || {}}
                type={StepType.DeployService}
                stepViewType={viewType}
                path={`${path}.serviceConfig`}
                allowableTypes={allowableTypes}
                readonly={readonly}
                customStepProps={{ stageIdentifier }}
              />
            )}
            {(!isNil(deploymentStage?.serviceConfig?.serviceDefinition?.type) || isPropagating) && (
              /* istanbul ignore next */ <StepWidget<ServiceSpec>
                factory={factory}
                initialValues={
                  isPropagating && deploymentStageInputSet
                    ? (deploymentStageInputSet?.serviceConfig?.stageOverrides as StageOverridesConfig)
                    : deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec || {}
                }
                allowableTypes={allowableTypes}
                template={
                  isPropagating && deploymentStageTemplate
                    ? deploymentStageTemplate?.serviceConfig?.stageOverrides
                    : deploymentStageTemplate?.serviceConfig?.serviceDefinition?.spec || {}
                }
                type={StepType.K8sServiceSpec}
                stepViewType={viewType}
                path={
                  isPropagating
                    ? `${path}.serviceConfig.stageOverrides`
                    : `${path}.serviceConfig.serviceDefinition.spec`
                }
                readonly={readonly}
                customStepProps={{
                  stageIdentifier,
                  allValues:
                    isPropagating && deploymentStageInputSet
                      ? deploymentStage?.serviceConfig?.stageOverrides
                      : deploymentStage?.serviceConfig?.serviceDefinition?.spec
                }}
                onUpdate={(data: any) => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec) {
                    deploymentStageInputSet.serviceConfig.serviceDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.stageOverrides && isPropagating) {
                    deploymentStageInputSet.serviceConfig.stageOverrides = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure && (
        <div id={`Stage.${stageIdentifier}.Infrastructure`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('infrastructureText')}</div>

          <div className={css.nestedAccordions} style={{ width: '50%' }}>
            {(deploymentStageTemplate.infrastructure as any).type === 'KubernetesDirect' ? (
              <>
                {(deploymentStageTemplate.infrastructure as any).spec?.connectorRef && (
                  <Container className={stepCss.bottomMargin3}>
                    <FormMultiTypeConnectorField
                      width={ConnectorRefWidth.DefaultView}
                      name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.connectorRef`}
                      label={
                        <Text font={{ variation: FontVariation.FORM_LABEL }}>
                          {getString('connectors.title.k8sCluster')}
                        </Text>
                      }
                      placeholder={getString('pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      gitScope={gitScope}
                      multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
                      setRefValue
                    />
                  </Container>
                )}
                {(deploymentStageTemplate.infrastructure as any).spec?.namespace && (
                  <FormInput.MultiTextInput
                    label={
                      <Text
                        font={{ variation: FontVariation.FORM_LABEL }}
                        tooltipProps={{ dataTooltipId: 'namespace' }}
                      >
                        {getString('pipelineSteps.build.infraSpecifications.namespace')}
                      </Text>
                    }
                    name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.namespace`}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: allowableTypes
                    }}
                    disabled={readonly}
                  />
                )}
              </>
            ) : (deploymentStageTemplate.infrastructure as any).type === 'VM' ? (
              (deploymentStageTemplate.infrastructure as any).spec?.spec?.identifier && (
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
                  name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.spec.identifier`}
                  multiTextInputProps={{
                    multiTextInputProps: { expressions, allowableTypes },
                    disabled: readonly
                  }}
                />
              )
            ) : null}
            {(deploymentStageTemplate.infrastructure as any).spec?.serviceAccountName && (
              <FormInput.MultiTextInput
                label={
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>
                    {getString('pipeline.infraSpecifications.serviceAccountName')}
                  </Text>
                }
                name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.serviceAccountName`}
                multiTextInputProps={{
                  expressions,
                  allowableTypes: allowableTypes
                }}
                disabled={readonly}
              />
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.runAsUser && (
              <Container className={stepCss.bottomMargin5}>
                <MultiTypeTextField
                  label={
                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                      {getString('pipeline.stepCommonFields.runAsUser')}
                    </Text>
                  }
                  name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.runAsUser`}
                  multiTextInputProps={{
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes
                    },
                    disabled: readonly,
                    placeholder: '1000'
                  }}
                />
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.initTimeout && (
              <FormMultiTypeDurationField
                label={
                  <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'timeout' }}>
                    {getString('pipeline.infraSpecifications.initTimeout')}
                  </Text>
                }
                name={`${isEmpty(path) ? '' : `${path}.`}infrastructure.spec.initTimeout`}
                multiTypeDurationProps={{
                  expressions,
                  allowableTypes: allowableTypes
                }}
                disabled={readonly}
              />
            )}
          </div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure?.environmentRef && (
              /* istanbul ignore next */ <StepWidget<PipelineInfrastructure>
                factory={factory}
                initialValues={deploymentStageInputSet?.infrastructure || {}}
                template={deploymentStageTemplate?.infrastructure || {}}
                type={StepType.DeployEnvironment}
                stepViewType={viewType}
                allowableTypes={allowableTypes}
                path={`${path}.infrastructure`}
                readonly={readonly}
              />
            )}
            {deploymentStageTemplate.infrastructure.infrastructureDefinition && (
              /* istanbul ignore next */ <StepWidget<Infrastructure>
                factory={factory}
                template={deploymentStageTemplate.infrastructure.infrastructureDefinition.spec}
                initialValues={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec || {}}
                allowableTypes={allowableTypes}
                allValues={
                  deploymentStage?.infrastructure?.infrastructureDefinition?.spec || /* istanbul ignore next */ {}
                }
                type={
                  (deploymentStage?.infrastructure?.infrastructureDefinition?.type as StepType) ||
                  /* istanbul ignore next */ StepType.KubernetesDirect
                }
                path={`${path}.infrastructure.infrastructureDefinition.spec`}
                readonly={readonly}
                onUpdate={data => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec) {
                    deploymentStageInputSet.infrastructure.infrastructureDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
                stepViewType={viewType}
              />
            )}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure?.infrastructureDefinition?.provisioner && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.infrastructure.infrastructureDefinition?.provisioner`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.inputheader}>{getString('pipeline.provisionerSteps')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps}
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.steps`}
                allValues={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.steps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={
                  deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps
                }
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.rollbackSteps`}
                allValues={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.rollbackSteps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
          </div>
        </div>
      )}
      {(deploymentStageTemplate as any).sharedPaths && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.SharedPaths`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.nestedAccordions} style={{ width: '50%' }}>
            <MultiTypeListInputSet
              name={`${isEmpty(path) ? '' : `${path}.`}sharedPaths`}
              multiTextInputProps={{
                allowableTypes: allowableTypes,
                expressions
              }}
              multiTypeFieldSelectorProps={{
                label: (
                  <div className={css.inputheader} style={{ padding: 0 }}>
                    {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                  </div>
                ),
                allowedTypes: [MultiTypeInputType.FIXED]
              }}
              disabled={readonly}
            />
          </div>
        </div>
      )}
      {(deploymentStageTemplate as ServiceSpec).variables && (
        /* istanbul ignore next */ <div id={`Stage.${stageIdentifier}.Variables`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('variablesText')}</div>

          <div className={css.nestedAccordions}>WIP</div>
        </div>
      )}
      {(deploymentStageTemplate as any).serviceDependencies && (
        <div id={`Stage.${stageIdentifier}.ServiceDependencies`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('pipeline.serviceDependenciesText')}</div>

          <div className={css.nestedAccordions}>
            {(deploymentStageTemplate as any).serviceDependencies &&
              (deploymentStageTemplate as any).serviceDependencies.map(({ identifier }: any, index: number) => (
                <ServiceDependencyForm
                  template={(deploymentStageTemplate as any).serviceDependencies[index]}
                  path={`${path}.serviceDependencies[${index}]`}
                  allValues={(deploymentStage as any)?.serviceDependencies?.[index]}
                  values={deploymentStageInputSet?.serviceDependencies?.[index]}
                  readonly={readonly}
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                  key={identifier}
                  onUpdate={data => {
                    const originalServiceDependency = (deploymentStage as any)?.serviceDependencies?.[index]
                    let initialValues = deploymentStageInputSet?.serviceDependencies?.[index]

                    if (initialValues) {
                      if (!initialValues) {
                        initialValues = {
                          identifier: originalServiceDependency.identifier || '',
                          name: originalServiceDependency.name || '',
                          type: originalServiceDependency.type || ''
                        }
                      }

                      initialValues = {
                        ...data,
                        identifier: originalServiceDependency.identifier || '',
                        name: originalServiceDependency.name || '',
                        type: originalServiceDependency.type || ''
                      }

                      formik?.setValues(set(formik?.values, `${path}.serviceDependencies[${index}]`, initialValues))
                    }
                  }}
                />
              ))}
          </div>
        </div>
      )}
      {deploymentStageTemplate.execution && (
        <div id={`Stage.${stageIdentifier}.Execution`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('executionText')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.execution?.steps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={deploymentStageTemplate.execution.steps}
                path={`${path}.execution.steps`}
                allValues={deploymentStage?.execution?.steps}
                values={deploymentStageInputSet?.execution?.steps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
            {deploymentStageTemplate.execution?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                stepsTemplate={deploymentStageTemplate.execution.rollbackSteps}
                path={`${path}.execution.rollbackSteps`}
                allValues={deploymentStage?.execution?.rollbackSteps}
                values={deploymentStageInputSet?.execution?.rollbackSteps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
export const StageInputSetForm = connect(StageInputSetFormInternal)

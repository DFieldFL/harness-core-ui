import React from 'react'
import { Label, NestedAccordionPanel } from '@wings-software/uicore'
import { connect } from 'formik'
import { get, set } from 'lodash-es'
import { StepViewType, StepWidget } from '@pipeline/exports'
import type {
  DeploymentStageConfig,
  K8SDirectInfrastructure,
  ServiceSpec,
  StepElement,
  ExecutionWrapper,
  ExecutionWrapperConfig,
  ServiceConfig,
  PipelineInfrastructure
} from 'services/cd-ng'
import { String } from 'framework/exports'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'

import { CollapseForm } from './CollapseForm'
import i18n from './PipelineInputSetForm.i18n'
import { getStepFromStage } from '../PipelineStudio/StepUtil'
import css from './PipelineInputSetForm.module.scss'
function StepForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  path
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: ExecutionWrapper) => void
  readonly?: boolean
  path: string
}): JSX.Element {
  return (
    <>
      <Label>{allValues?.step?.name}</Label>
      <StepWidget<ExecutionWrapper>
        factory={factory}
        readonly={readonly}
        path={path}
        template={template?.step}
        initialValues={values?.step || {}}
        allValues={allValues?.step || {}}
        type={(allValues?.step?.type as StepType) || ''}
        onUpdate={onUpdate}
        stepViewType={StepViewType.InputSet}
      />
    </>
  )
}
export interface StageInputSetFormProps {
  deploymentStage?: DeploymentStageConfig
  deploymentStageTemplate: DeploymentStageConfig
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any
  readonly?: boolean
  stageIdentifier?: string
}

function ExecutionWrapperInputSetForm(props: {
  stepsTemplate: ExecutionWrapperConfig[]
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
}): JSX.Element {
  const { stepsTemplate, allValues, values, path, formik, readonly } = props
  return (
    <>
      {stepsTemplate?.map((item, index) => {
        if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || '', values)
          return originalStep && originalStep.step ? (
            <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              onUpdate={data => {
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = { identifier: originalStep.step?.identifier || '' }
                  }
                  initialValues.step = { ...data, identifier: originalStep.step?.identifier || '' }
                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return ((item.parallel as unknown) as StepElement[]).map((nodep: ExecutionWrapper, indexp) => {
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
                  path={`${path}[${index}].parallel[${indexp}].step`}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.step) {
                        initialValues.step = { identifier: originalStep.step?.identifier || '' }
                      }
                      initialValues.step = { ...data, identifier: originalStep.step?.identifier || '' }
                      formik?.setValues(
                        set(formik?.values, `${path}[${index}].parallel[${indexp}].step`, initialValues.step)
                      )
                    }
                  }}
                />
              ) : null
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
                />
              </CollapseForm>
              {item.stepGroup.rollbackSteps && (
                <CollapseForm
                  header={stepGroup?.stepGroup?.name + ' (Rollback)' || ''}
                  headerProps={{ font: { size: 'normal' } }}
                  headerColor="var(--black)"
                >
                  <ExecutionWrapperInputSetForm
                    stepsTemplate={item.stepGroup.rollbackSteps}
                    formik={formik}
                    readonly={readonly}
                    path={`${path}[${index}].stepGroup.rollbackSteps`}
                    allValues={stepGroup?.stepGroup?.rollbackSteps}
                    values={initialValues?.stepGroup?.rollbackSteps}
                  />
                </CollapseForm>
              )}
            </>
          )
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
  stageIdentifier
}) => {
  const deploymentStageInputSet = get(formik?.values, path, {})
  return (
    <>
      {deploymentStageTemplate.serviceConfig && (
        <NestedAccordionPanel
          addDomId
          id={`Stage.${stageIdentifier}.Service`}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="service" />
            </div>
          }
          details={
            <>
              {deploymentStage?.serviceConfig?.serviceRef && (
                <StepWidget<ServiceConfig>
                  factory={factory}
                  initialValues={deploymentStageInputSet?.serviceConfig || {}}
                  template={deploymentStageTemplate?.serviceConfig || {}}
                  type={StepType.DeployService}
                  stepViewType={StepViewType.InputSet}
                  path={`${path}.serviceConfig`}
                  readonly={readonly}
                />
              )}
              {deploymentStage?.serviceConfig?.serviceDefinition?.type === 'Kubernetes' && (
                <StepWidget<ServiceSpec>
                  factory={factory}
                  initialValues={deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec || {}}
                  template={deploymentStageTemplate?.serviceConfig?.serviceDefinition?.spec || {}}
                  type={StepType.K8sServiceSpec}
                  stepViewType={StepViewType.InputSet}
                  path={`${path}.serviceConfig.serviceDefinition.spec`}
                  readonly={readonly}
                  onUpdate={(data: any) => {
                    if (deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec) {
                      deploymentStageInputSet.serviceConfig.serviceDefinition.spec = data
                      formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                    }
                  }}
                />
              )}
            </>
          }
        />
      )}

      {deploymentStageTemplate.infrastructure && (
        <NestedAccordionPanel
          addDomId
          id={`Stage.${stageIdentifier}.Infrastructure`}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="infrastructureText" />
            </div>
          }
          details={
            <>
              {deploymentStageTemplate.infrastructure?.environmentRef && (
                <StepWidget<PipelineInfrastructure>
                  factory={factory}
                  initialValues={deploymentStageInputSet?.infrastructure || {}}
                  template={deploymentStageTemplate?.infrastructure || {}}
                  type={StepType.DeployEnvironment}
                  stepViewType={StepViewType.InputSet}
                  path={`${path}.infrastructure`}
                  readonly={readonly}
                />
              )}
              {deploymentStageTemplate.infrastructure.infrastructureDefinition && (
                <StepWidget<K8SDirectInfrastructure>
                  factory={factory}
                  template={deploymentStageTemplate.infrastructure.infrastructureDefinition.spec}
                  initialValues={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec || {}}
                  allValues={deploymentStage?.infrastructure?.infrastructureDefinition?.spec || {}}
                  type={
                    (deploymentStage?.infrastructure?.infrastructureDefinition?.type as StepType) ||
                    StepType.KubernetesDirect
                  }
                  path={`${path}.infrastructure.infrastructureDefinition.spec`}
                  readonly={readonly}
                  onUpdate={data => {
                    if (deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec) {
                      deploymentStageInputSet.infrastructure.infrastructureDefinition.spec = data
                      formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                    }
                  }}
                  stepViewType={StepViewType.InputSet}
                />
              )}
            </>
          }
        />
      )}
      {deploymentStageTemplate.variables && (
        <NestedAccordionPanel
          addDomId
          id={`Stage.${stageIdentifier}.Variables`}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="pipelineSteps.build.stageSpecifications.variablesDetails" />
            </div>
          }
          details={<div>WIP</div>}
        />
      )}
      {deploymentStageTemplate.execution && (
        <NestedAccordionPanel
          addDomId
          id={`Stage.${stageIdentifier}.Execution`}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="executionText" />
            </div>
          }
          details={
            <>
              {deploymentStageTemplate.execution?.steps && (
                <CollapseForm
                  header={i18n.execution}
                  headerProps={{ font: { size: 'normal' } }}
                  headerColor="var(--black)"
                >
                  <ExecutionWrapperInputSetForm
                    stepsTemplate={deploymentStageTemplate.execution.steps}
                    path={`${path}.execution.steps`}
                    allValues={deploymentStage?.execution?.steps}
                    values={deploymentStageInputSet?.execution?.steps}
                    formik={formik}
                    readonly={readonly}
                  />
                </CollapseForm>
              )}
              {deploymentStageTemplate.execution?.rollbackSteps && (
                <CollapseForm
                  header={i18n.rollbackSteps}
                  headerProps={{ font: { size: 'normal' } }}
                  headerColor="var(--black)"
                >
                  <ExecutionWrapperInputSetForm
                    stepsTemplate={deploymentStageTemplate.execution.rollbackSteps}
                    path={`${path}.execution.rollbackSteps`}
                    allValues={deploymentStage?.execution?.rollbackSteps}
                    values={deploymentStageInputSet?.execution?.rollbackSteps}
                    formik={formik}
                    readonly={readonly}
                  />
                </CollapseForm>
              )}
            </>
          }
        />
      )}
    </>
  )
}
export const StageInputSetForm = connect(StageInputSetFormInternal)

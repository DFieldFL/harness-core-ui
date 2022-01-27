/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, Text, Icon, Color, IconName } from '@wings-software/uicore'
import { isEmpty, get, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type {
  DeploymentStageConfig,
  PipelineInfoConfig,
  StageElementConfig,
  StageElementWrapperConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { PubSubPipelineActions } from '@pipeline/factories/PubSubPipelineAction'
import { PipelineActions } from '@pipeline/factories/PubSubPipelineAction/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect } from '@common/hooks'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { StageInputSetForm } from './StageInputSetForm'
import { CICodebaseInputSetForm } from './CICodebaseInputSetForm'
import { StepWidget } from '../AbstractSteps/StepWidget'
import factory from '../PipelineSteps/PipelineStepFactory'
import type {
  CustomVariablesData,
  CustomVariableInputSetExtraProps
} from '../PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AbstractStepFactory } from '../AbstractSteps/AbstractStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
import { getStageFromPipeline } from '../PipelineStudio/StepUtil'
import { PipelineVariablesContextProvider } from '../PipelineVariablesContext/PipelineVariablesContext'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './PipelineInputSetForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface PipelineInputSetFormProps {
  originalPipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  path?: string
  readonly?: boolean
  maybeContainerClass?: string
  viewType: StepViewType
  isRunPipelineForm?: boolean
  listOfSelectedStages?: string[]
  isRetryFormStageSelected?: boolean
}

const stageTypeToIconMap: Record<string, IconName> = {
  Deployment: 'cd-main',
  CI: 'ci-main',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom',
  Approval: 'approval-stage-icon'
}

export function StageFormInternal({
  allValues,
  path,
  template,
  readonly,
  viewType,
  stageClassName = '',
  allowableTypes
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
  stageClassName?: string
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <div className={cx(css.topAccordion, stageClassName)}>
      {template?.stage?.variables && (
        <div id={`Stage.${allValues?.stage?.identifier}.Variables`} className={cx(css.accordionSummary)}>
          <Text font={{ weight: 'semi-bold' }} padding={{ top: 'medium', bottom: 'medium' }}>
            {getString('variablesText')}
          </Text>
          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (allValues?.stage?.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              allowableTypes={allowableTypes}
              type={StepType.CustomVariable}
              readonly={readonly}
              stepViewType={viewType}
              customStepProps={{
                template: { variables: template?.stage?.variables as AllNGVariables[] },
                path,
                allValues: { variables: (allValues?.stage?.variables || []) as AllNGVariables[] }
              }}
            />
          </div>
        </div>
      )}
      {template?.stage?.spec && (
        <StageInputSetForm
          stageIdentifier={template?.stage?.identifier}
          path={`${path}.spec`}
          deploymentStageTemplate={template?.stage?.spec as DeploymentStageConfig}
          deploymentStage={allValues?.stage?.spec as DeploymentStageConfig}
          readonly={readonly}
          viewType={viewType}
          allowableTypes={allowableTypes}
        />
      )}
    </div>
  )
}

export function StageForm({
  allValues,
  path,
  template,
  readonly,
  viewType,
  hideTitle = false,
  stageClassName = '',
  allowableTypes
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
  hideTitle?: boolean
  stageClassName?: string
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const isTemplateStage = !!template?.stage?.template
  const type = isTemplateStage
    ? (template?.stage?.template?.templateInputs as StageElementConfig)?.type
    : template?.stage?.type
  return (
    <div id={`Stage.${allValues?.stage?.identifier}`}>
      {!hideTitle && (
        <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
          {type && <Icon name={stageTypeToIconMap[type]} size={18} />}
          <Text color={Color.BLACK_100} font={{ weight: 'semi-bold' }}>
            Stage: {defaultTo(allValues?.stage?.name, '')}
          </Text>
        </Layout.Horizontal>
      )}
      <StageFormInternal
        template={
          isTemplateStage ? { stage: template?.stage?.template?.templateInputs as StageElementConfig } : template
        }
        allValues={
          allValues?.stage?.template
            ? { stage: allValues?.stage?.template?.templateInputs as StageElementConfig }
            : allValues
        }
        path={isTemplateStage ? `${path}.${TEMPLATE_INPUT_PATH}` : path}
        readonly={readonly}
        viewType={viewType}
        allowableTypes={allowableTypes}
        stageClassName={stageClassName}
      />
    </div>
  )
}

const PipelineInputSetFormInternal: React.FC<PipelineInputSetFormProps> = props => {
  const { originalPipeline, template, path = '', readonly, viewType, maybeContainerClass = '' } = props
  const { getString } = useStrings()
  const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]

  const isCloneCodebaseEnabledAtLeastAtOneStage = originalPipeline?.stages?.some(
    stage =>
      Object.is(get(stage, 'stage.spec.cloneCodebase'), true) ||
      stage.parallel?.some(parallelStage => Object.is(get(parallelStage, 'stage.spec.cloneCodebase'), true))
  )

  const { expressions } = useVariablesExpression()

  const isInputStageDisabled = (stageId: string): boolean => {
    /* In retry pipeline form all the fields are disabled until any stage is selected,
      and once the stage is selected, the stage before the selected stage should be disabled */

    if (props.isRetryFormStageSelected) {
      return !!props.listOfSelectedStages?.includes(stageId)
    } else if (props.isRetryFormStageSelected === false) {
      return !props.listOfSelectedStages?.length
    }
    return readonly as boolean
  }

  return (
    <PipelineVariablesContextProvider pipeline={originalPipeline}>
      <Layout.Vertical spacing="medium" className={cx(css.container, maybeContainerClass)}>
        {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormMultiTypeDurationField
              multiTypeDurationProps={{
                enableConfigureOptions: false,
                allowableTypes,
                expressions,
                disabled: readonly
              }}
              className={stepCss.checkbox}
              label={getString('pipelineSteps.timeoutLabel')}
              name="timeout"
              disabled={readonly}
            />
          </div>
        ) : null}
        {template?.variables && template?.variables?.length > 0 && (
          <>
            <div className={css.subheading}>{getString('customVariables.pipelineVariablesTitle')}</div>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (originalPipeline.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              allowableTypes={allowableTypes}
              readonly={readonly}
              type={StepType.CustomVariable}
              stepViewType={viewType}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (originalPipeline?.variables || []) as AllNGVariables[] }
              }}
            />
          </>
        )}
        {isCloneCodebaseEnabledAtLeastAtOneStage &&
          getMultiTypeFromValue(template?.properties?.ci?.codebase?.build as unknown as string) ===
            MultiTypeInputType.RUNTIME && (
            <>
              <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
                <Text
                  data-name="ci-codebase-title"
                  color={Color.BLACK_100}
                  font={{ weight: 'semi-bold' }}
                  tooltipProps={{ dataTooltipId: 'ciCodebase' }}
                >
                  {getString('ciCodebase')}
                </Text>
              </Layout.Horizontal>
              <div className={css.topAccordion}>
                <div className={css.accordionSummary}>
                  <div className={css.nestedAccordions} style={{ width: '50%' }}>
                    <CICodebaseInputSetForm path={path} readonly={readonly} originalPipeline={props.originalPipeline} />
                  </div>
                </div>
              </div>
            </>
          )}
        <>
          {template?.stages?.map((stageObj, index) => {
            const pathPrefix = !isEmpty(path) ? `${path}.` : ''
            if (stageObj.stage) {
              const allValues = getStageFromPipeline(stageObj?.stage?.identifier || '', originalPipeline)

              return (
                <Layout.Vertical key={stageObj?.stage?.identifier || index}>
                  <StageForm
                    template={stageObj}
                    allValues={allValues}
                    path={`${pathPrefix}stages[${index}].stage`}
                    readonly={isInputStageDisabled(stageObj?.stage?.identifier)}
                    viewType={viewType}
                    allowableTypes={allowableTypes}
                  />
                </Layout.Vertical>
              )
            } else if (stageObj.parallel) {
              return stageObj.parallel.map((stageP, indexp) => {
                const allValues = getStageFromPipeline(stageP?.stage?.identifier || '', originalPipeline)
                return (
                  <Layout.Vertical key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                    <StageForm
                      template={stageP}
                      allValues={allValues}
                      path={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                      readonly={isInputStageDisabled(stageP?.stage?.identifier as string)}
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                    />
                  </Layout.Vertical>
                )
              })
            } else {
              return null
            }
          })}
        </>
      </Layout.Vertical>
    </PipelineVariablesContextProvider>
  )
}
export const PipelineInputSetForm: React.FC<PipelineInputSetFormProps> = props => {
  const [template, setTemplate] = React.useState(props.template)
  const accountPathProps = useParams<AccountPathProps>()
  useDeepCompareEffect(() => {
    if (props.isRunPipelineForm) {
      PubSubPipelineActions.publish(PipelineActions.RunPipeline, {
        pipeline: props.originalPipeline,
        accountPathProps,
        template: props.template
      }).then(data => {
        if (data.length > 0) {
          setTemplate(Object.assign(props.template, ...data))
        }
      })
    }
  }, [props?.template])
  return (
    <PipelineVariablesContextProvider pipeline={props.originalPipeline}>
      <PipelineInputSetFormInternal {...props} template={template} />
    </PipelineVariablesContextProvider>
  )
}

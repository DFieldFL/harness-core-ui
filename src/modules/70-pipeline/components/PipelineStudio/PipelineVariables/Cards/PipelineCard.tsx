import React from 'react'
import { Card } from '@wings-software/uicore'

import type { NgPipeline } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { useStrings } from 'framework/exports'

import { VariableListTable } from './VariableListTable'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface PipelineCardProps {
  pipeline: NgPipeline
  originalPipeline: NgPipeline
  stepsFactory: AbstractStepFactory
  metadataMap: PipelineVariablesData['metadataMap']
  updatePipeline(pipeline: NgPipeline): void
}

export default function PipelineCard(props: PipelineCardProps): React.ReactElement {
  const { pipeline, originalPipeline, metadataMap, stepsFactory, updatePipeline } = props
  const { getString } = useStrings()

  return (
    <Card className={css.variableCard} id="Pipeline-panel">
      <VariableListTable data={pipeline} originalData={originalPipeline} metadataMap={metadataMap} />

      <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
        factory={stepsFactory}
        initialValues={{ variables: originalPipeline.variables || [], canAddVariable: true }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.InputVariable}
        onUpdate={({ variables }: CustomVariablesData) => {
          updatePipeline({ ...originalPipeline, variables })
        }}
        customStepProps={{
          variableNamePrefix: 'pipeline.variables.',
          domId: 'Pipeline.Variables-panel',
          className: css.customVariables,
          heading: <b>{getString('customVariables.title')}</b>,
          yamlProperties: pipeline.variables?.map(variable => metadataMap[variable.value || '']?.yamlProperties || {})
        }}
      />
    </Card>
  )
}

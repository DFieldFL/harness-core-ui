import React from 'react'
import { Card, Color, FontVariation, NestedAccordionPanel, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty, lowerCase } from 'lodash-es'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { AllNGVariables } from '@pipeline/utils/types'
import VariableListTagRow from '@pipeline/components/VariablesListTable/VariableListTagRow'
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface PipelineCardProps {
  variablePipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
  stepsFactory: AbstractStepFactory
  metadataMap: PipelineVariablesData['metadataMap']
  updatePipeline(pipeline: PipelineInfoConfig): void
  readonly?: boolean
}

export default function PipelineCard(props: PipelineCardProps): React.ReactElement {
  const { variablePipeline, pipeline, metadataMap, stepsFactory, updatePipeline, readonly } = props
  const { getString } = useStrings()

  return (
    <Card className={css.variableCard} id="Pipeline-panel">
      <VariablesListTable
        data={variablePipeline}
        className={css.variablePaddingL0}
        originalData={pipeline}
        metadataMap={metadataMap}
      />
      {!isEmpty(variablePipeline?.tags) && (
        <VariableListTagRow
          metadataMap={metadataMap}
          name={lowerCase(getString('tagsLabel'))}
          tags={variablePipeline.tags}
          fqn="pipeline.tags"
          className={css.variablePaddingTagL0}
        />
      )}
      <NestedAccordionPanel
        noAutoScroll
        isDefaultOpen
        key={`pipeline.variables`}
        id={`pipeline.variables`}
        addDomId
        collapseProps={{
          keepChildrenMounted: true
        }}
        summary={
          <VariableAccordionSummary>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
              {getString('customVariables.title')}
            </Text>
          </VariableAccordionSummary>
        }
        summaryClassName={css.variableBorderBottom}
        details={
          <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
            factory={stepsFactory}
            initialValues={{ variables: (pipeline.variables || []) as AllNGVariables[], canAddVariable: true }}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputVariable}
            readonly={readonly}
            allowableTypes={[]}
            onUpdate={({ variables }: CustomVariablesData) => {
              updatePipeline({ ...pipeline, variables })
            }}
            customStepProps={{
              formName: 'addEditPipelineCustomVariableForm',
              variableNamePrefix: 'pipeline.variables.',
              domId: 'Pipeline.Variables-panel',
              className: cx(css.customVariables, css.customVarPadL1, css.addVariableL1),
              // heading: <b>{getString('customVariables.title')}</b>,
              path: 'pipeline.variables',
              yamlProperties: (variablePipeline.variables as AllNGVariables[])?.map(
                variable => metadataMap[variable.value || '']?.yamlProperties || {}
              )
            }}
          />
        }
      />
    </Card>
  )
}

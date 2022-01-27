/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultTo, isNil, set } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import type {
  ExecutionGraphAddStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes, TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { addStepOrGroup } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { StepCategory, useGetStepsV2 } from 'services/pipeline-ng'
import { createStepNodeFromTemplate } from '@pipeline/utils/templateUtils'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useMutateAsGet } from '@common/hooks'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

interface AddStepTemplateReturnType {
  addTemplate: (event: ExecutionGraphAddStepEvent) => void
}

interface AddStepTemplate {
  executionRef: ExecutionGraphRefObj | null
}

export function useAddStepTemplate(props: AddStepTemplate): AddStepTemplateReturnType {
  const { executionRef } = props
  const { accountId } = useParams<ProjectPathProps>()
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipelineView,
      selectionState: { selectedStageId },
      templateTypes
    },
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    updateTemplateView,
    setTemplateTypes
  } = pipelineContext
  const { stage: selectedStage } = getStageFromPipeline(defaultTo(selectedStageId, ''))
  const [allChildTypes, setAllChildTypes] = React.useState<string[]>([])

  const { data: stepsData } = useMutateAsGet(useGetStepsV2, {
    queryParams: { accountId },
    body: {
      stepPalleteModuleInfos: getStepPaletteModuleInfosFromStage(selectedStage?.stage?.type, selectedStage?.stage)
    }
  })

  const getStepTypesFromCategories = (stepCategories: StepCategory[]): string[] => {
    const validStepTypes: string[] = []
    stepCategories.forEach(category => {
      if (category.stepCategories?.length) {
        validStepTypes.push(...getStepTypesFromCategories(category.stepCategories))
      } else if (category.stepsData?.length) {
        category.stepsData.forEach(stepData => {
          if (stepData.type) {
            validStepTypes.push(stepData.type)
          }
        })
      }
    })
    return validStepTypes
  }

  React.useEffect(() => {
    if (stepsData?.data?.stepCategories) {
      setAllChildTypes(getStepTypesFromCategories(stepsData.data.stepCategories))
    }
  }, [stepsData?.data?.stepCategories])

  const addTemplate = (event: ExecutionGraphAddStepEvent) => {
    updateTemplateView({
      isTemplateDrawerOpened: true,
      templateDrawerData: {
        type: TemplateDrawerTypes.UseTemplate,
        data: {
          selectorData: {
            templateType: 'Step',
            allChildTypes,
            onUseTemplate: async (template: TemplateSummaryResponse, isCopied = false) => {
              const newStepData = { step: createStepNodeFromTemplate(template, isCopied) }
              const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId || ''))
              if (pipelineStage && !pipelineStage.stage?.spec) {
                set(pipelineStage, 'stage.spec', {})
              }
              if (pipelineStage && isNil(pipelineStage.stage?.spec?.execution)) {
                if (event.isRollback) {
                  set(pipelineStage, 'stage.spec.execution', { rollbackSteps: [] })
                } else {
                  set(pipelineStage, 'stage.spec.execution', { steps: [] })
                }
              }
              executionRef?.stepGroupUpdated?.(newStepData.step)
              addStepOrGroup(
                event.entity,
                pipelineStage?.stage?.spec?.execution as any,
                newStepData,
                event.isParallel,
                event.isRollback
              )
              if (pipelineStage?.stage) {
                await updateStage(pipelineStage?.stage)
              }
              if (!isCopied && template?.identifier && template?.childType) {
                templateTypes[template.identifier] = template.childType
                setTemplateTypes(templateTypes)
              }
              updateTemplateView({
                isTemplateDrawerOpened: false,
                templateDrawerData: {
                  type: TemplateDrawerTypes.UseTemplate
                }
              })
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: true,
                drawerData: {
                  type: DrawerTypes.StepConfig,
                  data: {
                    stepConfig: {
                      node: newStepData.step,
                      stepsMap: event.stepsMap,
                      onUpdate: executionRef?.stepGroupUpdated,
                      isStepGroup: false,
                      addOrEdit: 'edit',
                      hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                    }
                  }
                }
              })
            }
          }
        }
      }
    })
  }

  return { addTemplate }
}

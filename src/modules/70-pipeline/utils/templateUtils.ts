/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty, set, unset } from 'lodash-es'
import produce from 'immer'
import { parse } from 'yaml'
import type { StageElementConfig, StepElementConfig, TemplateLinkConfig } from 'services/cd-ng'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { getIdentifierFromValue, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TemplateStepNode } from 'services/pipeline-ng'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { generateRandomString } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'

export const TEMPLATE_INPUT_PATH = 'template.templateInputs'

export const getTemplateNameWithLabel = (template?: TemplateSummaryResponse): string => {
  return `${(template as TemplateSummaryResponse)?.name} (${defaultTo(template?.versionLabel, 'Stable')})`
}

export const getScopeBasedTemplateRef = (template: TemplateSummaryResponse): string => {
  const templateIdentifier = defaultTo(template.identifier, '')
  const scope = getScopeFromDTO(template)
  return scope === Scope.PROJECT ? templateIdentifier : `${scope}.${templateIdentifier}`
}

export const getStageType = (stage?: StageElementConfig, templateTypes?: { [key: string]: string }): StageType => {
  return stage?.template
    ? templateTypes
      ? (get(templateTypes, getIdentifierFromValue(defaultTo(stage.template.templateRef, ''))) as StageType)
      : ((stage.template.templateInputs as StageElementConfig)?.type as StageType)
    : (stage?.type as StageType)
}

export const getStepType = (step?: StepElementConfig | TemplateStepNode): StepType => {
  return (step as TemplateStepNode)?.template
    ? (((step as TemplateStepNode).template.templateInputs as StepElementConfig)?.type as StepType)
    : ((step as StepElementConfig)?.type as StepType)
}

export const setTemplateInputs = (
  data: TemplateStepNode | StageElementConfig,
  templateInputs: TemplateLinkConfig['templateInputs']
) => {
  if (isEmpty(templateInputs)) {
    unset(data, TEMPLATE_INPUT_PATH)
  } else {
    set(data, TEMPLATE_INPUT_PATH, templateInputs)
  }
}

export const createTemplate = <T extends StageElementConfig | StepOrStepGroupOrTemplateStepData>(
  data?: T,
  template?: TemplateSummaryResponse
) => {
  return produce({} as T, draft => {
    draft.name = defaultTo(data?.name, '')
    draft.identifier = defaultTo(data?.identifier, '')
    if (template) {
      set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
      if (template.versionLabel) {
        set(draft, 'template.versionLabel', template.versionLabel)
      }
    }
  })
}

export const createStepNodeFromTemplate = (template: TemplateSummaryResponse, isCopied = false) => {
  return (isCopied
    ? produce(defaultTo(parse(defaultTo(template?.yaml, ''))?.template.spec, {}) as StepElementConfig, draft => {
        draft.name = defaultTo(template?.name, '')
        draft.identifier = generateRandomString(defaultTo(template?.name, ''))
      })
    : produce({} as TemplateStepNode, draft => {
        draft.name = defaultTo(template?.name, '')
        draft.identifier = generateRandomString(defaultTo(template?.name, ''))
        set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
        if (template.versionLabel) {
          set(draft, 'template.versionLabel', template.versionLabel)
        }
      })) as unknown as StepElementConfig
}

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import isEmpty from 'lodash-es/isEmpty'
import has from 'lodash-es/has'
import * as Yup from 'yup'
import set from 'lodash-es/set'
import reduce from 'lodash-es/reduce'
import isObject from 'lodash-es/isObject'
import memoize from 'lodash-es/memoize'
import get from 'lodash-es/get'
import type {
  StageElementConfig,
  ExecutionWrapperConfig,
  PipelineInfoConfig,
  DeploymentStageConfig,
  Infrastructure,
  StageElementWrapperConfig,
  StepElementConfig
} from 'services/cd-ng'

import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { TemplateStepNode } from 'services/pipeline-ng'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
// eslint-disable-next-line no-restricted-imports
import '@cd/components/PipelineSteps'
// eslint-disable-next-line no-restricted-imports
import '@ci/components/PipelineSteps'
import { StepViewType } from '../AbstractSteps/Step'

export const clearRuntimeInput = (template: PipelineInfoConfig): PipelineInfoConfig => {
  return JSON.parse(
    JSON.stringify(template || {}).replace(/"<\+input>.?(?:allowedValues\((.*?)\)|regex\((.*?)\))?"/g, '""')
  )
}
export function getStepFromStage(stepId: string, steps?: ExecutionWrapperConfig[]): ExecutionWrapperConfig | undefined {
  let responseStep: ExecutionWrapperConfig | undefined = undefined
  steps?.forEach(item => {
    if (item.step?.identifier === stepId) {
      responseStep = item
    } else if (item.stepGroup?.identifier === stepId) {
      responseStep = item
    } else if (item.parallel) {
      return item.parallel.forEach(node => {
        if (node.step?.identifier === stepId || node.stepGroup?.identifier === stepId) {
          responseStep = node
        }
      })
    }
  })
  return responseStep
}

export function getStageFromPipeline(
  stageId: string,
  pipeline?: PipelineInfoConfig
): StageElementWrapperConfig | undefined {
  if (pipeline?.stages) {
    let responseStage: StageElementWrapperConfig | undefined = undefined
    pipeline.stages.forEach(item => {
      if (item.stage && item.stage.identifier === stageId) {
        responseStage = item
      } else if (item.parallel) {
        return item.parallel.forEach(node => {
          if (node.stage?.identifier === stageId) {
            responseStage = node
          }
        })
      }
    })
    return responseStage
  }
  return
}

export interface ValidateStepProps {
  step: StepElementConfig | TemplateStepNode
  template?: StepElementConfig | TemplateStepNode
  originalStep?: ExecutionWrapperConfig
  getString?: UseStringsReturn['getString']
  viewType: StepViewType
}

export const validateStep = ({
  step,
  template,
  originalStep,
  getString,
  viewType
}: ValidateStepProps): FormikErrors<StepElementConfig> => {
  const errors = {}
  const isTemplateStep = !!(originalStep?.step as unknown as TemplateStepNode)?.template
  const stepType = isTemplateStep ? StepType.Template : (originalStep?.step as StepElementConfig)?.type
  const pipelineStep = factory.getStep(stepType)
  const errorResponse = pipelineStep?.validateInputSet({
    data: step,
    template: template,
    getString,
    viewType
  })
  if (!isEmpty(errorResponse)) {
    const suffix = isTemplateStep ? '.template.templateInputs' : ''
    set(errors, `step${suffix}`, errorResponse)
  }
  return errors
}

export interface ValidateStepsProps {
  steps: ExecutionWrapperConfig[]
  template?: ExecutionWrapperConfig[]
  originalSteps?: ExecutionWrapperConfig[]
  getString?: UseStringsReturn['getString']
  viewType: StepViewType
}

const validateSteps = ({
  steps,
  template,
  originalSteps,
  getString,
  viewType
}: ValidateStepsProps): FormikErrors<ExecutionWrapperConfig> => {
  const errors = {}
  steps.forEach((stepObj, index) => {
    if (stepObj.step) {
      const errorResponse = validateStep({
        step: stepObj.step,
        template: template?.[index].step,
        originalStep: getStepFromStage(stepObj.step.identifier, originalSteps),
        getString,
        viewType
      })
      if (!isEmpty(errorResponse)) {
        set(errors, `steps[${index}]`, errorResponse)
      }
    } else if (stepObj.parallel) {
      stepObj.parallel.forEach((stepParallel, indexP) => {
        if (stepParallel.step) {
          const errorResponse = validateStep({
            step: stepParallel.step,
            template: template?.[index]?.parallel?.[indexP]?.step,
            originalStep: getStepFromStage(stepParallel.step.identifier, originalSteps),
            getString,
            viewType
          })
          if (!isEmpty(errorResponse)) {
            set(errors, `steps[${index}].parallel[${indexP}]`, errorResponse)
          }
        }
      })
    } else if (stepObj.stepGroup) {
      const originalStepGroup = getStepFromStage(stepObj.stepGroup.identifier, originalSteps)
      if (stepObj.stepGroup.steps) {
        const errorResponse = validateSteps({
          steps: stepObj.stepGroup.steps,
          template: template?.[index]?.stepGroup?.steps,
          originalSteps: originalStepGroup?.stepGroup?.steps,
          getString,
          viewType
        })
        if (!isEmpty(errorResponse)) {
          set(errors, `steps[${index}].stepGroup.steps`, errorResponse)
        }
      }
    }
  })

  return errors
}

interface ValidateStageProps {
  stage: StageElementConfig
  template?: StageElementConfig
  viewType: StepViewType
  originalStage?: StageElementConfig
  getString?: UseStringsReturn['getString']
}

export const validateStage = ({
  stage,
  template,
  viewType,
  originalStage,
  getString
}: ValidateStageProps): FormikErrors<StageElementConfig> => {
  if (originalStage?.template) {
    const errors = validateStage({
      stage: stage.template?.templateInputs as StageElementConfig,
      template: template?.template?.templateInputs as StageElementConfig,
      viewType,
      originalStage: originalStage.template.templateInputs as StageElementConfig,
      getString
    })
    if (!isEmpty(errors)) {
      return set({}, 'template.templateInputs', errors)
    } else {
      return {}
    }
  } else {
    const errors = {}

    // Validation for infrastructure namespace
    // For CD spec is DeploymentStageConfig
    const stageConfig = stage.spec as DeploymentStageConfig | undefined
    const templateStageConfig = template?.spec as DeploymentStageConfig | undefined
    const originalStageConfig = originalStage?.spec as DeploymentStageConfig | undefined
    if (
      isEmpty((stageConfig?.infrastructure as Infrastructure)?.spec?.namespace) &&
      getMultiTypeFromValue((templateStageConfig?.infrastructure as Infrastructure)?.spec?.namespace) ===
        MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'spec.infrastructure.spec.namespace',
        getString?.('fieldRequired', { field: getString?.('pipelineSteps.build.infraSpecifications.namespace') })
      )
    }

    if (stage.type === 'Deployment' && templateStageConfig?.serviceConfig?.serviceRef) {
      const step = factory.getStep(StepType.DeployService)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.serviceConfig,
        template: templateStageConfig?.serviceConfig,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.serviceConfig', errorsResponse)
      }
    }

    if (stage.type === 'Deployment' && templateStageConfig?.infrastructure?.environmentRef) {
      const step = factory.getStep(StepType.DeployEnvironment)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.infrastructure,
        template: templateStageConfig?.infrastructure,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.infrastructure', errorsResponse)
      }
    }
    if (
      stageConfig?.infrastructure?.infrastructureDefinition?.spec &&
      originalStageConfig?.infrastructure?.infrastructureDefinition?.type
    ) {
      const step = factory.getStep(originalStageConfig.infrastructure.infrastructureDefinition.type)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.infrastructure?.infrastructureDefinition?.spec,
        template: templateStageConfig?.infrastructure?.infrastructureDefinition?.spec,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.infrastructure.infrastructureDefinition.spec', errorsResponse)
      }
    }
    if (stage?.variables) {
      const step = factory.getStep(StepType.CustomVariable)
      const errorsResponse: any = step?.validateInputSet({ data: stage, template, getString, viewType })

      if (!isEmpty(errorsResponse)) {
        set(errors, 'variables', errorsResponse?.variables)
      }
    }
    if (originalStageConfig?.serviceConfig?.serviceDefinition?.type === 'Kubernetes') {
      const step = factory.getStep(StepType.K8sServiceSpec)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.serviceConfig?.serviceDefinition?.spec,
        template: templateStageConfig?.serviceConfig?.serviceDefinition?.spec,
        getString,
        viewType
      })

      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.serviceConfig.serviceDefinition.spec', errorsResponse)
      }

      if (originalStageConfig?.serviceConfig?.serviceDefinition?.spec?.variables) {
        const currentStep = factory.getStep(StepType.CustomVariable)
        const stepErrorsResponse = currentStep?.validateInputSet({
          data: stageConfig?.serviceConfig?.serviceDefinition?.spec,
          template: templateStageConfig?.serviceConfig?.serviceDefinition?.spec,
          getString,
          viewType
        })

        if (!isEmpty(stepErrorsResponse)) {
          set(errors, 'spec.serviceConfig.serviceDefinition.spec', stepErrorsResponse)
        }
      }
    }
    if (stageConfig?.execution?.steps) {
      const errorsResponse = validateSteps({
        steps: stageConfig.execution.steps as ExecutionWrapperConfig[],
        template: templateStageConfig?.execution?.steps,
        originalSteps: originalStageConfig?.execution?.steps,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.execution', errorsResponse)
      }
    }
    if (stageConfig?.execution?.rollbackSteps) {
      const errorsResponse = validateSteps({
        steps: stageConfig.execution.rollbackSteps as ExecutionWrapperConfig[],
        template: templateStageConfig?.execution?.rollbackSteps,
        originalSteps: originalStageConfig?.execution?.rollbackSteps,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.execution.rollbackSteps', errorsResponse)
      }
    }

    return errors
  }
}

interface ValidatePipelineProps {
  pipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  viewType: StepViewType
  originalPipeline?: PipelineInfoConfig
  getString?: UseStringsReturn['getString']
  path?: string
}

/**
 * Validation for CI Codebase
 */
export const validateCICodebase = ({
  pipeline,
  template,
  originalPipeline,
  getString
}: ValidatePipelineProps): FormikErrors<PipelineInfoConfig> => {
  const errors = {}
  const shouldValidateCICodebase = originalPipeline?.stages?.some(stage =>
    Object.is(get(stage, 'stage.spec.cloneCodebase'), true)
  )

  if (
    shouldValidateCICodebase &&
    has(originalPipeline, 'properties') &&
    has(originalPipeline?.properties, 'ci') &&
    isEmpty(get(originalPipeline, 'properties.ci.codebase.build')) &&
    getString
  ) {
    set(errors, 'properties.ci.codebase', getString('fieldRequired', { field: getString('ciCodebase') }))
  }

  if (
    shouldValidateCICodebase &&
    getMultiTypeFromValue((template as PipelineInfoConfig)?.properties?.ci?.codebase?.build as unknown as string) ===
      MultiTypeInputType.RUNTIME
  ) {
    if (isEmpty(pipeline?.properties?.ci?.codebase?.build?.type)) {
      set(
        errors,
        'properties.ci.codebase.build.type',
        getString?.('fieldRequired', { field: getString?.('pipeline.ciCodebase.buildType') })
      )
    }

    if (
      pipeline?.properties?.ci?.codebase?.build?.type === 'branch' &&
      isEmpty(pipeline?.properties?.ci?.codebase?.build?.spec?.branch)
    ) {
      set(
        errors,
        'properties.ci.codebase.build.spec.branch',
        getString?.('fieldRequired', { field: getString?.('gitBranch') })
      )
    }

    if (
      pipeline?.properties?.ci?.codebase?.build?.type === 'tag' &&
      isEmpty(pipeline?.properties?.ci?.codebase?.build?.spec?.tag)
    ) {
      set(errors, 'properties.ci.codebase.build.spec.tag', getString?.('fieldRequired', { field: getString('gitTag') }))
    }

    if (
      pipeline?.properties?.ci?.codebase?.build?.type === 'PR' &&
      isEmpty(pipeline?.properties?.ci?.codebase?.build?.spec?.number)
    ) {
      set(
        errors,
        'properties.ci.codebase.build.spec.number',
        getString?.('fieldRequired', { field: getString?.('pipeline.gitPullRequestNumber') })
      )
    }
  }
  return errors
}

export const validatePipeline = ({
  pipeline,
  template,
  originalPipeline,
  viewType,
  getString,
  path
}: ValidatePipelineProps): FormikErrors<PipelineInfoConfig> => {
  const errors = validateCICodebase({
    pipeline,
    template,
    originalPipeline,
    viewType,
    getString,
    path
  })

  if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
    let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
    if (viewType === StepViewType.DeploymentForm) {
      timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
    }
    const timeout = Yup.object().shape({
      timeout: timeoutSchema
    })

    try {
      timeout.validateSync(pipeline)
    } catch (e) {
      /* istanbul ignore else */
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)

        Object.assign(errors, err)
      }
    }
  }

  if (pipeline?.variables) {
    const step = factory.getStep(StepType.CustomVariable)
    const errorsResponse: any = step?.validateInputSet({ data: pipeline, template, getString, viewType })

    if (!isEmpty(errorsResponse)) {
      set(errors, 'variables', errorsResponse.variables)
    }
  }
  pipeline.stages?.forEach((stageObj, index) => {
    if (stageObj.stage) {
      const originalStage = getStageFromPipeline(stageObj.stage.identifier, originalPipeline)
      const errorsResponse = validateStage({
        stage: stageObj.stage as StageElementConfig,
        template: template?.stages?.[index]?.stage,
        originalStage: originalStage?.stage,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, `${isEmpty(path) ? '' : `${path}.`}stages[${index}].stage`, errorsResponse)
      }
    }
    if (stageObj.parallel) {
      stageObj.parallel.forEach((stageP, indexP: number) => {
        if (stageP.stage) {
          const originalStage = getStageFromPipeline(stageP.stage.identifier, originalPipeline)
          const errorsResponse = validateStage({
            stage: stageP.stage as StageElementConfig,
            template: template?.stages?.[index].parallel?.[indexP]?.stage,
            originalStage: originalStage?.stage,
            getString,
            viewType
          })
          if (!isEmpty(errorsResponse)) {
            set(errors, `${isEmpty(path) ? '' : `${path}.`}stages[${index}].parallel[${indexP}].stage`, errorsResponse)
          }
        }
      })
    }
  })

  return errors
}

const getErrorsFlatten = memoize((errors: any): string[] => {
  return reduce(
    errors,
    (result: string[], value: any) => {
      if (typeof value === 'string') {
        result.push(value)
      } else if (isObject(value)) {
        return result.concat(getErrorsFlatten(value as any))
      }

      return result
    },
    []
  )
})

export const getErrorsList = memoize((errors: any): { errorStrings: string[]; errorCount: number } => {
  const errorList = getErrorsFlatten(errors)
  const errorCountMap: { [key: string]: number } = {}
  errorList.forEach(error => {
    if (errorCountMap[error]) {
      errorCountMap[error]++
    } else {
      errorCountMap[error] = 1
    }
  })
  const mapEntries = Object.entries(errorCountMap)
  const errorStrings = mapEntries.map(([key, count]) => `${key}  (${count})`)
  let errorCount = 0
  mapEntries.forEach(([_unused, count]) => {
    errorCount += count
  })
  return { errorStrings, errorCount }
})

export const validateCICodebaseConfiguration = ({ pipeline, getString }: Partial<ValidatePipelineProps>): string => {
  const shouldValidateCICodebase = pipeline?.stages?.some(stage =>
    Object.is(get(stage, 'stage.spec.cloneCodebase'), true)
  )
  if (
    shouldValidateCICodebase &&
    !has(pipeline, 'properties') &&
    !has(pipeline?.properties, 'ci') &&
    isEmpty(get(pipeline, 'properties.ci.codebase.build')) &&
    getString
  ) {
    return getString?.('pipeline.runPipeline.ciCodebaseConfig')
  }
  return ''
}

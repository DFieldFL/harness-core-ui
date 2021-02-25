import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import get from 'lodash-es/get'
import set from 'lodash-es/set'
import isEmpty from 'lodash-es/isEmpty'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { Step } from '@pipeline/exports'

import { loggerFor, ModuleName, UseStringsReturn } from 'framework/exports'
import { listSecretsV2Promise, NGVariable, SecretResponseWrapper } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { Scope } from '@common/interfaces/SecretsInterface'
import { CustomVariableEditable, CustomVariableEditableExtraProps } from './CustomVariableEditable'
import { CustomVariableInputSet, CustomVariableInputSetExtraProps } from './CustomVariableInputSet'
import { CustomVariablesEditableStage } from './CustomVariablesEditableStage'
import type { CustomVariablesData } from './CustomVariableEditable'
import type { StepProps } from '../../PipelineStep'

const logger = loggerFor(ModuleName.COMMON)

const getConnectorValue = (connector?: SecretResponseWrapper): string =>
  `${
    connector?.secret?.orgIdentifier && connector?.secret?.projectIdentifier
      ? connector?.secret?.identifier
      : connector?.secret?.orgIdentifier
      ? `${Scope.ORG}.${connector?.secret?.identifier}`
      : `${Scope.ACCOUNT}.${connector?.secret?.identifier}`
  }` || ''

const getConnectorName = (connector?: SecretResponseWrapper): string =>
  `${
    connector?.secret?.orgIdentifier && connector?.secret?.projectIdentifier
      ? `${connector?.secret?.type}: ${connector?.secret?.name}`
      : connector?.secret?.orgIdentifier
      ? `${connector?.secret?.type}[Org]: ${connector?.secret?.name}`
      : `${connector?.secret?.type}[Account]: ${connector?.secret?.name}`
  }` || ''

const SecretRefRegex = /^.+variables\.\d+\.value$/
export class CustomVariables extends Step<CustomVariablesData> {
  renderStep(
    props: StepProps<CustomVariablesData, CustomVariableEditableExtraProps | CustomVariableInputSetExtraProps>
  ): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps } = props

    if (stepViewType === StepViewType.InputSet) {
      return (
        <CustomVariableInputSet
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processData(data))}
          stepViewType={stepViewType}
          {...customStepProps}
        />
      )
    }

    if (stepViewType === StepViewType.StageVariable) {
      return (
        <CustomVariablesEditableStage
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processData(data))}
          stepViewType={stepViewType}
          {...customStepProps}
        />
      )
    }

    return (
      <CustomVariableEditable
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(this.processData(data))}
        stepViewType={stepViewType}
        {...customStepProps}
      />
    )
  }

  validateInputSet(
    data: CustomVariablesData,
    template?: CustomVariablesData,
    getString?: UseStringsReturn['getString']
  ): object {
    const errors: CustomVariablesData = { variables: [] }
    data?.variables?.forEach((variable: NGVariable, index) => {
      const currentVariableTemplate = get(template, `variables[${index}].value`, '')

      if (isEmpty(variable.value) && getMultiTypeFromValue(currentVariableTemplate) === MultiTypeInputType.RUNTIME) {
        set(errors, `variables[${index}].value`, getString?.('fieldRequired', { field: 'Value' }))
      }
    })
    if (!errors.variables.length) {
      delete errors.variables
    }
    return errors
  }

  protected async getSecretsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.value', ''))
      if (obj?.type === 'Secret') {
        const listOfSecrets = await listSecretsV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            includeSecretsFromEverySubScope: true,
            types: ['SecretText', 'SecretFile'],
            pageIndex: 0,
            pageSize: 100
          }
        }).then(response =>
          response?.data?.content?.map(connector => {
            return {
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            }
          })
        )
        return listOfSecrets || []
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  constructor() {
    super()
    this.invocationMap.set(SecretRefRegex, this.getSecretsListForYaml.bind(this))
  }

  protected type = StepType.CustomVariable
  protected stepName = 'Custom Variables'
  protected stepIcon: IconName = 'variable'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()
  protected defaultValues: CustomVariablesData = { variables: [] }

  protected processData(data: CustomVariablesData): CustomVariablesData {
    return {
      ...data,
      variables: data.variables.map(row => ({
        name: row.name,
        type: row.type,
        value:
          row.type === 'Number' && getMultiTypeFromValue(row.value) === MultiTypeInputType.FIXED && row.value
            ? parseFloat(row.value)
            : row.value
      })) as NGVariable[]
    }
  }
}

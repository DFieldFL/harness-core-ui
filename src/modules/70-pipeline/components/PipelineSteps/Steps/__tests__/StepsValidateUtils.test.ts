import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { get } from 'lodash-es'
import { render } from 'mustache'
import { validate, validateInputSet, Types } from '../StepsValidateUtils'

const strings = {
  fieldRequired: '{{field}} is a required field',
  identifier: 'Identifier',
  imageLabel: 'Image',
  commandLabel: 'Command',
  pipelineSteps: {
    stepNameLabel: 'Step Name',
    connectorLabel: 'Container Registry'
  },
  validation: {
    validStepIdRegex: 'Identifier can only contain alphanumerics and _',
    validStepNameRegex: 'Step Name can only contain alphanumerics, spaces, _ and -',
    validKeyRegex: 'Keys can only contain alphanumerics and _',
    validOutputVariableRegex: 'Output variables can only contain alphanumerics and _',
    illegalIdentifier:
      'Identifier must not be one of the following values: or, and, eq, ne, lt, gt, le, ge, div, mod, not, null, true, false, new, var, return',
    uniqueStepAndServiceDependenciesId: 'Identifier should be unique across the steps and service dependencies',
    uniqueKeys: 'Keys should be unique',
    uniqueValues: 'Values should be unique',
    matchPattern: 'Invalid value, please look for info above to read more'
  }
}

function getStringMock(key: string, vars: Record<string, any> = {}): string {
  const template = get(strings, key)

  if (typeof template !== 'string') {
    throw new Error(`No valid template with id "${key}" found in any namespace`)
  }

  return render(template, { ...vars, $: strings })
}

const editViewFieldsConfig = [
  {
    name: 'identifier',
    type: Types.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: Types.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.connectorRef',
    type: Types.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.image',
    type: Types.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: 'spec.command',
    type: Types.Text,
    label: 'commandLabel',
    isRequired: true
  },
  {
    name: 'spec.reportPaths',
    type: Types.List
  },
  {
    name: 'spec.envVariables',
    type: Types.Map
  },
  {
    name: 'spec.outputVariables',
    type: Types.OutputVariables
  },
  {
    name: 'spec.limitMemory',
    type: Types.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: Types.LimitCPU
  },
  {
    name: 'timeout',
    type: Types.Timeout
  }
]

const inputSetViewFieldsConfig = [
  {
    name: 'spec.connectorRef',
    type: Types.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.image',
    type: Types.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: 'spec.command',
    type: Types.Text,
    label: 'commandLabel',
    isRequired: true
  },
  {
    name: 'spec.reports.spec.paths',
    type: Types.List
  },
  {
    name: 'spec.envVariables',
    type: Types.Map
  },
  {
    name: 'spec.outputVariables',
    type: Types.OutputVariables
  },
  {
    name: 'spec.resources.limits.memory',
    type: Types.LimitMemory
  },
  {
    name: 'spec.resources.limits.cpu',
    type: Types.LimitCPU
  },
  {
    name: 'timeout',
    type: Types.Timeout
  }
]

const template = {
  identifier: 'Test_A',
  description: RUNTIME_INPUT_VALUE,
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    image: RUNTIME_INPUT_VALUE,
    command: RUNTIME_INPUT_VALUE,
    reports: {
      spec: {
        paths: RUNTIME_INPUT_VALUE
      }
    },
    envVariables: RUNTIME_INPUT_VALUE,
    outputVariables: RUNTIME_INPUT_VALUE,
    resources: {
      limits: {
        cpu: RUNTIME_INPUT_VALUE,
        memory: RUNTIME_INPUT_VALUE
      }
    }
  }
}

describe('StepValidateUtils', () => {
  describe('validate', () => {
    test('should return errors for required fields', () => {
      const result = validate({}, editViewFieldsConfig, { getString: getStringMock })

      expect(result).toEqual({
        identifier: 'Identifier is a required field',
        name: 'Step Name is a required field',
        spec: {
          connectorRef: 'Container Registry is a required field',
          image: 'Image is a required field',
          command: 'Command is a required field'
        }
      })
    })
  })

  describe('validateInputSet', () => {
    test('should return errors for required fields', () => {
      const result = validateInputSet({}, template, inputSetViewFieldsConfig, { getString: getStringMock })

      expect(result).toEqual({
        spec: {
          connectorRef: 'Container Registry is a required field',
          image: 'Image is a required field',
          command: 'Command is a required field'
        }
      })
    })

    test('should filter out fields that are not runtime inputs and not apply validation for them', () => {
      const result1 = validateInputSet({}, {}, inputSetViewFieldsConfig, { getString: getStringMock })
      expect(result1).toEqual({})

      const result2 = validateInputSet({}, { spec: { connectorRef: RUNTIME_INPUT_VALUE } }, inputSetViewFieldsConfig, {
        getString: getStringMock
      })
      expect(result2).toEqual({
        spec: {
          connectorRef: 'Container Registry is a required field'
        }
      })
    })
  })
})

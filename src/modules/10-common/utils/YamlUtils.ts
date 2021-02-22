// @ts-nocheck
import * as yamlLanguageService from '@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService'
import { isEmpty } from 'lodash-es'
import { TextDocument, Diagnostic } from 'vscode-languageserver-types'
import { parse, stringify } from 'yaml'

const DEFAULT_YAML_PATH = 'DEFAULT_YAML_PATH'

/**
 * @description Find json path(s) of a given node in json from it's nearest parent
 * @param jsonObj json equivalent of yaml
 * @param leafNode leaf node whose path(s) from the nearest parent needs to be known
 * @param delimiter delimiter to be used in node path(s) from parent
 * @returns exactly matching json path in the tree
 */
const findLeafToParentPath = (jsonObj: object, leafNode: string, delimiter = '.'): string | undefined => {
  const matchingPath: string[] = []
  function findPath(currJSONObj: object, currentDepth: number, previous?: string) {
    Object.keys(currJSONObj).forEach((key: string) => {
      const value = currJSONObj[key]
      const type = Object.prototype.toString.call(value)
      const isObject = type === '[object Object]' || type === '[object Array]'
      const newKey = previous ? previous + delimiter + key : key
      if (isObject && Object.keys(value).length) {
        if (key.match(leafNode)) {
          matchingPath.push(newKey)
        }
        return findPath(value, currentDepth + 1, newKey)
      }
      if (newKey.match(leafNode)) {
        matchingPath.push(newKey)
      }
    })
  }
  findPath(jsonObj, 1)
  return matchingPath.length > 0 ? matchingPath.slice(-1).pop() : 'DEFAULT_YAML_PATH'
}

/**
 * @description Validate yaml syntactically (syntax correctness)
 *
 * @param {yaml} yaml to validate
 * @returns Promise of list of syntax errors, if any
 *
 */
const validateYAML = (yaml: string): Promise<Diagnostic[]> => {
  /* istanbul ignore next */
  if (!yaml) {
    return Promise.reject('Invalid or empty yaml')
  }
  const textDocument = TextDocument.create('', 'yaml', 0, yaml)
  return yamlLanguageService.getLanguageService()?.doValidation(textDocument, false)
}

/**
 * @description Validate yaml semantically (adherence to a schema)
 *
 * @param {yaml} yaml to validate
 * @param {schema} schema to validate yaml against
 * @returns Promise of list of semantic errors, if any
 *
 */

const validateYAMLWithSchema = (yamlString: string, schema: object): Promise<Diagnostic[]> => {
  if (!yamlString) {
    return Promise.reject('Invalid or empty yaml.')
  }
  if (isEmpty(schema)) {
    return Promise.reject('Invalid or empty schema.')
  }
  const textDocument = TextDocument.create('', 'yaml', 0, yamlString)
  const languageService = setUpLanguageService(schema)
  return languageService?.doValidation(textDocument, false)
}

const getPartialYAML = (tokens: string[], endingIndex: number): string => {
  if (isEmpty(tokens) || endingIndex + 1 > tokens.length) {
    return ''
  }
  return tokens.slice(0, endingIndex + 1).join('\n')
}

/**
 * @description Validate a JSON against a schema
 *
 * @param jsonObj json to be validated
 * @param schema schema against which json is to be validated
 * @returns Map of json path to list of errors at that path
 */
const validateJSONWithSchema = (jsonObj: object, schema: object): Promise<Map<string, string[]>> => {
  if (isEmpty(jsonObj)) {
    return Promise.reject('Invalid or empty yaml.')
  }
  if (isEmpty(schema)) {
    return Promise.reject('Invalid or empty schema.')
  }
  const errorMap = new Map<string, string[]>()
  try {
    const yamlEqOfJSON = stringify(jsonObj)
    const lineContents = yamlEqOfJSON.split(/\r?\n/)
    const validationPromise = validateYAMLWithSchema(yamlEqOfJSON, getSchemaWithLanguageSettings(schema))
    validationPromise &&
      validationPromise
        .then((validationErrors: Diagnostic[]) => {
          if (!isEmpty(validationErrors)) {
            validationErrors.map(error => {
              const idx = error.range.end.line
              if (idx <= lineContents.length) {
                const key = lineContents[idx]?.split(':')?.[0]?.trim()
                const partialYAML = getPartialYAML(lineContents, idx)
                const partialJSONEqofYAML = parse(partialYAML)
                if (key && !isEmpty(partialJSONEqofYAML)) {
                  const jsonPathOfKey = findLeafToParentPath(partialJSONEqofYAML, key)
                  if (jsonPathOfKey) {
                    if (errorMap.has(jsonPathOfKey)) {
                      const existingErrors = errorMap.get(jsonPathOfKey) || []
                      existingErrors.push(error.message)
                      errorMap.set(jsonPathOfKey, existingErrors)
                    } else {
                      errorMap.set(jsonPathOfKey, [error.message])
                    }
                  }
                }
              }
            })
          }
        })
        .catch(err => Promise.reject(err))
  } catch (err) {
    Promise.reject(err)
  }
  return Promise.resolve(errorMap)
}

const setUpLanguageService = (schema: object) => {
  const languageService = yamlLanguageService.getLanguageService()
  languageService?.configure(schema)
  return languageService
}

const getSchemaWithLanguageSettings = (schema: object): object => {
  return {
    validate: true,
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    schemas: [
      {
        fileMatch: ['*'],
        schema
      }
    ]
  }
}

export {
  validateYAML,
  validateYAMLWithSchema,
  validateJSONWithSchema,
  getSchemaWithLanguageSettings,
  DEFAULT_YAML_PATH,
  findLeafToParentPath
}

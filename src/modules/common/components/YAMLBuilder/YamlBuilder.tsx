// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import MonacoEditor from 'react-monaco-editor'
import '@wings-software/monaco-yaml/lib/esm/monaco.contribution'
import { languages } from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor'
import YamlWorker from 'worker-loader!@wings-software/monaco-yaml/lib/esm/yaml.worker'
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker'
import { Toaster, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import * as YAML from 'yaml'
import { Tag, Layout, Icon } from '@wings-software/uikit'
import type {
  YamlBuilderProps,
  YamlBuilderHandlerBinding,
  CompletionItemInterface
} from 'modules/common/interfaces/YAMLBuilderProps'
import SnippetSection from 'modules/common/components/SnippetSection/SnippetSection'
import { JSONSchemaService } from 'modules/dx/services'
import { validateYAML, validateYAMLWithSchema, addYAMLLanguageSettingsToSchema } from 'modules/common/utils/YamlUtils'

import css from './YamlBuilder.module.scss'
import { debounce } from 'lodash-es'

monaco.editor.defineTheme('vs', {
  base: 'vs',
  inherit: false,
  rules: [
    { token: 'type', foreground: '1D76FF' },
    { token: 'string', foreground: '22272D' },
    { token: 'comment', foreground: '9aa5b5' }
  ]
})
monaco.editor.setTheme('vs')

window.MonacoEnvironment = {
  getWorker(workerId, label: string) {
    if (label === 'yaml') {
      return new YamlWorker()
    }
    return new EditorWorker()
  }
}

const toaster = Toaster.create()

/**
 * @description Find json path(s) of a given node in json from it's nearest parent
 * @param jsonObj json equivalent of yaml
 * @param leafNode leaf node whose path(s) from the nearest parent needs to be known
 * @param delimiter delimiter to be used in node path(s) from parent
 * @returns exactly matching json path in the tree
 */
const findLeafToParentPath = (jsonObj, leafNode, delimiter = '.') => {
  let matchingPath = []
  function findPath(currJSONObj, currentDepth, previous) {
    Object.keys(currJSONObj).forEach(function (key) {
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
  return matchingPath.length > 0 ? matchingPath[0] : null
}

const YAMLBuilder: React.FC<YamlBuilderProps> = props => {
  const {
    height,
    width,
    fileName,
    entityType,
    existingYaml,
    isReadOnlyMode,
    showSnippetSection = true,
    invocationMap,
    bind,
    snippets,
    showIconMenu = false,
    onSnippetSearch,
    onExpressionTrigger
  } = props
  const [currentYaml, setCurrentYaml] = useState<string | undefined>('')
  const [yamlValidationErrors, setYamlValidationErrors] = useState<Map<string, string> | undefined>()
  const editorRef = useRef(null)
  const TRIGGER_CHAR_FOR_NEW_EXPR = '$'
  const TRIGGER_CHAR_FOR_PARTIAL_EXPR = '.'
  const KEY_CODE_FOR_DOLLAR_SIGN = 'Digit4'
  const KEY_CODE_FOR_SEMI_COLON = 'Semicolon'
  const KEY_CODE_FOR_PERIOD = 'Period'
  const DEFAULT_YAML_PATH = 'DEFAULT_YAML_PATH'

  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => currentYaml,
        getYAMLValidationErrorMap: () => yamlValidationErrors
      } as YamlBuilderHandlerBinding),
    [currentYaml]
  )

  function getJSONFromYAML(yaml: string): Record<string, any> {
    try {
      return YAML.parse(yaml)
    } catch (error) {
      toaster.show({ message: 'Error while content parsing', intent: Intent.DANGER, timeout: 5000 })
      throw error
    }
  }

  useEffect(() => {
    bind?.(handler)
  }, [bind, handler])

  useEffect(() => {
    const { yaml } = languages || {}
    const languageSettings = getYAMLLanguageSettings(entityType)
    yaml?.yamlDefaults.setDiagnosticsOptions(languageSettings)
    setCurrentYaml(props.existingYaml)
    verifyYAMLValidity(props.existingYaml)
  }, [existingYaml, entityType])

  const getYAMLLanguageSettings = (entityType: string): Record<string, string> => {
    const jsonSchemas = JSONSchemaService.fetchEntitySchemas(entityType)
    const languageSetting = addYAMLLanguageSettingsToSchema([jsonSchemas])
    return languageSetting
  }

  const onYamlChange = (updatedYaml: string): void => {
    setCurrentYaml(updatedYaml)
    verifyYAMLValidity(updatedYaml)
  }

  const getYAMLPathToValidationErrorMap = (
    currentYaml: string,
    validationErrors: Diagnostic[]
  ): Map<string, string> => {
    const yamlPathToValidationErrorMap = new Map<string, string>()
    try {
      if (!validationErrors) {
        return yamlPathToValidationErrorMap
      }
      const editor = editorRef?.current?.editor
      const jsonEquivalentOfYAMLInEditor = getJSONFromYAML(currentYaml)
      if (Object.keys(jsonEquivalentOfYAMLInEditor).length > 0) {
        validationErrors.forEach(valError => {
          const errorLineNum = valError?.range.end?.line + 1
          const textInCurrentEditorLine = editor.getModel().getLineContent(errorLineNum).trim()
          const [currentProperty, value] = textInCurrentEditorLine?.split(':').map(item => item.trim())
          const path = findLeafToParentPath(jsonEquivalentOfYAMLInEditor, currentProperty)
          yamlPathToValidationErrorMap.set(path, valError.message)
        })
      }
    } catch (error) {
      yamlPathToValidationErrorMap.set(DEFAULT_YAML_PATH, error)
    }
    return yamlPathToValidationErrorMap
  }

  const verifyYAMLValidity = (currentYaml: string): void => {
    const jsonSchemas = JSONSchemaService.fetchEntitySchemas(entityType)
    validateYAMLWithSchema(currentYaml, [jsonSchemas])
      .then(validationErrors => {
        if (validationErrors && Array.isArray(validationErrors)) {
          const validationErrorMap = getYAMLPathToValidationErrorMap(currentYaml, validationErrors)
          setYamlValidationErrors(validationErrorMap)
        }
      })
      .catch(error => {
        toaster.show({ message: error, intent: Intent.DANGER, timeout: 5000 })
      })
  }

  const editorDidMount = (editor, monaco) => {
    if (editor) {
      if (!props.isReadOnlyMode) {
        editor.focus()
      }
      editor.onKeyDown((event: KeyboardEvent) => handleEditorKeyDownEvent(event, editor))
    }
  }

  const disposePreviousSuggestions = (): void => {
    if (expressionCompletionDisposer) {
      expressionCompletionDisposer.dispose()
    }
    if (runTimeCompletionDisposer) {
      runTimeCompletionDisposer.dispose()
    }
  }

  /** For expressions */
  const getExpressionFromCurrentLine = (editor): string => {
    const textInCurrentEditorLine = editor.getModel().getLineContent(editor.getPosition().lineNumber)
    const [property, expression] = textInCurrentEditorLine.split(':').map(item => item.trim())
    return expression
  }

  let expressionCompletionDisposer: { dispose: () => void }
  function registerCompletionItemProviderForExpressions(
    editor,
    triggerCharacters: string[],
    matchingPath: string,
    currentExpression?: string = ''
  ): void {
    if (editor) {
      const suggestionsPromise = onExpressionTrigger ? onExpressionTrigger(matchingPath, currentExpression) : null
      if (suggestionsPromise) {
        suggestionsPromise.then(suggestions => {
          expressionCompletionDisposer = editor?.languages?.registerCompletionItemProvider('yaml', {
            triggerCharacters,
            provideCompletionItems: () => {
              return { suggestions }
            }
          })
        })
      }
    }
  }

  /** For RT Inputs */
  let runTimeCompletionDisposer: { dispose: () => void }
  function registerCompletionItemProviderForRTInputs(
    editor,
    suggestionsPromise: Promise<CompletionItemInterface[]>
  ): void {
    if (editor) {
      suggestionsPromise.then(suggestions => {
        runTimeCompletionDisposer = editor?.languages?.registerCompletionItemProvider('yaml', {
          triggerCharacters: [' '],
          provideCompletionItems: () => {
            return { suggestions }
          }
        })
      })
    }
  }

  const invokeCallBackForMatchingYAMLPaths = (monaco, matchingPath: string, editor): void => {
    invocationMap?.forEach((callBackFunc, yamlPath) => {
      if (matchingPath.match(yamlPath) && typeof callBackFunc === 'function') {
        const suggestionsPromise = callBackFunc(matchingPath, getYAMLFromEditor(editor, true))
        registerCompletionItemProviderForRTInputs(monaco, suggestionsPromise)
      }
    })
  }

  const getYAMLFromEditor = (editor, shouldAddPlaceholder: boolean): string => {
    const currentEditorPosition = editor.getPosition(),
      textInCurrentEditorLine = editor.getValue(currentEditorPosition).trim(),
      currentLineNumber = currentEditorPosition.lineNumber,
      splitedText = textInCurrentEditorLine.split('\n').slice(0, currentLineNumber),
      currentLineContent = splitedText[currentLineNumber - 1]
    let textToInsert = ''
    if (shouldAddPlaceholder) {
      textToInsert = textInCurrentEditorLine[textInCurrentEditorLine.length - 1] === ':' ? '' : ': ' + 'placeholder'
    }
    splitedText[currentLineNumber - 1] = [
      currentLineContent?.slice(0, currentEditorPosition.column - 1),
      textToInsert,
      currentLineContent?.slice(currentEditorPosition.column - 1)
    ].join('')
    editor.setPosition(currentEditorPosition)

    return splitedText.join('\n')
  }

  const getMetaDataForKeyboardEventProcessing = (
    editor,
    shouldAddPlaceholder: boolean = false
  ): Record<string, string> => {
    const yamlInEditor = getYAMLFromEditor(editor, shouldAddPlaceholder)
    const jsonEquivalentOfYAMLInEditor = getJSONFromYAML(yamlInEditor)
    const textInCurrentEditorLine = editor.getModel().getLineContent(editor.getPosition().lineNumber)
    const [currentProperty, value] = textInCurrentEditorLine?.split(':').map(item => item.trim())
    const parentToCurrentPropertyPath = findLeafToParentPath(jsonEquivalentOfYAMLInEditor, currentProperty)
    return { currentProperty, yamlInEditor, parentToCurrentPropertyPath }
  }

  const handleEditorKeyDownEvent = (event: KeyboardEvent, editor): void => {
    const { shiftKey, code } = event
    //TODO Need to check hotkey for cross browser/cross OS compatibility
    //TODO Need to debounce this function call for performance optimization
    if (shiftKey) {
      if (code === KEY_CODE_FOR_DOLLAR_SIGN) {
        const { currentProperty, yamlInEditor, parentToCurrentPropertyPath } = getMetaDataForKeyboardEventProcessing(
          editor
        )
        disposePreviousSuggestions()
        registerCompletionItemProviderForExpressions(monaco, [TRIGGER_CHAR_FOR_NEW_EXPR], parentToCurrentPropertyPath)
      } else if (code === KEY_CODE_FOR_SEMI_COLON && invocationMap?.size > 0) {
        const { currentProperty, yamlInEditor, parentToCurrentPropertyPath } = getMetaDataForKeyboardEventProcessing(
          editor,
          true
        )
        disposePreviousSuggestions()
        invokeCallBackForMatchingYAMLPaths(monaco, parentToCurrentPropertyPath, editor)
      }
    }
    if (code === KEY_CODE_FOR_PERIOD) {
      const { currentProperty, yamlInEditor, parentToCurrentPropertyPath } = getMetaDataForKeyboardEventProcessing(
        editor
      )
      disposePreviousSuggestions()
      registerCompletionItemProviderForExpressions(
        monaco,
        [TRIGGER_CHAR_FOR_PARTIAL_EXPR],
        parentToCurrentPropertyPath,
        getExpressionFromCurrentLine(editor)
      )
    }
  }

  return (
    <div className={css.main}>
      <Layout.Horizontal className={css.layout}>
        <div className={cx(css.builderSection, { [css.editorOnly]: !showSnippetSection })}>
          <div className={css.header}>
            <div className={css.flexCenter}>
              <span className={cx(css.filePath, css.flexCenter)}>{fileName}</span>
              {fileName && entityType ? <Tag className={css.entityTag}>{entityType}</Tag> : null}
            </div>
            {yamlValidationErrors?.size > 0 ? (
              <div className={cx(css.flexCenter, css.validationStatus)}>
                <Icon name="main-issue-filled" size={14} className={css.validationIcon} />
                <span className={css.invalidYaml}>Invalid</span>
              </div>
            ) : null}
          </div>
          <div className={css.editor}>
            <MonacoEditor
              defaultValue={existingYaml}
              width={width ?? '800px'}
              height={height ?? '600px'}
              language="yaml"
              value={currentYaml}
              onChange={debounce(onYamlChange, 200)}
              editorDidMount={editorDidMount}
              options={{ readOnly: isReadOnlyMode, wordBasedSuggestions: false }}
              ref={editorRef}
            />
          </div>
        </div>
        {showSnippetSection ? (
          <SnippetSection
            showIconMenu={showIconMenu}
            entityType={entityType}
            snippets={snippets}
            onSnippetSearch={onSnippetSearch}
          />
        ) : null}
      </Layout.Horizontal>
    </div>
  )
}

export default YAMLBuilder

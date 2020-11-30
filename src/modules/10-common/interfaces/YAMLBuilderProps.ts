import type { CompletionItemKind } from 'vscode-languageserver-types'
import type { YamlEntity } from '../constants/YamlConstants'

export interface YamlBuilderHandlerBinding {
  getLatestYaml: () => string
  getYAMLValidationErrorMap: () => Map<string, string[]>
}

export type InvocationMapFunction = (matchingPath: string, currentYaml: string) => Promise<CompletionItemInterface[]>

export interface YamlBuilderProps {
  height?: React.CSSProperties['height']
  width?: React.CSSProperties['width']
  fileName: string
  existingJSON?: Record<string, any>
  entityType: YamlEntity
  entitySubType?: string
  bind?: (dynamicPopoverHandler: YamlBuilderHandlerBinding) => void
  invocationMap?: Map<RegExp, InvocationMapFunction>
  isReadOnlyMode?: boolean
  showSnippetSection?: boolean
  showIconMenu?: boolean
  onSnippetSearch?: (queryString: string) => void
  onExpressionTrigger?: (yamlPath: string, currentExpression: string) => Promise<CompletionItemInterface[]>
}

export interface CompletionItemInterface {
  label: string
  kind: CompletionItemKind
  insertText: string
}

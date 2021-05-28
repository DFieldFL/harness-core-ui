import React, { MutableRefObject } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import type { MonacoEditorProps } from 'react-monaco-editor'

export type ReactMonacoEditorRef =
  | ((instance: ReactMonacoEditor | null) => void)
  | MutableRefObject<ReactMonacoEditor | null>
  | null

const MonacoEditor = (props: MonacoEditorProps, ref: ReactMonacoEditorRef) => {
  React.useEffect(() => {
    const remeasureFonts = () => {
      //@ts-ignore
      monaco?.editor?.remeasureFonts()
    }

    // TODO: font name should be a global (for all)
    const loaded = (document as any).fonts?.check?.('1em Roboto Mono')

    if (loaded) {
      remeasureFonts()
    } else {
      ;(document as any).fonts?.ready?.then?.(remeasureFonts)
    }
  }, [])

  const editorWillMount = () => {
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [{ background: 'd9dae5' }],
      colors: {
        'editor.background': '#d9dae5'
      }
    })
  }

  const theme = props.options?.readOnly ? 'disable-theme' : 'vs'

  return <ReactMonacoEditor {...props} ref={ref} theme={theme} editorWillMount={editorWillMount} />
}

export default React.forwardRef(MonacoEditor)

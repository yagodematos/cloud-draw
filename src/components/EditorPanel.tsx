import CodeMirror from "@uiw/react-codemirror"
import { buildEditorExtensions } from "../editor/setup"
import type { ParseError } from "../core/parser/parse-error"

interface EditorPanelProps {
  value: string
  parseError: ParseError | null
  onChange: (value: string) => void
}

export function EditorPanel({ value, parseError, onChange }: EditorPanelProps) {
  return (
    <div className="editor-panel">
      <div className="panel-title">
        <strong>DSL editor</strong>
        <span>Type architecture structure, properties, and connections.</span>
      </div>
      <div className="editor-shell">
        <CodeMirror
          value={value}
          height="100%"
          basicSetup={{
            foldGutter: false,
            highlightActiveLine: false,
            lineNumbers: true
          }}
          theme="light"
          extensions={buildEditorExtensions(value, parseError)}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

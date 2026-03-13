import { Decoration, EditorView } from "@uiw/react-codemirror"
import type { Extension } from "@codemirror/state"
import type { ParseError } from "../core/parser/parse-error"

function findLineEnd(source: string, offset: number) {
  const nextLineBreak = source.indexOf("\n", offset)
  return nextLineBreak === -1 ? source.length : nextLineBreak
}

function getLineStart(error: ParseError) {
  return Math.max(0, error.offset - (error.column - 1))
}

export function createErrorDecorations(source: string, error: ParseError | null): Extension[] {
  if (!error) {
    return []
  }

  const lineStart = getLineStart(error)
  const lineEnd = findLineEnd(source, error.offset)
  const mark = Decoration.mark({ class: "cm-parse-error" }).range(error.offset, Math.max(error.offset + 1, lineEnd))
  const line = Decoration.line({ class: "cm-parse-error-line" }).range(lineStart)

  return [
    EditorView.decorations.of(Decoration.set([line, mark])),
    EditorView.theme({
      ".cm-parse-error": {
        backgroundColor: "rgba(204, 59, 24, 0.12)",
        borderBottom: "2px solid rgba(204, 59, 24, 0.8)"
      },
      ".cm-parse-error-line": {
        backgroundColor: "rgba(204, 59, 24, 0.04)"
      }
    })
  ]
}

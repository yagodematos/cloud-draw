import { EditorView } from "@uiw/react-codemirror"
import { clouddsl } from "./dsl-language"
import { iconAutocomplete } from "./autocomplete"
import { createErrorDecorations } from "./error-decorations"
import type { ParseError } from "../core/parser/parse-error"

export function buildEditorExtensions(source: string, error: ParseError | null) {
  return [
    ...clouddsl(),
    iconAutocomplete(),
    EditorView.lineWrapping,
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "13px"
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)"
      },
      ".cm-keyword, .cm-operator": {
        color: "#155eef",
        fontWeight: "700"
      },
      ".cm-comment": {
        color: "#7a869d",
        fontStyle: "italic"
      },
      ".cm-squareBracket": {
        color: "#6e4aff"
      },
      ".cm-brace": {
        color: "#23314f",
        fontWeight: "700"
      },
      ".cm-property": {
        color: "#b54708"
      },
      ".cm-string": {
        color: "#117864"
      },
      ".cm-name": {
        color: "#172033"
      },
      ".cm-separator": {
        color: "#5b6578"
      },
      ".cm-content": {
        padding: "18px 18px 24px"
      },
      ".cm-gutters": {
        borderRight: "1px solid rgba(23, 32, 51, 0.08)",
        backgroundColor: "#f8fbff"
      }
    }),
    ...createErrorDecorations(source, error)
  ]
}

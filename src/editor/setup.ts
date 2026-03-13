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
        fontSize: "13px",
        backgroundColor: "#162038",
        color: "#f7f6f2"
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)"
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#f7f6f2"
      },
      ".cm-activeLine": {
        backgroundColor: "rgba(255, 255, 255, 0.04)"
      },
      ".cm-keyword, .cm-operator": {
        color: "#88aaff",
        fontWeight: "700"
      },
      ".cm-comment": {
        color: "#f1a561",
        fontStyle: "italic"
      },
      ".cm-squareBracket": {
        color: "#d6a8ff"
      },
      ".cm-brace": {
        color: "#f7f6f2",
        fontWeight: "700"
      },
      ".cm-property": {
        color: "#7be0cf"
      },
      ".cm-string": {
        color: "#ffd089"
      },
      ".cm-name": {
        color: "#f7f6f2"
      },
      ".cm-separator": {
        color: "#b8c5de"
      },
      ".cm-content": {
        padding: "18px 18px 24px"
      },
      ".cm-gutters": {
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        backgroundColor: "#1b2743",
        color: "#94a3bd"
      }
    }),
    ...createErrorDecorations(source, error)
  ]
}

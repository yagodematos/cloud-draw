import { type StringStream, StreamLanguage } from "@codemirror/language"

const dslStreamParser = {
  startState: () => ({ inProps: false }),
  token(stream: StringStream, state: { inProps: boolean }) {
    if (stream.sol() && stream.match(/\s*#.*/)) {
      return "comment"
    }

    if (stream.eatSpace()) {
      return null
    }

    if (stream.match("[")) {
      state.inProps = true
      return "squareBracket"
    }

    if (stream.match("]")) {
      state.inProps = false
      return "squareBracket"
    }

    if (stream.match("{") || stream.match("}")) {
      return "brace"
    }

    if (stream.match(/<-->|-->|<>|>/)) {
      return "operator"
    }

    if (stream.match(/direction(?=\s*:)/)) {
      return "keyword"
    }

    if (state.inProps && stream.match(/[a-zA-Z][\w-]*(?=\s*:)/)) {
      return "property"
    }

    if (stream.match(/"[^"]*"|'[^']*'/)) {
      return "string"
    }

    if (stream.match(/:/)) {
      return "separator"
    }

    stream.next()
    return "name"
  }
}

export const dslLanguage = StreamLanguage.define(dslStreamParser)

export function clouddsl() {
  return [
    dslLanguage,
    dslLanguage.data.of({
      commentTokens: { line: "#" }
    })
  ]
}

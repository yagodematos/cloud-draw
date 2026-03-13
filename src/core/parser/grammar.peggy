{
  function toLocation(range) {
    return {
      start: {
        offset: range.start.offset,
        line: range.start.line,
        column: range.start.column
      },
      end: {
        offset: range.end.offset,
        line: range.end.line,
        column: range.end.column
      }
    }
  }

  function raiseError(message, range) {
    const error = new Error(message)
    error.location = toLocation(range)
    throw error
  }

  function splitProperties(source) {
    const parts = []
    let current = ""
    let quote = null

    for (const char of source) {
      if (quote) {
        current += char
        if (char === quote) {
          quote = null
        }
        continue
      }

      if (char === "'" || char === "\"") {
        quote = char
        current += char
        continue
      }

      if (char === ",") {
        parts.push(current)
        current = ""
        continue
      }

      current += char
    }

    if (quote) {
      throw new Error("Unterminated quoted property value")
    }

    if (current) {
      parts.push(current)
    }

    return parts
  }

  function parseValue(value) {
    const trimmed = value.trim()
    if (!trimmed) {
      throw new Error("Property value cannot be empty")
    }

    if (
      (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1)
    }

    return trimmed
  }

  function parseProps(segment, range) {
    if (!segment) {
      return {}
    }

    const trimmed = segment.trim()
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
      raiseError("Property list must use [key: value] syntax", range)
    }

    const body = trimmed.slice(1, -1).trim()
    if (!body) {
      return {}
    }

    const props = {}

    try {
      for (const part of splitProperties(body)) {
        const trimmedPart = part.trim()
        if (!trimmedPart) {
          continue
        }

        const match = /^([a-zA-Z][a-zA-Z0-9-]*)\s*:\s*(.+)$/.exec(trimmedPart)
        if (!match) {
          raiseError(`Invalid property "${trimmedPart}"`, range)
        }

        props[match[1]] = parseValue(match[2])
      }
    } catch (error) {
      raiseError(error.message, range)
    }

    return props
  }

  function parseEntityHeader(rawHeader, range) {
    const header = rawHeader.trim()
    if (!header) {
      raiseError("Name cannot be empty", range)
    }

    const match = /^(.*?)(?:\s*(\[[\s\S]+\]))?$/.exec(header)
    if (!match) {
      raiseError("Invalid entity declaration", range)
    }

    const name = match[1].trim()
    if (!name) {
      raiseError("Name cannot be empty", range)
    }

    return {
      name,
      props: parseProps(match[2], range)
    }
  }

  function parseConnection(rawLine, range) {
    const match = /^(.*?)\s*(<-->|-->|<>|>)\s*(.*?)(?:\s*:\s*(.+))?$/.exec(rawLine.trim())
    if (!match) {
      return null
    }

    const fromName = match[1].trim()
    const toName = match[3].trim()
    if (!fromName || !toName) {
      raiseError("Connections must include both endpoints", range)
    }

    const operator = match[2]
    return {
      kind: "connection",
      fromName,
      toName,
      label: match[4]?.trim() || undefined,
      style: operator.includes("--") ? "dashed" : "solid",
      direction: operator.includes("<") ? "bidirectional" : "forward",
      location: toLocation(range)
    }
  }

  function parseDirection(rawLine, range) {
    const match = /^direction\s*:\s*(left-right|top-bottom)\s*$/i.exec(rawLine.trim())
    if (!match) {
      return null
    }

    return {
      kind: "setting",
      key: "direction",
      value: match[1].toLowerCase(),
      location: toLocation(range)
    }
  }

  function buildLine(rawLine, range) {
    const line = rawLine.trim()
    if (!line) {
      return null
    }

    if (line.includes("{") || line.includes("}")) {
      raiseError("Unexpected brace in statement", range)
    }

    const direction = parseDirection(line, range)
    if (direction) {
      return direction
    }

    const connection = parseConnection(line, range)
    if (connection) {
      return connection
    }

    const entity = parseEntityHeader(line, range)
    return {
      kind: "node",
      name: entity.name,
      props: entity.props,
      location: toLocation(range)
    }
  }

  function buildGroup(rawHeader, children, range) {
    const entity = parseEntityHeader(rawHeader, range)
    return {
      kind: "group",
      name: entity.name,
      props: entity.props,
      children,
      location: toLocation(range)
    }
  }
}

document
  = items:item* {
      return {
        statements: items.filter(Boolean)
      }
    }

item
  = blankLine
  / commentLine
  / group
  / lineStatement

group
  = indent:[ \t]* header:groupHeader [ \t]* "{" lineBreak? items:item* closingIndent:[ \t]* "}" lineBreak? {
      void indent
      void closingIndent
      return buildGroup(header, items.filter(Boolean), location())
    }

groupHeader
  = text:$((!"{" !lineBreak .)+) {
      return text.trim()
    }

lineStatement
  = indent:[ \t]* text:$((!lineBreak !"}" .)+) lineBreak? {
      void indent
      return buildLine(text, location())
    }

commentLine
  = [ \t]* "#" [^\n\r]* lineBreak? {
      return null
    }

blankLine
  = [ \t]* lineBreak {
      return null
    }

lineBreak
  = "\r\n"
  / "\n"
  / "\r"

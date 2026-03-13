import type { SourceLocation } from "./ast"

export interface ParseError {
  message: string
  line: number
  column: number
  offset: number
}

export class DiagramParseError extends Error {
  location: SourceLocation

  constructor(message: string, location: SourceLocation) {
    super(message)
    this.name = "DiagramParseError"
    this.location = location
  }
}

export function toParseError(message: string, location: SourceLocation): ParseError {
  return {
    message,
    line: location.start.line,
    column: location.start.column,
    offset: location.start.offset
  }
}

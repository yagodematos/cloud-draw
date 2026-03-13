export type DiagramDirection = "top-bottom" | "left-right"
export type ConnectionStyle = "solid" | "dashed"
export type ConnectionDirection = "forward" | "bidirectional"
export type GroupStyle = "solid" | "dashed"

export interface SourcePosition {
  offset: number
  line: number
  column: number
}

export interface SourceLocation {
  start: SourcePosition
  end: SourcePosition
}

export interface Diagram {
  direction: DiagramDirection
  nodes: Node[]
  groups: Group[]
  connections: Connection[]
}

export interface Node {
  id: string
  name: string
  label?: string
  icon?: string
  color?: string
  parent?: string
  location: SourceLocation
}

export interface Group {
  id: string
  name: string
  label?: string
  icon?: string
  color?: string
  style?: GroupStyle
  parent?: string
  children: Array<Node | Group>
  location: SourceLocation
}

export interface Connection {
  id: string
  from: string
  to: string
  label?: string
  style: ConnectionStyle
  direction: ConnectionDirection
  location: SourceLocation
}

export interface RawNodeStatement {
  kind: "node"
  name: string
  props: Record<string, string>
  location: SourceLocation
}

export interface RawGroupStatement {
  kind: "group"
  name: string
  props: Record<string, string>
  children: RawStatement[]
  location: SourceLocation
}

export interface RawConnectionStatement {
  kind: "connection"
  fromName: string
  toName: string
  label?: string
  style: ConnectionStyle
  direction: ConnectionDirection
  location: SourceLocation
}

export interface RawSettingStatement {
  kind: "setting"
  key: "direction"
  value: DiagramDirection
  location: SourceLocation
}

export type RawStatement =
  | RawNodeStatement
  | RawGroupStatement
  | RawConnectionStatement
  | RawSettingStatement

export interface RawDiagramDocument {
  statements: RawStatement[]
}

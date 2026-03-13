import type {
  ConnectionDirection,
  ConnectionStyle,
  Diagram,
  GroupStyle
} from "../parser/ast"

export interface LayoutBounds {
  width: number
  height: number
}

export interface LayoutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  icon?: string
  color?: string
}

export interface LayoutGroup {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  icon?: string
  color?: string
  style?: GroupStyle
}

export interface LayoutEdge {
  id: string
  from: string
  to: string
  label?: string
  points: Array<{ x: number; y: number }>
  style: ConnectionStyle
  direction: ConnectionDirection
}

export interface LayoutResult {
  bounds: LayoutBounds
  nodes: LayoutNode[]
  groups: LayoutGroup[]
  edges: LayoutEdge[]
}

export interface LayoutRequestMessage {
  type: "layout"
  id: number
  ast: Diagram
}

export interface LayoutResultMessage {
  type: "layout-result"
  id: number
  layout: LayoutResult
}

export interface LayoutErrorMessage {
  type: "layout-error"
  id: number
  error: string
}

export type LayoutWorkerRequest = LayoutRequestMessage
export type LayoutWorkerResponse = LayoutResultMessage | LayoutErrorMessage

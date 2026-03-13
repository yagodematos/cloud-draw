import type { UseDiagramResult } from "../hooks/useDiagram"
import type { DiagramDirection } from "../core/parser/ast"

interface StatusBarProps {
  nodeCount: number
  groupCount: number
  connectionCount: number
  exampleName: string
  direction: DiagramDirection
  zoom: number
  state: UseDiagramResult
}

function formatDirection(direction: DiagramDirection) {
  return direction === "left-right" ? "Left to right" : "Top to bottom"
}

function formatHeadline(state: UseDiagramResult) {
  if (state.parseError) {
    return "Source needs attention"
  }

  if (state.runtimeError) {
    return "Layout pipeline interrupted"
  }

  if (state.status === "layouting") {
    return "Refreshing layout"
  }

  if (state.status === "parsing") {
    return "Parsing diagram source"
  }

  return "Preview synced"
}

export function StatusBar({
  nodeCount,
  groupCount,
  connectionCount,
  exampleName,
  direction,
  zoom,
  state,
}: StatusBarProps) {
  const message = state.parseError
    ? `${state.parseError.message} at ${state.parseError.line}:${state.parseError.column}`
    : state.runtimeError
      ? state.runtimeError
      : state.status === "layouting"
        ? "Computing layout"
        : state.status === "parsing"
          ? "Parsing source"
          : "Live preview ready"
  const headline = formatHeadline(state)
  const directionLabel = formatDirection(direction)

  return (
    <footer className="status-bar">
      <div className="status-metrics" aria-label="Diagram metrics">
        <div className="status-metric" aria-label={`${nodeCount} nodes`}>
          <strong>{nodeCount}</strong>
          <span>Nodes</span>
        </div>
        <div className="status-metric" aria-label={`${groupCount} groups`}>
          <strong>{groupCount}</strong>
          <span>Groups</span>
        </div>
        <div
          className="status-metric"
          aria-label={`${connectionCount} connections`}
        >
          <strong>{connectionCount}</strong>
          <span>Connections</span>
        </div>
        <div
          className="status-metric"
          aria-label={`${Math.round(zoom * 100)}% zoom`}
        >
          <strong>{Math.round(zoom * 100)}%</strong>
          <span>Zoom</span>
        </div>
      </div>
      <div className="status-summary">
        <div className="status-copy">
          <span className="status-eyebrow">{exampleName}</span>
          <strong>{headline}</strong>
          <span className="status-message">
            {message} • {directionLabel}
          </span>
        </div>
        <span className={`status-pill status-${state.status}`}>
          {state.status}
        </span>
      </div>
    </footer>
  )
}

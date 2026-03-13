import type { UseDiagramResult } from "../hooks/useDiagram"

interface StatusBarProps {
  nodeCount: number
  groupCount: number
  connectionCount: number
  state: UseDiagramResult
}

export function StatusBar({ nodeCount, groupCount, connectionCount, state }: StatusBarProps) {
  const message = state.parseError
    ? `${state.parseError.message} at ${state.parseError.line}:${state.parseError.column}`
    : state.runtimeError
      ? state.runtimeError
      : state.status === "layouting"
        ? "Computing layout"
        : state.status === "parsing"
          ? "Parsing source"
          : "Live preview ready"

  return (
    <footer className="status-bar">
      <span>{nodeCount} nodes</span>
      <span>{groupCount} groups</span>
      <span>{connectionCount} connections</span>
      <span className={`status-pill status-${state.status}`}>{state.status}</span>
      <span className="status-message">{message}</span>
    </footer>
  )
}

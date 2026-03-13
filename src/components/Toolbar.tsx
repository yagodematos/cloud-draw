import { ExamplePicker } from "./ExamplePicker"
import type { ExampleDiagram } from "../examples"
import type { DiagramDirection } from "../core/parser/ast"

function formatDirection(direction: DiagramDirection) {
  return direction === "left-right" ? "Left to right" : "Top to bottom"
}

interface ToolbarProps {
  examples: ExampleDiagram[]
  selectedExample: string
  activeExampleName: string
  direction: DiagramDirection
  onExampleChange: (exampleId: string) => void
  onFit: () => void
}

export function Toolbar({
  examples,
  selectedExample,
  activeExampleName,
  direction,
  onExampleChange,
  onFit,
}: ToolbarProps) {
  const directionLabel = formatDirection(direction)

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <div className="toolbar-mark" aria-hidden="true">
          CD
        </div>
        <div className="toolbar-brand-copy">
          <p className="app-kicker">CloudDSL Studio</p>
          <h1>Architecture diagrams as code</h1>
          <p>
            Author a system map in plain text, then inspect a refined live
            canvas as layout updates in the background.
          </p>
        </div>
      </div>
      <div className="toolbar-actions">
        <div className="toolbar-summary">
          <span className="toolbar-summary-label">Current canvas</span>
          <strong>{activeExampleName}</strong>
          <span className="toolbar-summary-meta">
            Worker layout • {directionLabel}
          </span>
        </div>
        <div className="toolbar-controls">
          <ExamplePicker
            examples={examples}
            value={selectedExample}
            onChange={onExampleChange}
          />
          <div className="toolbar-chip">Direction: {directionLabel}</div>
          <button className="toolbar-button" type="button" onClick={onFit}>
            Fit view
          </button>
        </div>
      </div>
    </header>
  )
}

import { ExamplePicker } from "./ExamplePicker"
import type { ExampleDiagram } from "../examples"
import type { DiagramDirection } from "../core/parser/ast"

interface ToolbarProps {
  examples: ExampleDiagram[]
  selectedExample: string
  direction: DiagramDirection
  onExampleChange: (exampleId: string) => void
  onFit: () => void
}

export function Toolbar({
  examples,
  selectedExample,
  direction,
  onExampleChange,
  onFit
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <p className="app-kicker">CloudDSL</p>
        <div>
          <h1>Architecture diagrams as code</h1>
          <p>Parse immediately, layout in a worker, render in SVG.</p>
        </div>
      </div>
      <div className="toolbar-controls">
        <ExamplePicker examples={examples} value={selectedExample} onChange={onExampleChange} />
        <div className="toolbar-chip">Direction: {direction}</div>
        <button className="toolbar-button" type="button" onClick={onFit}>
          Fit view
        </button>
      </div>
    </header>
  )
}

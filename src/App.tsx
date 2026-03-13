import { useEffect, useState } from "react"
import { CanvasPanel } from "./components/CanvasPanel"
import { EditorPanel } from "./components/EditorPanel"
import { SplitPane } from "./components/SplitPane"
import { StatusBar } from "./components/StatusBar"
import { Toolbar } from "./components/Toolbar"
import { builtInExamples } from "./examples"
import { useDiagram } from "./hooks/useDiagram"
import { usePanZoom } from "./hooks/usePanZoom"

export default function App() {
  const [selectedExample, setSelectedExample] = useState(builtInExamples[0].id)
  const [source, setSource] = useState(builtInExamples[0].source)
  const [pendingAutoFit, setPendingAutoFit] = useState(true)
  const diagram = useDiagram(source)
  const { transform, onPointerDown, onWheel, fitToBounds } = usePanZoom()
  const currentExample =
    builtInExamples.find((example) => example.id === selectedExample) ??
    builtInExamples[0]

  useEffect(() => {
    if (!diagram.layout || !pendingAutoFit) {
      return
    }

    const viewport = document
      .querySelector(".canvas-surface")
      ?.getBoundingClientRect()
    if (viewport) {
      fitToBounds(diagram.layout.bounds, viewport)
      setPendingAutoFit(false)
    }
  }, [diagram.layout, fitToBounds, pendingAutoFit])

  return (
    <div className="app-shell">
      <Toolbar
        examples={builtInExamples}
        selectedExample={selectedExample}
        activeExampleName={currentExample.name}
        direction={diagram.ast?.direction ?? "top-bottom"}
        onExampleChange={(exampleId) => {
          const example = builtInExamples.find(
            (entry) => entry.id === exampleId,
          )
          if (!example) {
            return
          }

          setSelectedExample(example.id)
          setPendingAutoFit(true)
          setSource(example.source)
        }}
        onFit={() => {
          if (!diagram.layout) {
            return
          }

          const viewport = document
            .querySelector(".canvas-surface")
            ?.getBoundingClientRect()
          if (viewport) {
            fitToBounds(diagram.layout.bounds, viewport)
          }
        }}
      />
      <SplitPane
        left={
          <EditorPanel
            value={source}
            parseError={diagram.parseError}
            onChange={setSource}
          />
        }
        right={
          <CanvasPanel
            layout={diagram.layout}
            transform={transform}
            zoom={transform.zoom}
            status={diagram.status}
            runtimeError={diagram.runtimeError}
            onPointerDown={onPointerDown}
            onWheel={onWheel}
          />
        }
      />
      <StatusBar
        nodeCount={diagram.ast?.nodes.length ?? 0}
        groupCount={diagram.ast?.groups.length ?? 0}
        connectionCount={diagram.ast?.connections.length ?? 0}
        exampleName={currentExample.name}
        direction={diagram.ast?.direction ?? "top-bottom"}
        zoom={transform.zoom}
        state={diagram}
      />
    </div>
  )
}

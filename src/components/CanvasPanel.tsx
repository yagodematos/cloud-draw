import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react"
import type { LayoutResult } from "../core/layout/types"
import { SvgRenderer } from "../core/renderer/svg-renderer"
import type { CanvasTransform } from "../hooks/usePanZoom"

interface CanvasPanelProps {
  layout: LayoutResult | null
  transform: CanvasTransform
  zoom: number
  status: "idle" | "parsing" | "layouting" | "ready" | "error"
  runtimeError: string | null
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onWheel: (event: WheelEvent<HTMLElement>) => void
}

export function CanvasPanel({
  layout,
  transform,
  zoom,
  status,
  runtimeError,
  onPointerDown,
  onWheel,
}: CanvasPanelProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<SvgRenderer | null>(null)

  useEffect(() => {
    const renderer = new SvgRenderer()
    rendererRef.current = renderer

    if (canvasRef.current) {
      renderer.mount(canvasRef.current)
    }

    return () => {
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    if (layout && rendererRef.current) {
      rendererRef.current.render(layout)
    }
  }, [layout])

  useEffect(() => {
    rendererRef.current?.setTransform(transform)
  }, [transform])

  return (
    <div className="canvas-panel">
      <div className="panel-title">
        <strong>Interactive canvas</strong>
        <span>
          Drag to pan, scroll to zoom, and use Fit view to recentre the active
          system map.
        </span>
      </div>
      <div
        className="canvas-surface"
        onPointerDown={onPointerDown}
        onWheel={onWheel}
      >
        <div className="canvas-hud canvas-hud-top" aria-hidden="true">
          <div className="canvas-hud-card">
            <span className="canvas-hud-label">Canvas mode</span>
            <strong>{layout ? "Live preview" : "Waiting for layout"}</strong>
          </div>
          <div className="canvas-hud-chip">{Math.round(zoom * 100)}% zoom</div>
        </div>
        <div className="canvas-hud canvas-hud-bottom" aria-hidden="true">
          <div className="canvas-hud-chip">Drag to pan</div>
          <div className="canvas-hud-chip">Wheel to zoom</div>
        </div>
        <div ref={canvasRef} className="canvas-mount" />
        {!layout ? (
          <div className="canvas-placeholder">
            <div className="canvas-empty-card">
              <strong>
                {status === "layouting"
                  ? "Building layout"
                  : "Diagram unavailable"}
              </strong>
              <p>
                {runtimeError ??
                  (status === "parsing"
                    ? "Parsing source before layout."
                    : "Start typing DSL to generate a layout.")}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

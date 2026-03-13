import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react"
import type { LayoutResult } from "../core/layout/types"
import { SvgRenderer } from "../core/renderer/svg-renderer"
import type { CanvasTransform } from "../hooks/usePanZoom"

interface CanvasPanelProps {
  layout: LayoutResult | null
  transform: CanvasTransform
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onWheel: (event: WheelEvent<HTMLElement>) => void
}

export function CanvasPanel({ layout, transform, onPointerDown, onWheel }: CanvasPanelProps) {
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
        <strong>Live diagram</strong>
        <span>Pan with drag. Zoom with the trackpad or mouse wheel.</span>
      </div>
      <div className="canvas-surface" onPointerDown={onPointerDown} onWheel={onWheel}>
        <div ref={canvasRef} className="canvas-mount" />
        {!layout ? (
          <div className="canvas-placeholder">
            <p>Start typing DSL to generate a layout.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent
} from "react"

export interface CanvasTransform {
  x: number
  y: number
  zoom: number
}

export function usePanZoom() {
  const [transform, setTransform] = useState<CanvasTransform>({ x: 48, y: 48, zoom: 1 })
  const dragging = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging.current) {
        return
      }

      const deltaX = event.clientX - lastPoint.current.x
      const deltaY = event.clientY - lastPoint.current.y
      lastPoint.current = { x: event.clientX, y: event.clientY }
      setTransform((current) => ({
        ...current,
        x: current.x + deltaX,
        y: current.y + deltaY
      }))
    }

    const handlePointerUp = () => {
      dragging.current = false
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    dragging.current = true
    lastPoint.current = { x: event.clientX, y: event.clientY }
  }

  const onWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault()

    const zoomFactor = event.deltaY > 0 ? 0.94 : 1.06
    setTransform((current) => ({
      ...current,
      zoom: Math.min(2.4, Math.max(0.35, Number((current.zoom * zoomFactor).toFixed(3))))
    }))
  }

  const fitToBounds = useCallback((bounds: { width: number; height: number }, viewport: DOMRect) => {
    if (bounds.width === 0 || bounds.height === 0) {
      setTransform({ x: 48, y: 48, zoom: 1 })
      return
    }

    const zoom = Math.min(
      (viewport.width - 96) / bounds.width,
      (viewport.height - 96) / bounds.height,
      1
    )

    setTransform({
      x: Math.max(48, (viewport.width - bounds.width * zoom) / 2),
      y: Math.max(48, (viewport.height - bounds.height * zoom) / 2),
      zoom
    })
  }, [])

  return {
    transform,
    setTransform,
    onPointerDown,
    onWheel,
    fitToBounds
  }
}

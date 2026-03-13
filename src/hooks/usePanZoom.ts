import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react"

export interface CanvasTransform {
  x: number
  y: number
  zoom: number
}

export interface ViewBounds {
  x: number
  y: number
  width: number
  height: number
}

export function usePanZoom() {
  const [transform, setTransform] = useState<CanvasTransform>({
    x: 56,
    y: 56,
    zoom: 1,
  })
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
        y: current.y + deltaY,
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
      zoom: Math.min(
        2.4,
        Math.max(0.35, Number((current.zoom * zoomFactor).toFixed(3))),
      ),
    }))
  }

  const fitToBounds = useCallback((bounds: ViewBounds, viewport: DOMRect) => {
    if (bounds.width === 0 || bounds.height === 0) {
      setTransform({ x: 56, y: 56, zoom: 1 })
      return
    }

    const horizontalPadding = viewport.width < 900 ? 40 : 56
    const verticalPadding = viewport.height < 700 ? 40 : 56
    const availableWidth = Math.max(viewport.width - horizontalPadding * 2, 1)
    const availableHeight = Math.max(viewport.height - verticalPadding * 2, 1)
    const zoom = Math.min(
      availableWidth / bounds.width,
      availableHeight / bounds.height,
      1.08,
    )

    setTransform({
      x:
        horizontalPadding +
        (availableWidth - bounds.width * zoom) / 2 -
        bounds.x * zoom,
      y:
        verticalPadding +
        (availableHeight - bounds.height * zoom) / 2 -
        bounds.y * zoom,
      zoom,
    })
  }, [])

  return {
    transform,
    setTransform,
    onPointerDown,
    onWheel,
    fitToBounds,
  }
}

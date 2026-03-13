import { useEffect, useState, type ReactNode } from "react"

interface SplitPaneProps {
  left: ReactNode
  right: ReactNode
}

export function SplitPane({ left, right }: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(430)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      setLeftWidth(Math.max(320, Math.min(620, event.clientX - 24)))
    }

    const handleUp = () => {
      setDragging(false)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [dragging])

  return (
    <div className="split-pane" style={{ gridTemplateColumns: `${leftWidth}px 10px minmax(0, 1fr)` }}>
      <section className="panel panel-editor">{left}</section>
      <div
        aria-hidden="true"
        className="split-pane-handle"
        onPointerDown={() => setDragging(true)}
      />
      <section className="panel panel-canvas">{right}</section>
    </div>
  )
}

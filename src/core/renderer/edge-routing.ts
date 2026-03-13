import type { LayoutEdge } from "../layout/types"

export function pointsToPath(points: LayoutEdge["points"]) {
  if (points.length === 0) {
    return ""
  }

  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(" ")}`
}

export function getEdgeLabelPosition(points: LayoutEdge["points"]) {
  if (points.length === 0) {
    return { x: 0, y: 0 }
  }

  if (points.length === 1) {
    return points[0]
  }

  const middleIndex = Math.floor(points.length / 2)
  const start = points[middleIndex - 1] ?? points[0]
  const end = points[middleIndex] ?? points[points.length - 1]

  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  }
}

import type { LayoutResult } from "./types"

export interface ContentBounds {
  x: number
  y: number
  width: number
  height: number
}

export function getLayoutContentBounds(layout: LayoutResult): ContentBounds {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  const pushPoint = (x: number, y: number) => {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  for (const group of layout.groups) {
    pushPoint(group.x, group.y)
    pushPoint(group.x + group.width, group.y + group.height)
  }

  for (const node of layout.nodes) {
    pushPoint(node.x, node.y)
    pushPoint(node.x + node.width, node.y + node.height)
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return {
      x: 0,
      y: 0,
      width: layout.bounds.width,
      height: layout.bounds.height,
    }
  }

  // Allow some breathing room for edge labels and marker tips.
  const padding = 36

  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}

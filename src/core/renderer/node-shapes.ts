import type { LayoutEdge, LayoutGroup, LayoutNode } from "../layout/types"
import { getEdgeLabelPosition, pointsToPath } from "./edge-routing"
import { createSvgElement, setAttributes, setText } from "./svg-diff"

function createTextLabel(className: string) {
  const text = createSvgElement("text")
  text.classList.add(className)
  text.setAttribute("font-family", "IBM Plex Sans, sans-serif")
  return text
}

export function createGroupElement(group: LayoutGroup) {
  const root = createSvgElement("g")
  root.dataset.id = group.id
  root.classList.add("diagram-group")

  const body = createSvgElement("rect")
  body.classList.add("group-body")
  const header = createSvgElement("rect")
  header.classList.add("group-header")
  const label = createTextLabel("group-label")
  const icon = createSvgElement("image")
  icon.classList.add("group-icon")

  root.append(body, header, icon, label)
  updateGroupElement(root, group)
  return root
}

export function updateGroupElement(root: SVGGElement, group: LayoutGroup) {
  const body = root.querySelector<SVGRectElement>(".group-body")!
  const header = root.querySelector<SVGRectElement>(".group-header")!
  const label = root.querySelector<SVGTextElement>(".group-label")!
  const icon = root.querySelector<SVGImageElement>(".group-icon")!

  setAttributes(root, {
    transform: `translate(${group.x} ${group.y})`
  })

  setAttributes(body, {
    x: 0,
    y: 0,
    width: group.width,
    height: group.height,
    rx: 18,
    ry: 18,
    fill: group.color ?? "var(--canvas-group-fill)",
    stroke: "var(--canvas-group-stroke)",
    "stroke-width": 1.25,
    "stroke-dasharray": group.style === "dashed" ? "7 5" : undefined
  })

  setAttributes(header, {
    x: 0,
    y: 0,
    width: group.width,
    height: 42,
    rx: 18,
    ry: 18,
    fill: "var(--canvas-group-header)"
  })

  setAttributes(icon, {
    x: 14,
    y: 9,
    width: 20,
    height: 20,
    href: root.dataset.iconHref ?? ""
  })

  setAttributes(label, {
    x: 42,
    y: 25,
    "font-size": 12,
    "font-weight": 700,
    fill: "var(--canvas-group-label)"
  })
  setText(label, group.label)
}

export function createNodeElement(node: LayoutNode) {
  const root = createSvgElement("g")
  root.dataset.id = node.id
  root.classList.add("diagram-node")

  const shadow = createSvgElement("rect")
  shadow.classList.add("node-shadow")
  const body = createSvgElement("rect")
  body.classList.add("node-body")
  const icon = createSvgElement("image")
  icon.classList.add("node-icon")
  const label = createTextLabel("node-label")

  root.append(shadow, body, icon, label)
  updateNodeElement(root, node)
  return root
}

export function updateNodeElement(root: SVGGElement, node: LayoutNode) {
  const shadow = root.querySelector<SVGRectElement>(".node-shadow")!
  const body = root.querySelector<SVGRectElement>(".node-body")!
  const icon = root.querySelector<SVGImageElement>(".node-icon")!
  const label = root.querySelector<SVGTextElement>(".node-label")!

  setAttributes(root, {
    transform: `translate(${node.x} ${node.y})`
  })

  setAttributes(shadow, {
    x: 3,
    y: 4,
    width: node.width,
    height: node.height,
    rx: 16,
    ry: 16,
    fill: "var(--canvas-node-shadow)"
  })

  setAttributes(body, {
    x: 0,
    y: 0,
    width: node.width,
    height: node.height,
    rx: 16,
    ry: 16,
    fill: node.color ?? "var(--canvas-node-fill)",
    stroke: "var(--canvas-node-stroke)",
    "stroke-width": 1.5
  })

  setAttributes(icon, {
    x: 14,
    y: 12,
    width: 28,
    height: 28,
    href: root.dataset.iconHref ?? ""
  })

  setAttributes(label, {
    x: 52,
    y: 34,
    "font-size": 13,
    "font-weight": 600,
    fill: "var(--canvas-node-label)"
  })
  setText(label, node.label)
}

export function createEdgeElement(edge: LayoutEdge) {
  const root = createSvgElement("g")
  root.dataset.id = edge.id
  root.classList.add("diagram-edge")

  const path = createSvgElement("path")
  path.classList.add("edge-path")
  const label = createTextLabel("edge-label")
  root.append(path, label)
  updateEdgeElement(root, edge)
  return root
}

export function updateEdgeElement(root: SVGGElement, edge: LayoutEdge) {
  const path = root.querySelector<SVGPathElement>(".edge-path")!
  const label = root.querySelector<SVGTextElement>(".edge-label")!
  const labelPosition = getEdgeLabelPosition(edge.points)

  setAttributes(path, {
    d: pointsToPath(edge.points),
    fill: "none",
    stroke: "var(--canvas-edge)",
    "stroke-width": 2,
    "stroke-dasharray": edge.style === "dashed" ? "8 6" : undefined,
    "marker-end": "url(#arrow-head)",
    "marker-start": edge.direction === "bidirectional" ? "url(#arrow-head)" : undefined
  })

  setAttributes(label, {
    x: labelPosition.x,
    y: labelPosition.y - 8,
    "font-size": 12,
    "text-anchor": "middle",
    fill: "var(--canvas-edge-label)",
    display: edge.label ? "block" : "none"
  })
  setText(label, edge.label ?? "")
}

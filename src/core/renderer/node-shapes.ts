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
    transform: `translate(${group.x} ${group.y})`,
    filter: "url(#group-shadow)",
  })

  setAttributes(body, {
    x: 0,
    y: 0,
    width: group.width,
    height: group.height,
    rx: 26,
    ry: 26,
    fill: group.color ?? "url(#group-surface)",
    stroke: "var(--canvas-group-stroke)",
    "stroke-width": 1.5,
    "stroke-dasharray": group.style === "dashed" ? "10 7" : undefined,
  })

  setAttributes(header, {
    x: 0,
    y: 0,
    width: group.width,
    height: 54,
    rx: 26,
    ry: 26,
    fill: "url(#group-header-surface)",
  })

  setAttributes(icon, {
    x: 18,
    y: 14,
    width: 18,
    height: 18,
    href: root.dataset.iconHref ?? "",
  })

  setAttributes(label, {
    x: 46,
    y: 31,
    "font-size": 13.5,
    "font-weight": 700,
    "letter-spacing": "0.01em",
    fill: "var(--canvas-group-label)",
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
    transform: `translate(${node.x} ${node.y})`,
    filter: "url(#node-shadow)",
  })

  setAttributes(shadow, {
    x: 6,
    y: 8,
    width: node.width,
    height: node.height,
    rx: 20,
    ry: 20,
    fill: "var(--canvas-node-shadow)",
  })

  setAttributes(body, {
    x: 0,
    y: 0,
    width: node.width,
    height: node.height,
    rx: 20,
    ry: 20,
    fill: node.color ?? "url(#node-surface)",
    stroke: "var(--canvas-node-stroke)",
    "stroke-width": 1.5,
  })

  setAttributes(icon, {
    x: 18,
    y: 18,
    width: 24,
    height: 24,
    href: root.dataset.iconHref ?? "",
  })

  setAttributes(label, {
    x: 56,
    y: 39,
    "font-size": 14,
    "font-weight": 600,
    "letter-spacing": "0.01em",
    fill: "var(--canvas-node-label)",
  })
  setText(label, node.label)
}

export function createEdgeElement(edge: LayoutEdge) {
  const root = createSvgElement("g")
  root.dataset.id = edge.id
  root.classList.add("diagram-edge")

  const path = createSvgElement("path")
  path.classList.add("edge-path")
  const labelBack = createSvgElement("rect")
  labelBack.classList.add("edge-label-back")
  const label = createTextLabel("edge-label")
  root.append(path, labelBack, label)
  updateEdgeElement(root, edge)
  return root
}

export function updateEdgeElement(root: SVGGElement, edge: LayoutEdge) {
  const path = root.querySelector<SVGPathElement>(".edge-path")!
  const labelBack = root.querySelector<SVGRectElement>(".edge-label-back")!
  const label = root.querySelector<SVGTextElement>(".edge-label")!
  const labelPosition = getEdgeLabelPosition(edge.points)
  const hasLabel = Boolean(edge.label)
  const labelWidth = Math.max(58, (edge.label?.length ?? 0) * 8.2 + 22)
  const labelHeight = 24

  setAttributes(path, {
    d: pointsToPath(edge.points),
    fill: "none",
    stroke: "var(--canvas-edge)",
    "stroke-width": 2.25,
    "stroke-dasharray": edge.style === "dashed" ? "10 7" : undefined,
    "marker-end": "url(#arrow-head)",
    "marker-start":
      edge.direction === "bidirectional" ? "url(#arrow-head)" : undefined,
  })

  setAttributes(labelBack, {
    x: labelPosition.x - labelWidth / 2,
    y: labelPosition.y - labelHeight - 10,
    width: labelWidth,
    height: labelHeight,
    rx: 12,
    ry: 12,
    fill: "url(#edge-label-surface)",
    stroke: "var(--canvas-edge-label-stroke)",
    "stroke-width": 1,
    display: hasLabel ? "block" : "none",
  })

  setAttributes(label, {
    x: labelPosition.x,
    y: labelPosition.y - 14,
    "font-size": 12,
    "font-weight": 600,
    "text-anchor": "middle",
    fill: "var(--canvas-edge-label)",
    display: hasLabel ? "block" : "none",
  })
  setText(label, edge.label ?? "")
}

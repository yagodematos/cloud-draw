import { IconRegistry } from "../icons/registry"
import type { LayoutEdge, LayoutGroup, LayoutNode, LayoutResult } from "../layout/types"
import {
  createEdgeElement,
  createGroupElement,
  createNodeElement,
  updateEdgeElement,
  updateGroupElement,
  updateNodeElement
} from "./node-shapes"
import { createSvgElement, setAttributes } from "./svg-diff"

interface TransformState {
  x: number
  y: number
  zoom: number
}

function createArrowMarker() {
  const marker = createSvgElement("marker")
  const path = createSvgElement("path")

  setAttributes(marker, {
    id: "arrow-head",
    viewBox: "0 0 10 10",
    refX: 9,
    refY: 5,
    markerWidth: 8,
    markerHeight: 8,
    orient: "auto-start-reverse"
  })

  setAttributes(path, {
    d: "M 0 0 L 10 5 L 0 10 z",
    fill: "var(--canvas-edge)"
  })

  marker.append(path)
  return marker
}

export class SvgRenderer {
  private container: HTMLElement | null = null
  private svg: SVGSVGElement | null = null
  private viewport: SVGGElement | null = null
  private groupLayer: SVGGElement | null = null
  private edgeLayer: SVGGElement | null = null
  private nodeLayer: SVGGElement | null = null
  private iconRegistry = new IconRegistry()
  private groups = new Map<string, SVGGElement>()
  private nodes = new Map<string, SVGGElement>()
  private edges = new Map<string, SVGGElement>()
  private pendingFrame: number | null = null
  private pendingLayout: LayoutResult | null = null
  private currentLayout: LayoutResult | null = null
  private transform: TransformState = { x: 0, y: 0, zoom: 1 }

  mount(container: HTMLElement) {
    this.container = container
    container.replaceChildren()

    const svg = createSvgElement("svg")
    const defs = createSvgElement("defs")
    const viewport = createSvgElement("g")
    const groupLayer = createSvgElement("g")
    const edgeLayer = createSvgElement("g")
    const nodeLayer = createSvgElement("g")

    svg.classList.add("diagram-svg")
    defs.append(createArrowMarker())
    viewport.append(groupLayer, edgeLayer, nodeLayer)
    svg.append(defs, viewport)
    container.append(svg)

    this.svg = svg
    this.viewport = viewport
    this.groupLayer = groupLayer
    this.edgeLayer = edgeLayer
    this.nodeLayer = nodeLayer
    this.applyTransform()
  }

  render(layout: LayoutResult) {
    this.pendingLayout = layout

    if (this.pendingFrame !== null) {
      return
    }

    this.pendingFrame = window.requestAnimationFrame(() => {
      this.pendingFrame = null
      if (!this.pendingLayout) {
        return
      }

      this.flushLayout(this.pendingLayout)
      this.currentLayout = this.pendingLayout
      this.pendingLayout = null
    })
  }

  setTransform(transform: TransformState) {
    this.transform = transform
    this.applyTransform()
  }

  fitToView(viewport: { width: number; height: number }) {
    const layout = this.currentLayout ?? this.pendingLayout
    const bounds = layout?.bounds

    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      this.setTransform({ x: 24, y: 24, zoom: 1 })
      return
    }

    const scale = Math.min(
      (viewport.width - 48) / bounds.width,
      (viewport.height - 48) / bounds.height,
      1
    )

    this.setTransform({
      x: Math.max(24, (viewport.width - bounds.width * scale) / 2),
      y: Math.max(24, (viewport.height - bounds.height * scale) / 2),
      zoom: scale
    })
  }

  destroy() {
    if (this.pendingFrame !== null) {
      window.cancelAnimationFrame(this.pendingFrame)
      this.pendingFrame = null
    }

    this.container?.replaceChildren()
    this.svg = null
    this.viewport = null
    this.groupLayer = null
    this.edgeLayer = null
    this.nodeLayer = null
    this.groups.clear()
    this.nodes.clear()
    this.edges.clear()
  }

  private applyTransform() {
    if (!this.viewport) {
      return
    }

    this.viewport.style.transformOrigin = "0 0"
    this.viewport.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.zoom})`
  }

  private flushLayout(layout: LayoutResult) {
    if (!this.svg || !this.groupLayer || !this.edgeLayer || !this.nodeLayer) {
      return
    }

    setAttributes(this.svg, {
      viewBox: `0 0 ${Math.max(layout.bounds.width, 960)} ${Math.max(layout.bounds.height, 640)}`,
      width: "100%",
      height: "100%"
    })

    this.syncLayer(layout.groups, this.groups, this.groupLayer, createGroupElement, updateGroupElement)
    this.syncLayer(layout.edges, this.edges, this.edgeLayer, createEdgeElement, updateEdgeElement)
    this.syncLayer(layout.nodes, this.nodes, this.nodeLayer, createNodeElement, updateNodeElement)
  }

  private syncLayer<T extends LayoutGroup | LayoutNode | LayoutEdge>(
    entries: T[],
    registry: Map<string, SVGGElement>,
    layer: SVGGElement,
    create: (entry: T) => SVGGElement,
    update: (element: SVGGElement, entry: T) => void
  ) {
    const nextIds = new Set(entries.map((entry) => entry.id))

    for (const entry of entries) {
      let element = registry.get(entry.id)
      if (!element) {
        element = create(entry)
        registry.set(entry.id, element)
        layer.append(element)
      } else {
        update(element, entry)
      }

      if ("icon" in entry) {
        this.applyIcon(element, entry.icon)
      }
    }

    for (const [id, element] of registry) {
      if (nextIds.has(id)) {
        continue
      }

      element.remove()
      registry.delete(id)
    }
  }

  private async applyIcon(element: SVGGElement, name?: string) {
    const key = name ?? "__fallback__"
    if (element.dataset.iconKey === key) {
      return
    }

    element.dataset.iconKey = key
    const iconHref = await this.iconRegistry.get(name)

    if (element.dataset.iconKey !== key) {
      return
    }

    element.dataset.iconHref = iconHref
    const image = element.querySelector<SVGImageElement>("image")
    if (image) {
      image.setAttribute("href", iconHref)
    }
  }
}

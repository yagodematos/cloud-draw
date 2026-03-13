import { describe, expect, it, vi } from "vitest"
import { SvgRenderer } from "../../src/core/renderer/svg-renderer"
import type { LayoutResult } from "../../src/core/layout/types"

const layout: LayoutResult = {
  bounds: { width: 640, height: 480 },
  groups: [
    {
      id: "vpc",
      x: 40,
      y: 40,
      width: 360,
      height: 240,
      label: "VPC",
      style: "dashed"
    }
  ],
  nodes: [
    {
      id: "app",
      x: 80,
      y: 112,
      width: 180,
      height: 56,
      label: "App Server",
      icon: "server"
    }
  ],
  edges: [
    {
      id: "app-db",
      from: "app",
      to: "db",
      style: "solid",
      direction: "forward",
      points: [
        { x: 260, y: 140 },
        { x: 320, y: 140 },
        { x: 320, y: 220 }
      ]
    }
  ]
}

describe("SvgRenderer", () => {
  it("renders and updates stable svg elements", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>'
      })
    )

    const container = document.createElement("div")
    const renderer = new SvgRenderer()
    renderer.mount(container)
    renderer.render(layout)

    await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)))

    const node = container.querySelector<SVGGElement>('.diagram-node[data-id="app"]')
    expect(node).not.toBeNull()

    const updatedLayout: LayoutResult = {
      ...layout,
      nodes: [{ ...layout.nodes[0], x: 120, label: "App API" }],
      edges: []
    }

    renderer.render(updatedLayout)
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)))

    expect(container.querySelectorAll(".diagram-edge")).toHaveLength(0)
    expect(node).toBe(container.querySelector('.diagram-node[data-id="app"]'))
    expect(container.querySelector(".node-label")?.textContent).toBe("App API")
  })
})

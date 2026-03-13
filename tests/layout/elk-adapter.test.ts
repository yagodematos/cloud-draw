import type { ElkNode } from "elkjs/lib/elk-api"
import { describe, expect, it } from "vitest"
import type { Diagram } from "../../src/core/parser/ast"
import { astToElkGraph, extractLayoutResult } from "../../src/core/layout/elk-adapter"

const sampleDiagram: Diagram = {
  direction: "left-right",
  nodes: [
    {
      id: "api-gateway",
      name: "API Gateway",
      icon: "cloud",
      location: {
        start: { offset: 0, line: 1, column: 1 },
        end: { offset: 10, line: 1, column: 11 }
      }
    },
    {
      id: "app-server",
      name: "App Server",
      parent: "vpc",
      icon: "server",
      location: {
        start: { offset: 12, line: 2, column: 1 },
        end: { offset: 20, line: 2, column: 9 }
      }
    }
  ],
  groups: [
    {
      id: "vpc",
      name: "VPC",
      style: "dashed",
      children: [],
      location: {
        start: { offset: 21, line: 3, column: 1 },
        end: { offset: 30, line: 3, column: 10 }
      }
    }
  ],
  connections: [
    {
      id: "api-gateway-app-server",
      from: "api-gateway",
      to: "app-server",
      style: "solid",
      direction: "forward",
      location: {
        start: { offset: 31, line: 4, column: 1 },
        end: { offset: 40, line: 4, column: 10 }
      }
    }
  ]
}

sampleDiagram.groups[0].children.push(sampleDiagram.nodes[1])

describe("astToElkGraph", () => {
  it("creates a compound graph with top-level groups and edges", () => {
    const graph = astToElkGraph(sampleDiagram)

    expect(graph.layoutOptions?.["elk.direction"]).toBe("RIGHT")
    expect(graph.children).toHaveLength(2)
    expect(graph.edges).toHaveLength(1)
    expect(graph.children?.find((child) => child.id === "vpc")?.children).toHaveLength(1)
  })
})

describe("extractLayoutResult", () => {
  it("produces absolute positions for nested children and edge routes", () => {
    const laidOutGraph: ElkNode = {
      id: "root",
      width: 800,
      height: 600,
      children: [
        {
          id: "vpc",
          x: 40,
          y: 60,
          width: 400,
          height: 280,
          children: [
            {
              id: "app-server",
              x: 32,
              y: 56,
              width: 180,
              height: 56
            }
          ]
        },
        {
          id: "api-gateway",
          x: 420,
          y: 80,
          width: 170,
          height: 56
        }
      ],
      edges: [
        {
          id: "api-gateway-app-server",
          sources: ["api-gateway"],
          targets: ["app-server"],
          sections: [
            {
              id: "section-1",
              startPoint: { x: 420, y: 108 },
              bendPoints: [{ x: 320, y: 108 }],
              endPoint: { x: 72, y: 116 }
            }
          ]
        }
      ]
    }

    const result = extractLayoutResult(sampleDiagram, laidOutGraph)

    expect(result.bounds).toEqual({ width: 800, height: 600 })
    expect(result.groups[0]).toMatchObject({ id: "vpc", x: 40, y: 60 })
    expect(result.nodes.find((node) => node.id === "app-server")).toMatchObject({
      x: 72,
      y: 116
    })
    expect(result.edges[0].points).toHaveLength(3)
  })
})

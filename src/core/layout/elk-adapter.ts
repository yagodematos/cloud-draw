import ELK from "elkjs/lib/elk.bundled.js"
import type { ElkExtendedEdge, ElkNode, ElkPoint } from "elkjs/lib/elk-api"
import type { Connection, Diagram, Group, Node } from "../parser/ast"
import type { LayoutEdge, LayoutGroup, LayoutNode, LayoutResult } from "./types"

const NODE_HEIGHT = 64
const NODE_MIN_WIDTH = 164
const GROUP_MIN_WIDTH = 264
const GROUP_MIN_HEIGHT = 188
const CHARACTER_WIDTH = 7.8

const ROOT_LAYOUT_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.spacing.nodeNodeBetweenLayers": "78",
  "elk.layered.spacing.edgeNodeBetweenLayers": "40",
  "elk.spacing.componentComponent": "64",
  "elk.spacing.nodeNode": "30",
} as const

const GROUP_PADDING = "[top=64,left=28,bottom=28,right=28]"

interface EntityLookup {
  nodes: Map<string, Node>
  groups: Map<string, Group>
  connections: Map<string, Connection>
}

function measureNodeWidth(label: string) {
  return Math.max(
    NODE_MIN_WIDTH,
    Math.round(80 + label.length * CHARACTER_WIDTH),
  )
}

function directionToElk(direction: Diagram["direction"]) {
  return direction === "left-right" ? "RIGHT" : "DOWN"
}

function buildLookup(ast: Diagram): EntityLookup {
  return {
    nodes: new Map(ast.nodes.map((node) => [node.id, node])),
    groups: new Map(ast.groups.map((group) => [group.id, group])),
    connections: new Map(
      ast.connections.map((connection) => [connection.id, connection]),
    ),
  }
}

function buildGroupChildren(group: Group): ElkNode[] {
  return group.children.map((child) => {
    if ("children" in child) {
      return buildGroupNode(child)
    }

    return {
      id: child.id,
      width: measureNodeWidth(child.label ?? child.name),
      height: NODE_HEIGHT,
    }
  })
}

function buildGroupNode(group: Group): ElkNode {
  return {
    id: group.id,
    width: GROUP_MIN_WIDTH,
    height: GROUP_MIN_HEIGHT,
    layoutOptions: {
      "elk.padding": GROUP_PADDING,
    },
    children: buildGroupChildren(group),
  }
}

export function astToElkGraph(ast: Diagram): ElkNode {
  const topLevelNodes = ast.nodes
    .filter((node) => !node.parent)
    .map<ElkNode>((node) => ({
      id: node.id,
      width: measureNodeWidth(node.label ?? node.name),
      height: NODE_HEIGHT,
    }))

  const topLevelGroups = ast.groups
    .filter((group) => !group.parent)
    .map(buildGroupNode)

  const edges: ElkExtendedEdge[] = ast.connections.map((connection) => ({
    id: connection.id,
    sources: [connection.from],
    targets: [connection.to],
    labels: connection.label
      ? [
          {
            text: connection.label,
            width: Math.max(60, Math.round(connection.label.length * 8.5)),
            height: 22,
          },
        ]
      : undefined,
  }))

  return {
    id: "root",
    layoutOptions: {
      ...ROOT_LAYOUT_OPTIONS,
      "elk.direction": directionToElk(ast.direction),
    },
    children: [...topLevelGroups, ...topLevelNodes],
    edges,
  }
}

function collectPoints(edge: ElkExtendedEdge) {
  const points: ElkPoint[] = []

  for (const section of edge.sections ?? []) {
    points.push(section.startPoint)
    for (const point of section.bendPoints ?? []) {
      points.push(point)
    }
    points.push(section.endPoint)
  }

  return points.filter((point, index) => {
    const previous = points[index - 1]
    return !previous || previous.x !== point.x || previous.y !== point.y
  })
}

interface LayoutBox {
  x: number
  y: number
  width: number
  height: number
}

function routeFallbackEdge(from: LayoutBox, to: LayoutBox): ElkPoint[] {
  const fromCenterX = from.x + from.width / 2
  const fromCenterY = from.y + from.height / 2
  const toCenterX = to.x + to.width / 2
  const toCenterY = to.y + to.height / 2
  const deltaX = toCenterX - fromCenterX
  const deltaY = toCenterY - fromCenterY

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    const startX = deltaX >= 0 ? from.x + from.width : from.x
    const endX = deltaX >= 0 ? to.x : to.x + to.width
    const midX = (startX + endX) / 2

    return [
      { x: startX, y: fromCenterY },
      { x: midX, y: fromCenterY },
      { x: midX, y: toCenterY },
      { x: endX, y: toCenterY },
    ]
  }

  const startY = deltaY >= 0 ? from.y + from.height : from.y
  const endY = deltaY >= 0 ? to.y : to.y + to.height
  const midY = (startY + endY) / 2

  return [
    { x: fromCenterX, y: startY },
    { x: fromCenterX, y: midY },
    { x: toCenterX, y: midY },
    { x: toCenterX, y: endY },
  ]
}

function compactPoints(points: ElkPoint[]) {
  return points.filter((point, index) => {
    const previous = points[index - 1]
    const next = points[index + 1]

    if (!previous || !next) {
      return true
    }

    const isVertical = previous.x === point.x && point.x === next.x
    const isHorizontal = previous.y === point.y && point.y === next.y
    return !isVertical && !isHorizontal
  })
}

function pushAbsoluteNodes(
  node: ElkNode,
  offsetX: number,
  offsetY: number,
  lookup: EntityLookup,
  nodes: LayoutNode[],
  groups: LayoutGroup[],
) {
  const x = (node.x ?? 0) + offsetX
  const y = (node.y ?? 0) + offsetY
  const groupMeta = lookup.groups.get(node.id)

  if (groupMeta) {
    groups.push({
      id: groupMeta.id,
      x,
      y,
      width: node.width ?? GROUP_MIN_WIDTH,
      height: node.height ?? GROUP_MIN_HEIGHT,
      label: groupMeta.label ?? groupMeta.name,
      icon: groupMeta.icon,
      color: groupMeta.color,
      style: groupMeta.style,
    })
  }

  const nodeMeta = lookup.nodes.get(node.id)
  if (nodeMeta) {
    nodes.push({
      id: nodeMeta.id,
      x,
      y,
      width: node.width ?? measureNodeWidth(nodeMeta.label ?? nodeMeta.name),
      height: node.height ?? NODE_HEIGHT,
      label: nodeMeta.label ?? nodeMeta.name,
      icon: nodeMeta.icon,
      color: nodeMeta.color,
    })
  }

  for (const child of node.children ?? []) {
    pushAbsoluteNodes(child, x, y, lookup, nodes, groups)
  }
}

export function extractLayoutResult(
  ast: Diagram,
  laidOutGraph: ElkNode,
): LayoutResult {
  const lookup = buildLookup(ast)
  const nodes: LayoutNode[] = []
  const groups: LayoutGroup[] = []

  for (const child of laidOutGraph.children ?? []) {
    pushAbsoluteNodes(child, 0, 0, lookup, nodes, groups)
  }

  const boundsByIdEntries: Array<readonly [string, LayoutBox]> = [
    ...groups.map((group): readonly [string, LayoutBox] => [group.id, group]),
    ...nodes.map((node): readonly [string, LayoutBox] => [node.id, node]),
  ]
  const boundsById = new Map<string, LayoutBox>(boundsByIdEntries)

  const edges = (laidOutGraph.edges ?? []).reduce<LayoutEdge[]>(
    (accumulator, edge) => {
      const connection = lookup.connections.get(edge.id ?? "")
      if (!connection) {
        return accumulator
      }

      const source = boundsById.get(connection.from)
      const target = boundsById.get(connection.to)
      const elkPoints = collectPoints(edge)
      const points =
        connection.direction === "bidirectional"
          ? source && target
            ? routeFallbackEdge(source, target)
            : elkPoints
          : elkPoints.length >= 2
            ? elkPoints
            : source && target
              ? routeFallbackEdge(source, target)
              : elkPoints

      if (points.length < 2) {
        return accumulator
      }

      accumulator.push({
        id: connection.id,
        from: connection.from,
        to: connection.to,
        label: connection.label,
        points: compactPoints(points),
        style: connection.style,
        direction: connection.direction,
      })

      return accumulator
    },
    [],
  )

  return {
    bounds: {
      width: laidOutGraph.width ?? 0,
      height: laidOutGraph.height ?? 0,
    },
    nodes,
    groups,
    edges,
  }
}

export async function computeLayout(
  ast: Diagram,
  elk = new ELK(),
): Promise<LayoutResult> {
  const graph = astToElkGraph(ast)
  const laidOutGraph = await elk.layout(graph)
  return extractLayoutResult(ast, laidOutGraph)
}

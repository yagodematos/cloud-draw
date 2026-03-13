import type {
  Connection,
  Diagram,
  DiagramDirection,
  Group,
  GroupStyle,
  Node,
  RawConnectionStatement,
  RawDiagramDocument,
  RawGroupStatement,
  RawNodeStatement,
  RawStatement
} from "./ast"
import { createStableId } from "../../utils/id"
import { parse as parseGeneratedDocument } from "./generated-parser"
import { DiagramParseError, toParseError, type ParseError } from "./parse-error"

export type ParseSuccess = { ok: true; ast: Diagram }
export type ParseFailure = { ok: false; error: ParseError }
export type ParseResult = ParseSuccess | ParseFailure

type NamedEntity = Node | Group

const NODE_PROPS = new Set(["icon", "color", "label"])
const GROUP_PROPS = new Set(["icon", "color", "label", "style"])

function assertAllowedProps(
  props: Record<string, string>,
  allowed: Set<string>,
  kind: "node" | "group",
  name: string,
  location: Node["location"]
) {
  for (const key of Object.keys(props)) {
    if (!allowed.has(key)) {
      throw new DiagramParseError(`Unknown ${kind} property "${key}" on "${name}"`, location)
    }
  }
}

function buildNode(statement: RawNodeStatement, usedIds: Set<string>, parent?: string): Node {
  assertAllowedProps(statement.props, NODE_PROPS, "node", statement.name, statement.location)

  return {
    id: createStableId(statement.name, usedIds),
    name: statement.name,
    label: statement.props.label,
    icon: statement.props.icon,
    color: statement.props.color,
    parent,
    location: statement.location
  }
}

function buildGroup(statement: RawGroupStatement, usedIds: Set<string>, parent?: string): Group {
  assertAllowedProps(statement.props, GROUP_PROPS, "group", statement.name, statement.location)

  const style = statement.props.style as GroupStyle | undefined
  if (style && style !== "solid" && style !== "dashed") {
    throw new DiagramParseError(
      `Group "${statement.name}" has invalid style "${statement.props.style}"`,
      statement.location
    )
  }

  return {
    id: createStableId(statement.name, usedIds),
    name: statement.name,
    label: statement.props.label,
    icon: statement.props.icon,
    color: statement.props.color,
    style,
    parent,
    children: [],
    location: statement.location
  }
}

function normalizeDocument(document: RawDiagramDocument): Diagram {
  const nodes: Node[] = []
  const groups: Group[] = []
  const connections: Connection[] = []
  const pendingConnections: RawConnectionStatement[] = []
  const namedEntities = new Map<string, NamedEntity>()
  const usedIds = new Set<string>()
  let direction: DiagramDirection = "top-bottom"
  let directionSet = false

  const registerEntity = (entity: NamedEntity) => {
    if (namedEntities.has(entity.name)) {
      throw new DiagramParseError(`Duplicate entity name "${entity.name}"`, entity.location)
    }

    namedEntities.set(entity.name, entity)
  }

  const visitStatements = (statements: RawStatement[], parent?: Group) => {
    for (const statement of statements) {
      if (statement.kind === "setting") {
        if (statement.key === "direction") {
          if (directionSet) {
            throw new DiagramParseError("Direction can only be declared once", statement.location)
          }

          directionSet = true
          direction = statement.value
        }
        continue
      }

      if (statement.kind === "connection") {
        pendingConnections.push(statement)
        continue
      }

      if (statement.kind === "node") {
        const node = buildNode(statement, usedIds, parent?.id)
        nodes.push(node)
        registerEntity(node)
        parent?.children.push(node)
        continue
      }

      const group = buildGroup(statement, usedIds, parent?.id)
      groups.push(group)
      registerEntity(group)
      parent?.children.push(group)
      visitStatements(statement.children, group)
    }
  }

  visitStatements(document.statements)

  for (const statement of pendingConnections) {
    const from = namedEntities.get(statement.fromName)
    const to = namedEntities.get(statement.toName)

    if (!from) {
      throw new DiagramParseError(`Unknown connection source "${statement.fromName}"`, statement.location)
    }

    if (!to) {
      throw new DiagramParseError(`Unknown connection target "${statement.toName}"`, statement.location)
    }

    connections.push({
      id: createStableId(`${statement.fromName}-${statement.toName}`, usedIds),
      from: from.id,
      to: to.id,
      label: statement.label,
      style: statement.style,
      direction: statement.direction,
      location: statement.location
    })
  }

  return {
    direction,
    nodes,
    groups,
    connections
  }
}

export function parse(source: string): ParseResult {
  try {
    const document = parseGeneratedDocument(source, undefined) as RawDiagramDocument
    return {
      ok: true,
      ast: normalizeDocument(document)
    }
  } catch (error) {
    if (error instanceof DiagramParseError) {
      return {
        ok: false,
        error: toParseError(error.message, error.location)
      }
    }

    const location = (error as { location?: Node["location"] }).location
    if (location) {
      return {
        ok: false,
        error: toParseError((error as Error).message, location)
      }
    }

    return {
      ok: false,
      error: {
        message: (error as Error).message,
        line: 1,
        column: 1,
        offset: 0
      }
    }
  }
}

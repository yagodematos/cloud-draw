import { describe, expect, it } from "vitest"
import { parse } from "../../src/core/parser"

describe("parse", () => {
  it("parses nodes, groups, and connections", () => {
    const source = `
direction: left-right

API Gateway [icon: cloud, color: blue]
VPC [style: dashed] {
  App Server [icon: server]
  Database [icon: database]
}

API Gateway > App Server: routes
App Server --> Database
`

    const result = parse(source)

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.ast.direction).toBe("left-right")
    expect(result.ast.nodes).toHaveLength(3)
    expect(result.ast.groups).toHaveLength(1)
    expect(result.ast.connections).toHaveLength(2)
    expect(result.ast.groups[0].children).toHaveLength(2)
  })

  it("rejects unknown properties", () => {
    const result = parse("API Gateway [size: xl]")

    expect(result.ok).toBe(false)
    if (result.ok) {
      return
    }

    expect(result.error.message).toContain('Unknown node property "size"')
  })

  it("reports unknown connection targets", () => {
    const result = parse("API Gateway\nAPI Gateway > Missing Service")

    expect(result.ok).toBe(false)
    if (result.ok) {
      return
    }

    expect(result.error.message).toContain('Unknown connection target "Missing Service"')
  })

  it("reports syntax locations", () => {
    const result = parse("VPC {\n  App Server\n")

    expect(result.ok).toBe(false)
    if (result.ok) {
      return
    }

    expect(result.error.line).toBeGreaterThan(0)
    expect(result.error.column).toBeGreaterThan(0)
  })
})

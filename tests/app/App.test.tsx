import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import App from "../../src/App"
import type { Diagram } from "../../src/core/parser/ast"
import type { LayoutResult } from "../../src/core/layout/types"

vi.mock("@uiw/react-codemirror", () => {
  return {
    __esModule: true,
    EditorView: {
      decorations: {
        of: (value: unknown) => value,
      },
      lineWrapping: {},
      theme: () => ({}),
    },
    Decoration: {
      mark: () => ({ range: () => ({}) }),
      line: () => ({ range: () => ({}) }),
      set: (ranges: unknown[]) => ranges,
    },
    default: ({
      value,
      onChange,
    }: {
      value: string
      onChange: (value: string) => void
    }) => (
      <textarea
        aria-label="dsl-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  }
})

function createLayout(ast: Diagram): LayoutResult {
  return {
    bounds: { width: 960, height: 640 },
    nodes: ast.nodes.map((node, index) => ({
      id: node.id,
      x: 80 + index * 40,
      y: 120 + index * 32,
      width: 180,
      height: 56,
      label: node.label ?? node.name,
      icon: node.icon,
      color: node.color,
    })),
    groups: ast.groups.map((group, index) => ({
      id: group.id,
      x: 40 + index * 32,
      y: 60 + index * 20,
      width: 360,
      height: 220,
      label: group.label ?? group.name,
      icon: group.icon,
      color: group.color,
      style: group.style,
    })),
    edges: ast.connections.map((connection, index) => ({
      id: connection.id,
      from: connection.from,
      to: connection.to,
      label: connection.label,
      style: connection.style,
      direction: connection.direction,
      points: [
        { x: 220 + index * 18, y: 160 + index * 10 },
        { x: 320 + index * 18, y: 160 + index * 10 },
      ],
    })),
  }
}

vi.mock("../../src/core/layout/layout-bridge", async () => {
  return {
    LayoutBridge: class MockLayoutBridge {
      onResult?: (result: LayoutResult) => void
      onError?: (error: Error) => void

      requestLayout(ast: Diagram) {
        queueMicrotask(() => {
          this.onResult?.(createLayout(ast))
        })
      }

      terminate() {
        return undefined
      }
    },
  }
})

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>',
      }),
    )

    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value() {
        return {
          width: 1280,
          height: 720,
          top: 0,
          left: 0,
          right: 1280,
          bottom: 720,
          x: 0,
          y: 0,
          toJSON() {
            return {}
          },
        }
      },
    })
  })

  it("loads the default example and updates counts when switching examples", async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText("6 nodes")).toBeInTheDocument()
      expect(screen.getByLabelText("1 groups")).toBeInTheDocument()
      expect(screen.getByLabelText("5 connections")).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByRole("combobox"), "microservices")

    await waitFor(() => {
      expect(screen.getByLabelText("5 nodes")).toBeInTheDocument()
      expect(screen.getByLabelText("1 groups")).toBeInTheDocument()
      expect(screen.getByLabelText("6 connections")).toBeInTheDocument()
    })
  })

  it("shows parse errors while preserving the last valid counts", async () => {
    render(<App />)

    const editor = screen.getByLabelText("dsl-editor")
    fireEvent.change(editor, { target: { value: "Broken {" } })

    await waitFor(() => {
      expect(
        screen.getByText(/Unexpected brace in statement/),
      ).toBeInTheDocument()
      expect(screen.getByLabelText("6 nodes")).toBeInTheDocument()
    })
  })
})

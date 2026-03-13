import { describe, expect, it, vi } from "vitest"
import type { Diagram } from "../../src/core/parser/ast"
import { LayoutBridge } from "../../src/core/layout/layout-bridge"

const sampleDiagram: Diagram = {
  direction: "top-bottom",
  nodes: [],
  groups: [],
  connections: []
}

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  messages: unknown[] = []

  postMessage(message: unknown) {
    this.messages.push(message)
  }

  terminate() {
    return undefined
  }
}

describe("LayoutBridge", () => {
  it("debounces requests and only posts the latest payload", () => {
    vi.useFakeTimers()
    const worker = new FakeWorker()
    const bridge = new LayoutBridge({
      debounceMs: 80,
      workerFactory: () => worker as unknown as Worker
    })

    bridge.requestLayout(sampleDiagram)
    bridge.requestLayout(sampleDiagram)

    expect(worker.messages).toHaveLength(0)

    vi.advanceTimersByTime(80)

    expect(worker.messages).toHaveLength(1)
    expect(worker.messages[0]).toMatchObject({ type: "layout", id: 2 })

    bridge.terminate()
    vi.useRealTimers()
  })

  it("ignores stale worker results", () => {
    const worker = new FakeWorker()
    const bridge = new LayoutBridge({
      debounceMs: 0,
      workerFactory: () => worker as unknown as Worker
    })

    const onResult = vi.fn()
    bridge.onResult = onResult

    bridge.requestLayout(sampleDiagram)
    worker.onmessage?.({
      data: {
        type: "layout-result",
        id: 999,
        layout: { bounds: { width: 0, height: 0 }, nodes: [], groups: [], edges: [] }
      }
    } as MessageEvent)

    worker.onmessage?.({
      data: {
        type: "layout-result",
        id: 1,
        layout: { bounds: { width: 10, height: 10 }, nodes: [], groups: [], edges: [] }
      }
    } as MessageEvent)

    expect(onResult).toHaveBeenCalledTimes(1)
    expect(onResult).toHaveBeenCalledWith({
      bounds: { width: 10, height: 10 },
      nodes: [],
      groups: [],
      edges: []
    })

    bridge.terminate()
  })
})

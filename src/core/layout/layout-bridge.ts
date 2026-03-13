import type { Diagram } from "../parser/ast"
import type { LayoutResult, LayoutWorkerRequest, LayoutWorkerResponse } from "./types"

type LayoutWorker = Pick<Worker, "postMessage" | "terminate" | "onmessage" | "onerror">

interface LayoutBridgeOptions {
  workerFactory?: () => Worker
  debounceMs?: number
  computeLayout?: (ast: Diagram) => Promise<LayoutResult>
}

export class LayoutBridge {
  private worker: LayoutWorker | null = null
  private debounceMs: number
  private timeoutId: number | null = null
  private currentRequestId = 0
  private computeLayout: (ast: Diagram) => Promise<LayoutResult>
  private latestAst: Diagram | null = null

  onResult?: (result: LayoutResult) => void
  onError?: (error: Error) => void

  constructor(options: LayoutBridgeOptions = {}) {
    const workerFactory = options.workerFactory
    this.computeLayout =
      options.computeLayout ??
      (async (ast) => {
        const { computeLayout } = await import("./elk-adapter")
        return computeLayout(ast)
      })
    this.debounceMs = options.debounceMs ?? 80

    try {
      const createWorker =
        workerFactory ??
        (() => new Worker(new URL("./layout-worker.ts", import.meta.url), { type: "module" }))

      this.worker = createWorker()
    } catch {
      this.worker = null
      return
    }

    this.worker.onmessage = (event: MessageEvent<LayoutWorkerResponse>) => {
      const message = event.data

      if (message.id !== this.currentRequestId) {
        return
      }

      if (message.type === "layout-error") {
        void this.runFallback(message.id, message.error)
        return
      }

      this.onResult?.(message.layout)
    }

    this.worker.onerror = (event: Event | string) => {
      const message =
        typeof event === "string"
          ? event
          : event instanceof ErrorEvent
            ? event.message
            : "Unknown worker error"
      void this.runFallback(this.currentRequestId, message)
    }
  }

  requestLayout(ast: Diagram) {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
    }

    const id = this.currentRequestId + 1
    this.currentRequestId = id
    this.latestAst = ast
    this.timeoutId = window.setTimeout(() => {
      if (!this.worker) {
        void this.runLayoutComputation(id, ast)
        this.timeoutId = null
        return
      }

      const message: LayoutWorkerRequest = {
        type: "layout",
        id,
        ast
      }
      this.worker.postMessage(message)
      this.timeoutId = null
    }, this.debounceMs)
  }

  terminate() {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    this.worker?.terminate()
  }

  private async runFallback(id: number, originalError: string) {
    try {
      await this.runLayoutComputation(id)
    } catch (error) {
      this.onError?.(
        new Error(
          `${originalError}. Fallback layout also failed: ${
            error instanceof Error ? error.message : "Unknown fallback error"
          }`
        )
      )
    }
  }

  private async runLayoutComputation(id: number, astOverride?: Diagram) {
    const ast = astOverride ?? this.latestAst
    if (!ast) {
      return
    }

    try {
      const layout = await this.computeLayout(ast)
      if (id !== this.currentRequestId) {
        return
      }

      this.onResult?.(layout)
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error("Layout failed"))
    }
  }
}

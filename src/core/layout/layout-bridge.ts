import type { Diagram } from "../parser/ast"
import type { LayoutResult, LayoutWorkerRequest, LayoutWorkerResponse } from "./types"

type LayoutWorker = Pick<Worker, "postMessage" | "terminate" | "onmessage" | "onerror">

interface LayoutBridgeOptions {
  workerFactory?: () => Worker
  debounceMs?: number
}

export class LayoutBridge {
  private worker: LayoutWorker
  private debounceMs: number
  private timeoutId: number | null = null
  private currentRequestId = 0

  onResult?: (result: LayoutResult) => void
  onError?: (error: Error) => void

  constructor(options: LayoutBridgeOptions = {}) {
    const workerFactory =
      options.workerFactory ??
      (() => new Worker(new URL("./layout-worker.ts", import.meta.url), { type: "module" }))

    this.worker = workerFactory()
    this.debounceMs = options.debounceMs ?? 80

    this.worker.onmessage = (event: MessageEvent<LayoutWorkerResponse>) => {
      const message = event.data

      if (message.id !== this.currentRequestId) {
        return
      }

      if (message.type === "layout-error") {
        this.onError?.(new Error(message.error))
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
      this.onError?.(new Error(message))
    }
  }

  requestLayout(ast: Diagram) {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
    }

    const id = this.currentRequestId + 1
    this.currentRequestId = id
    this.timeoutId = window.setTimeout(() => {
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

    this.worker.terminate()
  }
}

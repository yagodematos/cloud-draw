/// <reference lib="webworker" />

import { computeLayout } from "./elk-adapter"
import type { LayoutWorkerRequest, LayoutWorkerResponse } from "./types"

declare const self: DedicatedWorkerGlobalScope

self.onmessage = async (event: MessageEvent<LayoutWorkerRequest>) => {
  const message = event.data
  if (message.type !== "layout") {
    return
  }

  try {
    const layout = await computeLayout(message.ast)
    const response: LayoutWorkerResponse = {
      type: "layout-result",
      id: message.id,
      layout
    }
    self.postMessage(response)
  } catch (error) {
    const response: LayoutWorkerResponse = {
      type: "layout-error",
      id: message.id,
      error: error instanceof Error ? error.message : "Unknown layout error"
    }
    self.postMessage(response)
  }
}

export {}

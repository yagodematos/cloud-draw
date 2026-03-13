import { useEffect, useState } from "react"
import { LayoutBridge } from "../core/layout/layout-bridge"
import type { LayoutResult } from "../core/layout/types"
import { parse } from "../core/parser"
import type { Diagram } from "../core/parser/ast"
import type { ParseError } from "../core/parser/parse-error"

export interface UseDiagramResult {
  ast: Diagram | null
  layout: LayoutResult | null
  parseError: ParseError | null
  runtimeError: string | null
  status: "idle" | "parsing" | "layouting" | "ready" | "error"
}

export function useDiagram(source: string): UseDiagramResult {
  const [bridge, setBridge] = useState<LayoutBridge | null>(null)
  const [ast, setAst] = useState<Diagram | null>(null)
  const [layout, setLayout] = useState<LayoutResult | null>(null)
  const [parseError, setParseError] = useState<ParseError | null>(null)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [status, setStatus] = useState<UseDiagramResult["status"]>("idle")

  useEffect(() => {
    const nextBridge = new LayoutBridge()
    nextBridge.onResult = (result) => {
      setLayout(result)
      setRuntimeError(null)
      setStatus("ready")
    }
    nextBridge.onError = (error) => {
      setRuntimeError(error.message)
      setStatus("error")
    }

    setBridge(nextBridge)
    return () => {
      nextBridge.terminate()
      setBridge(null)
    }
  }, [])

  useEffect(() => {
    setStatus("parsing")
    const result = parse(source)
    if (!result.ok) {
      setParseError(result.error)
      setRuntimeError(null)
      setStatus("error")
      return
    }

    setParseError(null)
    setRuntimeError(null)
    setAst(result.ast)

    if (!bridge) {
      return
    }

    setStatus("layouting")
    bridge.requestLayout(result.ast)
  }, [bridge, source])

  return { ast, layout, parseError, runtimeError, status }
}

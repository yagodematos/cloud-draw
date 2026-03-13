import { fallbackIconSvg } from "./fallback"
import { genericIconManifest } from "./manifest"

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export class IconRegistry {
  private cache = new Map<string, string>()
  private loading = new Map<string, Promise<string>>()

  async get(name?: string) {
    if (!name) {
      return svgToDataUri(fallbackIconSvg)
    }

    const existing = this.cache.get(name)
    if (existing) {
      return existing
    }

    const inFlight = this.loading.get(name)
    if (inFlight) {
      return inFlight
    }

    const request = this.fetchIcon(name)
    this.loading.set(name, request)
    const icon = await request
    this.cache.set(name, icon)
    this.loading.delete(name)
    return icon
  }

  private async fetchIcon(name: string) {
    const path = genericIconManifest[name]
    if (!path) {
      return svgToDataUri(fallbackIconSvg)
    }

    const base = import.meta.env.BASE_URL ?? "/"
    const absoluteUrl = new URL(`${base}${path}`, window.location.origin).toString()

    try {
      const response = await fetch(absoluteUrl)
      if (!response.ok) {
        return svgToDataUri(fallbackIconSvg)
      }

      return svgToDataUri(await response.text())
    } catch {
      return svgToDataUri(fallbackIconSvg)
    }
  }
}

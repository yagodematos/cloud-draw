export const SVG_NS = "http://www.w3.org/2000/svg"

export function createSvgElement<K extends keyof SVGElementTagNameMap>(tag: K) {
  return document.createElementNS(SVG_NS, tag)
}

export function setAttributes(
  element: Element,
  attributes: Record<string, string | number | undefined | null>
) {
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) {
      element.removeAttribute(key)
      continue
    }

    element.setAttribute(key, String(value))
  }
}

export function setText(element: Element, value: string) {
  if (element.textContent !== value) {
    element.textContent = value
  }
}

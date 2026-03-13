export function slugifyName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createStableId(name: string, usedIds: Set<string>) {
  const base = slugifyName(name) || "item"

  if (!usedIds.has(base)) {
    usedIds.add(base)
    return base
  }

  let counter = 2
  while (usedIds.has(`${base}-${counter}`)) {
    counter += 1
  }

  const uniqueId = `${base}-${counter}`
  usedIds.add(uniqueId)
  return uniqueId
}

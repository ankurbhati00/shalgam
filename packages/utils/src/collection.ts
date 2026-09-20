export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function groupBy<T, K extends PropertyKey>(
  items: Iterable<T>,
  keyOf: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    const bucket = groups.get(key)
    if (bucket) bucket.push(item)
    else groups.set(key, [item])
  }
  return groups
}

export function uniqueBy<T>(items: Iterable<T>, keyOf: (item: T) => unknown): T[] {
  const seen = new Set<unknown>()
  const result: T[] = []
  for (const item of items) {
    const key = keyOf(item)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [items.slice()]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

/** Exhaustiveness helper for switch statements over unions. */
export function assertNever(value: never, message = `Unexpected value: ${String(value)}`): never {
  throw new Error(message)
}

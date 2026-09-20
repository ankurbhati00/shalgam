export type QueryParamValue =
  string | number | boolean | null | undefined | Date | Array<string | number | boolean>

export type QueryParams = Record<string, QueryParamValue>

/**
 * Serializes params into a query string. Arrays become repeated keys
 * (`status=placed&status=packed`), dates become ISO strings, and empty values are omitted.
 */
export function buildQueryString(params: QueryParams | undefined): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item))
      continue
    }
    if (value instanceof Date) {
      search.set(key, value.toISOString())
      continue
    }
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

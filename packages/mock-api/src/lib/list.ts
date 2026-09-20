import type { Paginated, SortOrder } from '@shalgam/types'

export interface ParsedListParams {
  page: number
  pageSize: number
  sort: string | null
  order: SortOrder
  q: string
}

export function parseListParams(
  url: URL,
  defaults: { pageSize?: number; sort?: string; order?: SortOrder } = {},
): ParsedListParams {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? defaults.pageSize ?? 20) || 20),
  )
  const sort = url.searchParams.get('sort') ?? defaults.sort ?? null
  const orderParam = url.searchParams.get('order')
  const order: SortOrder =
    orderParam === 'asc' || orderParam === 'desc' ? orderParam : (defaults.order ?? 'desc')
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  return { page, pageSize, sort, order, q }
}

/** Reads a repeated query key (`status=a&status=b`) or a comma-separated one (`status=a,b`). */
export function getAll(url: URL, key: string): string[] {
  return url.searchParams
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)
}

export function getBoolean(url: URL, key: string): boolean | undefined {
  const value = url.searchParams.get(key)
  if (value === null) return undefined
  return value === 'true' || value === '1'
}

export function getNumber(url: URL, key: string): number | undefined {
  const value = url.searchParams.get(key)
  if (value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    meta: { page: safePage, pageSize, total, totalPages },
  }
}

type SortValue = string | number | boolean | null | undefined

/** Sorts by an accessor map so handlers only expose sortable fields they mean to. */
export function sortItems<T>(
  items: T[],
  sort: string | null,
  order: SortOrder,
  accessors: Record<string, (item: T) => SortValue>,
): T[] {
  if (!sort) return items
  const accessor = accessors[sort]
  if (!accessor) return items
  const direction = order === 'asc' ? 1 : -1
  return items.slice().sort((a, b) => {
    const av = accessor(a)
    const bv = accessor(b)
    if (av === bv) return 0
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction
    return String(av).localeCompare(String(bv), 'en', { numeric: true }) * direction
  })
}

export function matchesQuery(q: string, ...fields: Array<string | null | undefined>): boolean {
  if (!q) return true
  return fields.some((field) => field?.toLowerCase().includes(q))
}

export function inRange(iso: string, from?: string | null, to?: string | null): boolean {
  if (from && iso < from) return false
  if (to && iso > to) return false
  return true
}

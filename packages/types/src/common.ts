/** ISO-8601 timestamp string, e.g. `2026-09-18T09:30:00.000Z`. */
export type ISODateString = string

/** Amount in Indian rupees. Prices are whole rupees or at most two decimals. */
export type Rupees = number

export type SortOrder = 'asc' | 'desc'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ListParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: SortOrder
  q?: string
}

export interface DateRangeParams {
  from?: ISODateString
  to?: ISODateString
}

/** Error body returned by the Shalgam API for any non-2xx response. */
export interface ApiErrorBody {
  error: {
    code: string
    message: string
    /** Field-level validation messages, keyed by field path. */
    details?: Record<string, string[]>
  }
}

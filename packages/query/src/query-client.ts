import { isApiError } from '@shalgam/api-client'
import { QueryClient, type DefaultOptions } from '@tanstack/react-query'

export const STALE_TIMES = {
  /** Catalog data changes rarely: categories, settings, locations. */
  static: 10 * 60 * 1000,
  /** Product lists and details. */
  catalog: 2 * 60 * 1000,
  /** Operational data that admins expect to be fresh. */
  operational: 30 * 1000,
  /** Live-ish views such as order tracking and active deliveries. */
  live: 10 * 1000,
} as const

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: STALE_TIMES.catalog,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Never retry client errors (404, 422 …); retry transient failures a couple of times.
      if (isApiError(error) && !error.isRetryable) return false
      return failureCount < 2
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  },
  mutations: {
    retry: false,
  },
}

/** One QueryClient per app instance; tests create their own via the same factory. */
export function createQueryClient(overrides?: DefaultOptions): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { ...defaultOptions.queries, ...overrides?.queries },
      mutations: { ...defaultOptions.mutations, ...overrides?.mutations },
    },
  })
}

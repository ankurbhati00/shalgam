import { createQueryClient } from '@shalgam/query'
import type { QueryExecuteOptions, QueryKey } from '@tanstack/react-query'

/** Single QueryClient for the storefront; route loaders use it to prefetch. */
export const queryClient = createQueryClient()

/**
 * Fire-and-forget cache warming for route loaders. Errors are swallowed on
 * purpose: the page's own `useQuery` will surface them with a retry action.
 */
export function prefetch<TQueryFnData, TError, TData, TQueryData, TQueryKey extends QueryKey>(
  options: QueryExecuteOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
): void {
  queryClient.query(options).catch(() => undefined)
}

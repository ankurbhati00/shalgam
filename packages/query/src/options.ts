import { api } from '@shalgam/api-client'
import type {
  AnalyticsParams,
  CustomerListParams,
  DeliveryListParams,
  InventoryListParams,
  InventoryMovementListParams,
  OrderListParams,
  ProductListParams,
  ReportParams,
} from '@shalgam/types'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { queryKeys } from './keys'
import { STALE_TIMES } from './query-client'

/**
 * Shared `queryOptions` builders. Feature hooks in each app compose these with
 * `useQuery`, `useSuspenseQuery`, `prefetchQuery` or `ensureQueryData`, so the
 * fetcher, key and cache policy are defined exactly once.
 */
export const categoryQueries = {
  list: (params?: { parentId?: string | null; includeInactive?: boolean }) =>
    queryOptions({
      queryKey: queryKeys.categories.list(params),
      queryFn: ({ signal }) => api.catalog.listCategories(params, { signal }),
      staleTime: STALE_TIMES.static,
    }),
  detail: (idOrSlug: string) =>
    queryOptions({
      queryKey: queryKeys.categories.detail(idOrSlug),
      queryFn: ({ signal }) => api.catalog.getCategory(idOrSlug, { signal }),
      staleTime: STALE_TIMES.static,
    }),
}

export const productQueries = {
  list: (params: ProductListParams) =>
    queryOptions({
      queryKey: queryKeys.products.list(params),
      queryFn: ({ signal }) => api.catalog.listProducts(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.catalog,
    }),
  detail: (idOrSlug: string) =>
    queryOptions({
      queryKey: queryKeys.products.detail(idOrSlug),
      queryFn: ({ signal }) => api.catalog.getProduct(idOrSlug, { signal }),
      staleTime: STALE_TIMES.catalog,
    }),
  related: (id: string) =>
    queryOptions({
      queryKey: queryKeys.products.related(id),
      queryFn: ({ signal }) => api.catalog.getRelatedProducts(id, { signal }),
      staleTime: STALE_TIMES.catalog,
    }),
  frequentlyBought: (id: string) =>
    queryOptions({
      queryKey: queryKeys.products.frequentlyBought(id),
      queryFn: ({ signal }) => api.catalog.getFrequentlyBoughtTogether(id, { signal }),
      staleTime: STALE_TIMES.catalog,
    }),
  search: (q: string) =>
    queryOptions({
      queryKey: queryKeys.products.search(q),
      queryFn: ({ signal }) => api.catalog.search(q, { signal }),
      enabled: q.trim().length >= 2,
      staleTime: STALE_TIMES.catalog,
      placeholderData: keepPreviousData,
    }),
}

export const orderQueries = {
  list: (params: OrderListParams) =>
    queryOptions({
      queryKey: queryKeys.orders.list(params),
      queryFn: ({ signal }) => api.orders.list(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.orders.detail(id),
      queryFn: ({ signal }) => api.orders.get(id, { signal }),
      staleTime: STALE_TIMES.live,
    }),
}

export const customerQueries = {
  list: (params: CustomerListParams) =>
    queryOptions({
      queryKey: queryKeys.customers.list(params),
      queryFn: ({ signal }) => api.customers.list(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.customers.detail(id),
      queryFn: ({ signal }) => api.customers.get(id, { signal }),
      staleTime: STALE_TIMES.operational,
    }),
  me: () =>
    queryOptions({
      queryKey: queryKeys.customers.me,
      queryFn: ({ signal }) => api.customers.me({ signal }),
      staleTime: STALE_TIMES.static,
    }),
  addresses: () =>
    queryOptions({
      queryKey: queryKeys.customers.addresses,
      queryFn: ({ signal }) => api.customers.listAddresses({ signal }),
      staleTime: STALE_TIMES.static,
    }),
}

export const inventoryQueries = {
  list: (params: InventoryListParams) =>
    queryOptions({
      queryKey: queryKeys.inventory.list(params),
      queryFn: ({ signal }) => api.inventory.list(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
  summary: () =>
    queryOptions({
      queryKey: queryKeys.inventory.summary,
      queryFn: ({ signal }) => api.inventory.summary({ signal }),
      staleTime: STALE_TIMES.operational,
    }),
  movements: (params: InventoryMovementListParams) =>
    queryOptions({
      queryKey: queryKeys.inventory.movements(params),
      queryFn: ({ signal }) => api.inventory.listMovements(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
}

export const deliveryQueries = {
  list: (params: DeliveryListParams) =>
    queryOptions({
      queryKey: queryKeys.deliveries.list(params),
      queryFn: ({ signal }) => api.delivery.list(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.live,
    }),
  stats: () =>
    queryOptions({
      queryKey: queryKeys.deliveries.stats,
      queryFn: ({ signal }) => api.delivery.stats({ signal }),
      staleTime: STALE_TIMES.live,
    }),
  partners: () =>
    queryOptions({
      queryKey: queryKeys.deliveries.partners,
      queryFn: ({ signal }) => api.delivery.listPartners({ signal }),
      staleTime: STALE_TIMES.operational,
    }),
}

export const analyticsQueries = {
  overview: (params: AnalyticsParams) =>
    queryOptions({
      queryKey: queryKeys.analytics.overview(params),
      queryFn: ({ signal }) => api.analytics.overview(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
  series: (params: AnalyticsParams) =>
    queryOptions({
      queryKey: queryKeys.analytics.series(params),
      queryFn: ({ signal }) => api.analytics.series(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
  report: (params: ReportParams) =>
    queryOptions({
      queryKey: queryKeys.analytics.report(params),
      queryFn: ({ signal }) => api.analytics.report(params, { signal }),
      placeholderData: keepPreviousData,
      staleTime: STALE_TIMES.operational,
    }),
}

export const storefrontQueries = {
  home: (locationId?: string) =>
    queryOptions({
      queryKey: queryKeys.storefront.home(locationId),
      queryFn: ({ signal }) => api.storefront.home(locationId, { signal }),
      staleTime: STALE_TIMES.catalog,
    }),
  locations: () =>
    queryOptions({
      queryKey: queryKeys.storefront.locations,
      queryFn: ({ signal }) => api.storefront.listLocations({ signal }),
      staleTime: STALE_TIMES.static,
    }),
  checkoutOptions: (subtotal: number) =>
    queryOptions({
      queryKey: queryKeys.storefront.checkoutOptions(subtotal),
      queryFn: ({ signal }) => api.storefront.checkoutOptions(subtotal, { signal }),
      staleTime: STALE_TIMES.operational,
    }),
}

export const settingsQueries = {
  store: () =>
    queryOptions({
      queryKey: queryKeys.settings.store,
      queryFn: ({ signal }) => api.settings.get({ signal }),
      staleTime: STALE_TIMES.static,
    }),
  adminMe: () =>
    queryOptions({
      queryKey: queryKeys.settings.adminMe,
      queryFn: ({ signal }) => api.settings.adminMe({ signal }),
      staleTime: STALE_TIMES.static,
    }),
}

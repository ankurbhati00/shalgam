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

/**
 * Query-key factory. Keys are hierarchical so invalidation can be as broad
 * (`orders.all`) or as narrow (`orders.detail(id)`) as a mutation needs.
 */
export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    list: (params?: { parentId?: string | null; includeInactive?: boolean }) =>
      ['categories', 'list', params ?? {}] as const,
    detail: (idOrSlug: string) => ['categories', 'detail', idOrSlug] as const,
  },
  products: {
    all: ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (params: ProductListParams) => ['products', 'list', params] as const,
    detail: (idOrSlug: string) => ['products', 'detail', idOrSlug] as const,
    related: (id: string) => ['products', 'related', id] as const,
    frequentlyBought: (id: string) => ['products', 'frequently-bought', id] as const,
    search: (q: string) => ['products', 'search', q] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => ['orders', 'list'] as const,
    list: (params: OrderListParams) => ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params: CustomerListParams) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    me: ['customers', 'me'] as const,
    addresses: ['customers', 'addresses'] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (params: InventoryListParams) => ['inventory', 'list', params] as const,
    summary: ['inventory', 'summary'] as const,
    movements: (params: InventoryMovementListParams) => ['inventory', 'movements', params] as const,
  },
  deliveries: {
    all: ['deliveries'] as const,
    list: (params: DeliveryListParams) => ['deliveries', 'list', params] as const,
    stats: ['deliveries', 'stats'] as const,
    partners: ['deliveries', 'partners'] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    overview: (params: AnalyticsParams) => ['analytics', 'overview', params] as const,
    series: (params: AnalyticsParams) => ['analytics', 'series', params] as const,
    report: (params: ReportParams) => ['analytics', 'report', params] as const,
  },
  storefront: {
    home: (locationId?: string) => ['storefront', 'home', locationId ?? 'default'] as const,
    locations: ['storefront', 'locations'] as const,
    checkoutOptions: (subtotal: number) => ['storefront', 'checkout-options', subtotal] as const,
  },
  settings: {
    store: ['settings', 'store'] as const,
    adminMe: ['settings', 'admin-me'] as const,
  },
} as const

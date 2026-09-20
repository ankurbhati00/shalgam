import type { ProductListParams, ProductStatus } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { useTableState } from '../../../hooks/use-table-state'

export const PRODUCT_STATUSES: readonly ProductStatus[] = ['active', 'draft', 'archived']

export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value)
}

export function useProductListParams() {
  const { get, getAll, set } = useSearchParamState()
  const table = useTableState({ sort: 'updatedAt', order: 'desc' })
  const q = get('q') ?? ''
  const status = getAll('status').filter(isProductStatus)
  const categoryId = get('category')
  const statusKey = status.join(',')

  const params = useMemo<ProductListParams>(
    () => ({
      q: q || undefined,
      // The API defaults to active products only; the admin wants every status unless filtered.
      status: status.length > 0 ? status : [...PRODUCT_STATUSES],
      categoryId: categoryId ?? undefined,
      sort: table.sort,
      order: table.order,
      page: table.page,
      pageSize: table.pageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- status is re-derived from the URL; key on its content
    [q, statusKey, categoryId, table.sort, table.order, table.page, table.pageSize],
  )

  return {
    params,
    q,
    status,
    categoryId,
    activeFilterCount: (q ? 1 : 0) + (status.length > 0 ? 1 : 0) + (categoryId ? 1 : 0),
    table,
    setQ: (value: string) => set({ q: value.trim() || null }, { resetPage: true, replace: true }),
    setStatus: (value: ProductStatus[]) => set({ status: value }, { resetPage: true }),
    setCategory: (value: string | null) => set({ category: value }, { resetPage: true }),
    clearFilters: () => set({ q: null, status: null, category: null, page: null }),
  }
}

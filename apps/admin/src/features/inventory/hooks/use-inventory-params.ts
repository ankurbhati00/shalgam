import type {
  InventoryListParams,
  InventoryMovementListParams,
  InventoryMovementType,
  InventoryStatus,
} from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { useTableState } from '../../../hooks/use-table-state'

export type InventoryTab = 'stock' | 'movements'

export const INVENTORY_STATUSES: readonly InventoryStatus[] = [
  'in_stock',
  'low_stock',
  'out_of_stock',
]
export const MOVEMENT_TYPES: readonly InventoryMovementType[] = [
  'restock',
  'sale',
  'adjustment',
  'return',
  'damage',
]

function isInventoryStatus(value: string): value is InventoryStatus {
  return (INVENTORY_STATUSES as readonly string[]).includes(value)
}

function isMovementType(value: string): value is InventoryMovementType {
  return (MOVEMENT_TYPES as readonly string[]).includes(value)
}

export function useInventoryParams() {
  const { get, getAll, set } = useSearchParamState()
  const tab: InventoryTab = get('tab') === 'movements' ? 'movements' : 'stock'
  const table = useTableState(
    tab === 'stock' ? { sort: 'status', order: 'asc' } : { sort: 'createdAt', order: 'desc' },
  )
  const q = get('q') ?? ''
  const status = getAll('status').filter(isInventoryStatus)
  const categoryId = getAll('category')
  const type = getAll('type').filter(isMovementType)
  const statusKey = status.join(',')
  const categoryKey = categoryId.join(',')
  const typeKey = type.join(',')

  const stockParams = useMemo<InventoryListParams>(
    () => ({
      q: q || undefined,
      status: status.length > 0 ? status : undefined,
      categoryId: categoryId.length > 0 ? categoryId : undefined,
      sort: table.sort,
      order: table.order,
      page: table.page,
      pageSize: table.pageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- arrays are re-derived from the URL; key on their content
    [q, statusKey, categoryKey, table.sort, table.order, table.page, table.pageSize],
  )

  const movementParams = useMemo<InventoryMovementListParams>(
    () => ({
      q: q || undefined,
      type: type.length > 0 ? type : undefined,
      sort: table.sort,
      order: table.order,
      page: table.page,
      pageSize: table.pageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- type is re-derived from the URL; key on its content
    [q, typeKey, table.sort, table.order, table.page, table.pageSize],
  )

  const activeFilterCount =
    tab === 'stock'
      ? (q ? 1 : 0) + (status.length > 0 ? 1 : 0) + (categoryId.length > 0 ? 1 : 0)
      : (q ? 1 : 0) + (type.length > 0 ? 1 : 0)

  return {
    tab,
    q,
    status,
    categoryId,
    type,
    stockParams,
    movementParams,
    activeFilterCount,
    table,
    setTab: (next: InventoryTab) =>
      set({
        tab: next === 'stock' ? null : next,
        q: null,
        status: null,
        category: null,
        type: null,
        sort: null,
        order: null,
        page: null,
      }),
    setQ: (value: string) => set({ q: value.trim() || null }, { resetPage: true, replace: true }),
    setStatus: (value: InventoryStatus[]) => set({ status: value }, { resetPage: true }),
    setCategory: (value: string[]) => set({ category: value }, { resetPage: true }),
    setType: (value: InventoryMovementType[]) => set({ type: value }, { resetPage: true }),
    clearFilters: () => set({ q: null, status: null, category: null, type: null, page: null }),
  }
}

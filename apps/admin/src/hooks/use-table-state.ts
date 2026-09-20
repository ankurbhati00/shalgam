import type { SortOrder } from '@shalgam/types'
import type { DataTableSorting } from '@shalgam/ui'
import { useCallback, useMemo } from 'react'

import { parsePage, parsePageSize, useSearchParamState } from './use-search-param-state'

export interface TablePagination {
  pageIndex: number
  pageSize: number
}

export interface TableStateDefaults {
  sort: string
  order: SortOrder
  pageSize?: number
}

export const DEFAULT_PAGE_SIZE = 20

/**
 * Server-mode DataTable state (sort, order, page, pageSize) held in the URL.
 * Feeds `useDataTable({ manual: true, sorting, pagination, ... })` directly.
 */
export function useTableState(defaults: TableStateDefaults) {
  const { get, set } = useSearchParamState()
  const defaultPageSize = defaults.pageSize ?? DEFAULT_PAGE_SIZE
  const sort = get('sort') ?? defaults.sort
  const orderParam = get('order')
  const order: SortOrder =
    orderParam === 'asc' || orderParam === 'desc' ? orderParam : defaults.order
  const page = parsePage(get('page'))
  const pageSize = parsePageSize(get('pageSize'), defaultPageSize)

  const sorting = useMemo<DataTableSorting>(
    () => [{ id: sort, desc: order === 'desc' }],
    [sort, order],
  )
  const pagination = useMemo<TablePagination>(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  )

  const setSorting = useCallback(
    (next: DataTableSorting) => {
      const first = next[0]
      if (!first) {
        set({ sort: null, order: null }, { resetPage: true })
        return
      }
      const nextOrder: SortOrder = first.desc ? 'desc' : 'asc'
      const isDefault = first.id === defaults.sort && nextOrder === defaults.order
      set(
        { sort: isDefault ? null : first.id, order: isDefault ? null : nextOrder },
        { resetPage: true },
      )
    },
    [set, defaults.sort, defaults.order],
  )

  const setPagination = useCallback(
    (next: TablePagination) => {
      set({
        page: next.pageIndex > 0 ? next.pageIndex + 1 : null,
        pageSize: next.pageSize === defaultPageSize ? null : next.pageSize,
      })
    },
    [set, defaultPageSize],
  )

  return { sort, order, page, pageSize, sorting, pagination, setSorting, setPagination }
}

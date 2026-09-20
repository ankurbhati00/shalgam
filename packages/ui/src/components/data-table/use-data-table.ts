import {
  type ColumnDef,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
  useTable,
} from '@tanstack/react-table'

import { dataTableFeatures } from './features'

export interface UseDataTableOptions<TData extends RowData> {
  data: TData[]
  // TanStack's column arrays are intentionally heterogeneous in TValue.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Array<ColumnDef<typeof dataTableFeatures, TData, any>>
  /** Stable row ids keep selection correct across pages and re-sorts. */
  getRowId: (row: TData) => string
  /** `true` when the server sorts and paginates; the table then only reflects state. */
  manual?: boolean
  /** Total row count from the server (manual mode). */
  rowCount?: number
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
  enableRowSelection?: boolean | ((row: TData) => boolean)
  enableSorting?: boolean
  /** Initial values for uncontrolled slices. */
  initialState?: {
    sorting?: SortingState
    pagination?: PaginationState
    columnVisibility?: Record<string, boolean>
  }
}

function resolve<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater
}

/**
 * Creates a DataTable instance. Each state slice is either controlled by the
 * caller (typically URL search params) or kept inside the table.
 */
export function useDataTable<TData extends RowData>(options: UseDataTableOptions<TData>) {
  const {
    data,
    columns,
    getRowId,
    manual = false,
    rowCount,
    sorting,
    onSortingChange,
    pagination,
    onPaginationChange,
    rowSelection,
    onRowSelectionChange,
    columnVisibility,
    onColumnVisibilityChange,
    enableRowSelection = false,
    enableSorting = true,
    initialState,
  } = options

  const state: Partial<{
    sorting: SortingState
    pagination: PaginationState
    rowSelection: RowSelectionState
    columnVisibility: Record<string, boolean>
  }> = {}
  if (sorting) state.sorting = sorting
  if (pagination) state.pagination = pagination
  if (rowSelection) state.rowSelection = rowSelection
  if (columnVisibility) state.columnVisibility = columnVisibility

  // A slice is controlled only when both its value and change handler are supplied.
  // The keys must be absent otherwise: TanStack Table treats a present-but-undefined
  // `on*Change` as "owned by the caller" and stops updating that slice internally.
  const handlers: Partial<{
    onSortingChange: (updater: Updater<SortingState>) => void
    onPaginationChange: (updater: Updater<PaginationState>) => void
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => void
    onColumnVisibilityChange: (updater: Updater<Record<string, boolean>>) => void
  }> = {}
  if (sorting && onSortingChange)
    handlers.onSortingChange = (updater) => onSortingChange(resolve(updater, sorting))
  if (pagination && onPaginationChange)
    handlers.onPaginationChange = (updater) => onPaginationChange(resolve(updater, pagination))
  if (rowSelection && onRowSelectionChange)
    handlers.onRowSelectionChange = (updater) =>
      onRowSelectionChange(resolve(updater, rowSelection))
  if (columnVisibility && onColumnVisibilityChange) {
    handlers.onColumnVisibilityChange = (updater) =>
      onColumnVisibilityChange(resolve(updater, columnVisibility))
  }

  return useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    state,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 },
      ...initialState,
    },
    rowCount,
    manualSorting: manual,
    manualPagination: manual,
    enableRowSelection:
      typeof enableRowSelection === 'function'
        ? (row) => enableRowSelection(row.original)
        : enableRowSelection,
    enableSorting,
    enableMultiSort: false,
    ...handlers,
  })
}

export type DataTableInstance<TData extends RowData> = ReturnType<typeof useDataTable<TData>>

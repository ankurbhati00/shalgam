import {
  type ColumnDef,
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  type RowData,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
} from '@tanstack/react-table'

/** Per-column presentation hints understood by `DataTable`. */
export interface DataTableColumnMeta {
  align?: 'start' | 'center' | 'end'
  /** Tabular numerals. */
  numeric?: boolean
  /** Hide below this breakpoint to keep tables usable on small screens. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  /** Fixed or minimum width, e.g. `12rem`. */
  width?: string
  /** Human label for the column-visibility menu when `header` is not a string. */
  label?: string
  /** Extra classes for every cell in the column. */
  className?: string
}

/**
 * The single feature set every Shalgam DataTable uses. TanStack Table v9 only
 * installs the state and APIs for registered features, so this keeps bundles
 * small and gives columns a precise, shared `TFeatures` type.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime },
  rowSelectionFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<DataTableColumnMeta>(),
})

export type DataTableFeatures = typeof dataTableFeatures

export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  DataTableFeatures,
  TData,
  TValue
>

export type DataTableSorting = SortingState

/** Column helper pre-bound to the DataTable feature set. */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

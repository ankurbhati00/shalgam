import type { InventoryMovement } from '@shalgam/types'
import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  EmptyState,
  MultiSelect,
  StatusBadge,
  useDataTable,
} from '@shalgam/ui'
import { formatDateTime, formatNumber } from '@shalgam/utils'
import { History } from 'lucide-react'
import { Link } from 'react-router'

import { FilterBar } from '../../../components/filters/filter-bar'
import { SearchFilter } from '../../../components/filters/search-filter'
import { movementTypeMap } from '../../../components/status-maps'
import { formatSigned } from '../../../lib/format'
import { useInventoryMovements } from '../api/queries'
import { MOVEMENT_TYPES, useInventoryParams } from '../hooks/use-inventory-params'

const EMPTY: InventoryMovement[] = []
const TYPE_OPTIONS = MOVEMENT_TYPES.map((type) => ({
  value: type,
  label: movementTypeMap[type].label,
}))

const helper = createDataTableColumnHelper<InventoryMovement>()

const columns = helper.columns([
  helper.accessor('createdAt', {
    header: 'Date',
    cell: (info) => (
      <time dateTime={info.getValue()} className="whitespace-nowrap text-text-muted">
        {formatDateTime(info.getValue())}
      </time>
    ),
    meta: { width: '9rem' },
  }),
  helper.accessor('productName', {
    header: 'Product',
    cell: (info) => (
      <Link
        to={`/products/${info.row.original.productId}/edit`}
        className="rounded-xs font-medium text-text focus-ring hover:text-primary-strong hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  helper.accessor('type', {
    header: 'Type',
    cell: (info) => <StatusBadge status={info.getValue()} map={movementTypeMap} size="sm" />,
  }),
  helper.accessor('quantity', {
    header: 'Qty',
    cell: (info) => {
      const value = info.getValue()
      return (
        <span
          className={
            value > 0
              ? 'font-medium text-success-text'
              : value < 0
                ? 'font-medium text-danger-text'
                : undefined
          }
        >
          {formatSigned(value)}
        </span>
      )
    },
    meta: { align: 'end', numeric: true, width: '5rem' },
  }),
  helper.accessor('balanceAfter', {
    header: 'Balance',
    cell: (info) => formatNumber(info.getValue()),
    enableSorting: false,
    meta: { align: 'end', numeric: true, hideBelow: 'sm' },
  }),
  helper.accessor('reference', {
    header: 'Reference',
    cell: (info) => <span className="text-text-muted tabular">{info.getValue() ?? '—'}</span>,
    enableSorting: false,
    meta: { hideBelow: 'md' },
  }),
  helper.accessor('note', {
    header: 'Note',
    cell: (info) => (
      <span className="block max-w-56 truncate text-text-muted">{info.getValue() ?? '—'}</span>
    ),
    enableSorting: false,
    meta: { hideBelow: 'xl' },
  }),
  helper.accessor('actor', { header: 'By', enableSorting: false, meta: { hideBelow: 'lg' } }),
])

export function MovementsTable() {
  const listing = useInventoryParams()
  const { movementParams, table: tableState } = listing
  const { data, isPending, isFetching, isError, error, refetch } =
    useInventoryMovements(movementParams)

  const table = useDataTable({
    data: data?.data ?? EMPTY,
    columns,
    getRowId: (row) => row.id,
    manual: true,
    rowCount: data?.meta.total ?? 0,
    sorting: tableState.sorting,
    onSortingChange: tableState.setSorting,
    pagination: tableState.pagination,
    onPaginationChange: tableState.setPagination,
  })

  return (
    <div className="space-y-3">
      <DataTableToolbar>
        <FilterBar activeCount={listing.activeFilterCount} onClear={listing.clearFilters}>
          <SearchFilter
            value={listing.q}
            onChange={listing.setQ}
            placeholder="Search product, reference"
            aria-label="Search movements"
          />
          <MultiSelect
            aria-label="Filter by movement type"
            size="sm"
            className="w-40"
            placeholder="Type"
            options={TYPE_OPTIONS}
            value={listing.type}
            onValueChange={listing.setType}
          />
        </FilterBar>
      </DataTableToolbar>
      <DataTable
        table={table}
        density="compact"
        caption="Stock movements"
        loading={isPending}
        error={isError ? error : undefined}
        onRetry={() => void refetch()}
        className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}
        empty={
          <EmptyState
            size="sm"
            icon={<History />}
            title="No movements match"
            description="Sales, restocks and adjustments will appear here."
            action={
              listing.activeFilterCount > 0 ? (
                <Button size="sm" variant="outline" onClick={listing.clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        }
      />
      <DataTablePagination table={table} />
    </div>
  )
}

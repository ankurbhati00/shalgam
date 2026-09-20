import type { InventoryItem } from '@shalgam/types'
import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnToggle,
  DataTablePagination,
  DataTableToolbar,
  EmptyState,
  IconButton,
  InventoryStatus,
  MultiSelect,
  ProductImage,
  useDataTable,
} from '@shalgam/ui'
import { formatNumber } from '@shalgam/utils'
import { PackageSearch, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { FilterBar } from '../../../components/filters/filter-bar'
import { SearchFilter } from '../../../components/filters/search-filter'
import { RelativeTime } from '../../../components/relative-time'
import { useCategoryOptions } from '../../categories/hooks/use-category-options'
import { useInventory } from '../api/queries'
import { INVENTORY_STATUSES, useInventoryParams } from '../hooks/use-inventory-params'
import { AdjustStockDialog } from './adjust-stock-dialog'

const EMPTY: InventoryItem[] = []
const STATUS_LABELS = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
} as const
const STATUS_OPTIONS = INVENTORY_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}))

const helper = createDataTableColumnHelper<InventoryItem>()

function buildColumns(onAdjust: (item: InventoryItem) => void) {
  return helper.columns([
    helper.accessor('productName', {
      header: 'Product',
      cell: (info) => {
        const item = info.row.original
        return (
          <span className="flex min-w-0 items-center gap-3">
            <ProductImage
              src={item.productImageUrl}
              alt=""
              className="size-9 shrink-0"
              rounded="md"
            />
            <span className="min-w-0">
              <Link
                to={`/products/${item.productId}/edit`}
                className="block truncate rounded-xs font-medium text-text focus-ring hover:text-primary-strong hover:underline"
              >
                {info.getValue()}
              </Link>
              <span className="block truncate text-xs text-text-muted">{item.unit}</span>
            </span>
          </span>
        )
      },
      meta: { width: '15rem' },
    }),
    helper.accessor('sku', {
      header: 'SKU',
      cell: (info) => (
        <span className="whitespace-nowrap text-text-muted tabular">{info.getValue()}</span>
      ),
      meta: { hideBelow: 'md' },
    }),
    helper.accessor('categoryName', { header: 'Category', meta: { hideBelow: 'lg' } }),
    helper.accessor('onHand', {
      header: 'On hand',
      cell: (info) => formatNumber(info.getValue()),
      meta: { align: 'end', numeric: true },
    }),
    helper.accessor('reserved', {
      header: 'Reserved',
      cell: (info) => formatNumber(info.getValue()),
      meta: { align: 'end', numeric: true, hideBelow: 'md' },
    }),
    helper.accessor('available', {
      header: 'Available',
      cell: (info) => <span className="font-medium">{formatNumber(info.getValue())}</span>,
      meta: { align: 'end', numeric: true },
    }),
    helper.accessor('reorderLevel', {
      header: 'Reorder at',
      cell: (info) => formatNumber(info.getValue()),
      meta: { align: 'end', numeric: true, hideBelow: 'xl' },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => <InventoryStatus status={info.getValue()} size="sm" />,
    }),
    helper.accessor('lastRestockedAt', {
      header: 'Last restocked',
      cell: (info) => (
        <RelativeTime value={info.getValue()} className="whitespace-nowrap text-text-muted" />
      ),
      meta: { hideBelow: 'lg' },
    }),
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableHiding: false,
      meta: { align: 'end', width: '2.5rem', label: 'Actions' },
      cell: (info) => (
        <IconButton
          aria-label={`Adjust stock for ${info.row.original.productName}`}
          icon={<SlidersHorizontal />}
          size="sm"
          variant="ghost"
          onClick={() => onAdjust(info.row.original)}
        />
      ),
    }),
  ])
}

export function StockTable() {
  const listing = useInventoryParams()
  const { stockParams, table: tableState } = listing
  const { data, isPending, isFetching, isError, error, refetch } = useInventory(stockParams)
  const { options: categoryOptions } = useCategoryOptions()
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null)
  const columns = useMemo(() => buildColumns(setAdjusting), [])

  const table = useDataTable({
    data: data?.data ?? EMPTY,
    columns,
    getRowId: (row) => row.productId,
    manual: true,
    rowCount: data?.meta.total ?? 0,
    sorting: tableState.sorting,
    onSortingChange: tableState.setSorting,
    pagination: tableState.pagination,
    onPaginationChange: tableState.setPagination,
  })

  return (
    <div className="space-y-3">
      <DataTableToolbar actions={<DataTableColumnToggle table={table} />}>
        <FilterBar activeCount={listing.activeFilterCount} onClear={listing.clearFilters}>
          <SearchFilter
            value={listing.q}
            onChange={listing.setQ}
            placeholder="Search product, SKU"
            aria-label="Search inventory"
          />
          <MultiSelect
            aria-label="Filter by stock status"
            size="sm"
            className="w-40"
            placeholder="Stock status"
            options={STATUS_OPTIONS}
            value={listing.status}
            onValueChange={listing.setStatus}
          />
          <MultiSelect
            aria-label="Filter by category"
            size="sm"
            className="w-48"
            placeholder="Category"
            options={categoryOptions}
            value={listing.categoryId}
            onValueChange={listing.setCategory}
          />
        </FilterBar>
      </DataTableToolbar>
      <DataTable
        table={table}
        density="compact"
        caption="Stock levels"
        loading={isPending}
        error={isError ? error : undefined}
        onRetry={() => void refetch()}
        className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}
        empty={
          <EmptyState
            size="sm"
            icon={<PackageSearch />}
            title="No stock records match"
            description="Try a different search or clear the filters."
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
      <AdjustStockDialog
        item={adjusting}
        open={adjusting !== null}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null)
        }}
      />
    </div>
  )
}

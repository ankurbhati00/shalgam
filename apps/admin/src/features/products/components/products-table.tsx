import type { Product } from '@shalgam/types'
import {
  Button,
  DataTable,
  DataTableColumnToggle,
  DataTablePagination,
  DataTableToolbar,
  EmptyState,
  MultiSelect,
  Select,
  useDataTable,
} from '@shalgam/ui'
import { PackageSearch, Plus } from 'lucide-react'
import { Link } from 'react-router'

import { FilterBar } from '../../../components/filters/filter-bar'
import { SearchFilter } from '../../../components/filters/search-filter'
import { productStatusMap } from '../../../components/status-maps'
import { useCategoryOptions } from '../../categories/hooks/use-category-options'
import { useProducts } from '../api/queries'
import { PRODUCT_STATUSES, useProductListParams } from '../hooks/use-product-list-params'
import { productColumns } from './product-columns'

const EMPTY: Product[] = []
const STATUS_OPTIONS = PRODUCT_STATUSES.map((status) => ({
  value: status,
  label: productStatusMap[status].label,
}))

export function ProductsTable() {
  const listing = useProductListParams()
  const { params, table: tableState } = listing
  const { data, isPending, isFetching, isError, error, refetch } = useProducts(params)
  const { options: categoryOptions } = useCategoryOptions()

  const table = useDataTable({
    data: data?.data ?? EMPTY,
    columns: productColumns,
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
      <DataTableToolbar
        actions={
          <>
            <DataTableColumnToggle table={table} />
            <Button size="sm" leadingIcon={<Plus />} render={<Link to="/products/new" />}>
              New product
            </Button>
          </>
        }
      >
        <FilterBar activeCount={listing.activeFilterCount} onClear={listing.clearFilters}>
          <SearchFilter
            value={listing.q}
            onChange={listing.setQ}
            placeholder="Search products, brands"
            aria-label="Search products"
          />
          <MultiSelect
            aria-label="Filter by status"
            size="sm"
            className="w-36"
            placeholder="Status"
            options={STATUS_OPTIONS}
            value={listing.status}
            onValueChange={listing.setStatus}
          />
          <Select
            aria-label="Filter by category"
            size="sm"
            className="w-48"
            placeholder="All categories"
            options={[{ value: '__all', label: 'All categories' }, ...categoryOptions]}
            value={listing.categoryId ?? '__all'}
            onValueChange={(value) =>
              listing.setCategory(value && value !== '__all' ? value : null)
            }
          />
        </FilterBar>
      </DataTableToolbar>
      <DataTable
        table={table}
        density="compact"
        caption="Products"
        loading={isPending}
        error={isError ? error : undefined}
        onRetry={() => void refetch()}
        className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}
        empty={
          <EmptyState
            size="sm"
            icon={<PackageSearch />}
            title="No products match"
            description={
              listing.activeFilterCount > 0
                ? 'Try a different search or clear the filters.'
                : 'Add your first product to start selling.'
            }
            action={
              listing.activeFilterCount > 0 ? (
                <Button size="sm" variant="outline" onClick={listing.clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" leadingIcon={<Plus />} render={<Link to="/products/new" />}>
                  New product
                </Button>
              )
            }
          />
        }
      />
      <DataTablePagination table={table} />
    </div>
  )
}

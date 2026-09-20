import type { Customer } from '@shalgam/types'
import {
  Button,
  DataTable,
  DataTableColumnToggle,
  DataTablePagination,
  DataTableToolbar,
  EmptyState,
  MultiSelect,
  useDataTable,
} from '@shalgam/ui'
import { UsersRound } from 'lucide-react'

import { FilterBar } from '../../../components/filters/filter-bar'
import { SearchFilter } from '../../../components/filters/search-filter'
import { customerStatusMap, customerTierMap } from '../../../components/status-maps'
import { useCustomers } from '../api/queries'
import {
  CUSTOMER_STATUSES,
  CUSTOMER_TIERS,
  useCustomerListParams,
} from '../hooks/use-customer-list-params'
import { customerColumns } from './customer-columns'

const EMPTY: Customer[] = []
const STATUS_OPTIONS = CUSTOMER_STATUSES.map((status) => ({
  value: status,
  label: customerStatusMap[status].label,
}))
const TIER_OPTIONS = CUSTOMER_TIERS.map((tier) => ({
  value: tier,
  label: customerTierMap[tier].label,
}))

export function CustomersTable() {
  const listing = useCustomerListParams()
  const { params, table: tableState } = listing
  const { data, isPending, isFetching, isError, error, refetch } = useCustomers(params)

  const table = useDataTable({
    data: data?.data ?? EMPTY,
    columns: customerColumns,
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
      <DataTableToolbar actions={<DataTableColumnToggle table={table} />}>
        <FilterBar activeCount={listing.activeFilterCount} onClear={listing.clearFilters}>
          <SearchFilter
            value={listing.q}
            onChange={listing.setQ}
            placeholder="Search name, email, phone"
            aria-label="Search customers"
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
          <MultiSelect
            aria-label="Filter by tier"
            size="sm"
            className="w-36"
            placeholder="Tier"
            options={TIER_OPTIONS}
            value={listing.tier}
            onValueChange={listing.setTier}
          />
        </FilterBar>
      </DataTableToolbar>
      <DataTable
        table={table}
        density="compact"
        caption="Customers"
        loading={isPending}
        error={isError ? error : undefined}
        onRetry={() => void refetch()}
        className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}
        empty={
          <EmptyState
            size="sm"
            icon={<UsersRound />}
            title="No customers match"
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
    </div>
  )
}

import type { Order, OrderListParams, OrderStatus } from '@shalgam/types'
import {
  Button,
  DataTable,
  DataTableColumnToggle,
  DataTablePagination,
  DataTableSelectionBar,
  DataTableToolbar,
  EmptyState,
  MultiSelect,
  useDataTable,
} from '@shalgam/ui'
import { formatDateTime } from '@shalgam/utils'
import { ClipboardList, Download } from 'lucide-react'
import { useState } from 'react'

import { DateRangeFilter } from '../../../components/filters/date-range-filter'
import { FilterBar } from '../../../components/filters/filter-bar'
import { SearchFilter } from '../../../components/filters/search-filter'
import { downloadCsv, toCsv } from '../../../lib/csv'
import { formatPaymentMethod } from '../../../lib/format'
import { useBulkUpdateOrderStatus, useOrders } from '../api/queries'
import { useOrderListParams } from '../hooks/use-order-list-params'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../lib/order-status'
import { orderColumns } from './order-columns'

const EMPTY: Order[] = []

function exportOrders(orders: Order[]) {
  const csv = toCsv(orders, [
    { key: 'number', label: 'Order', value: (o) => o.number },
    { key: 'placedAt', label: 'Placed', value: (o) => formatDateTime(o.placedAt) },
    { key: 'customer', label: 'Customer', value: (o) => o.customer.name },
    { key: 'phone', label: 'Phone', value: (o) => o.customer.phone },
    { key: 'items', label: 'Items', value: (o) => o.itemCount },
    { key: 'total', label: 'Total (INR)', value: (o) => o.pricing.total },
    {
      key: 'paymentMethod',
      label: 'Payment method',
      value: (o) => formatPaymentMethod(o.payment.method),
    },
    { key: 'paymentStatus', label: 'Payment status', value: (o) => o.payment.status },
    { key: 'status', label: 'Status', value: (o) => o.status },
    { key: 'deliveryStatus', label: 'Delivery', value: (o) => o.deliveryStatus },
    { key: 'pincode', label: 'Pincode', value: (o) => o.address.pincode },
  ])
  downloadCsv(`shalgam-orders-${new Date().toISOString().slice(0, 10)}`, csv)
}

export interface OrdersTableProps {
  /** Extra server filters, e.g. `{ customerId }` on the customer page. */
  baseParams?: Pick<OrderListParams, 'customerId'>
  /** Hide the customer column (customer detail page). */
  hideCustomer?: boolean
  /** Hide toolbar filters that don't apply in an embedded context. */
  compact?: boolean
}

/** Server-driven orders table: every piece of state lives in the URL. */
export function OrdersTable({
  baseParams = {},
  hideCustomer = false,
  compact = false,
}: OrdersTableProps) {
  const listing = useOrderListParams(baseParams)
  const { params, table: tableState } = listing
  const { data, isPending, isFetching, isError, error, refetch } = useOrders(params)
  const bulk = useBulkUpdateOrderStatus()
  const [rowSelection, setRowSelection] = useState<Record<string, true>>({})

  const table = useDataTable({
    data: data?.data ?? EMPTY,
    columns: orderColumns,
    getRowId: (row) => row.id,
    manual: true,
    rowCount: data?.meta.total ?? 0,
    sorting: tableState.sorting,
    onSortingChange: tableState.setSorting,
    pagination: tableState.pagination,
    onPaginationChange: tableState.setPagination,
    enableRowSelection: (row) => row.status !== 'delivered' && row.status !== 'cancelled',
    rowSelection,
    onRowSelectionChange: setRowSelection,
    initialState: { columnVisibility: { customer: !hideCustomer } },
  })

  const selectedIds = Object.keys(rowSelection)
  const runBulk = (status: OrderStatus) => {
    bulk.mutate({ ids: selectedIds, status }, { onSuccess: () => setRowSelection({}) })
  }

  return (
    <div className="space-y-3">
      <DataTableToolbar
        actions={
          <>
            <DataTableColumnToggle table={table} />
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<Download />}
              disabled={!data || data.data.length === 0}
              onClick={() => data && exportOrders(data.data)}
            >
              Export CSV
            </Button>
          </>
        }
      >
        <FilterBar activeCount={listing.activeFilterCount} onClear={listing.clearFilters}>
          <SearchFilter
            value={listing.q}
            onChange={listing.setQ}
            placeholder="Search order, customer, phone"
            aria-label="Search orders"
          />
          <MultiSelect
            aria-label="Filter by status"
            size="sm"
            className="w-40"
            placeholder="Status"
            options={ORDER_STATUS_OPTIONS}
            value={listing.status}
            onValueChange={listing.setStatus}
          />
          {!compact && (
            <MultiSelect
              aria-label="Filter by payment status"
              size="sm"
              className="w-40"
              placeholder="Payment"
              options={PAYMENT_STATUS_OPTIONS}
              value={listing.paymentStatus}
              onValueChange={listing.setPaymentStatus}
            />
          )}
          <DateRangeFilter
            allowAll
            choice={listing.dateChoice}
            range={listing.dateRange}
            onChange={listing.setDateRange}
          />
        </FilterBar>
      </DataTableToolbar>
      <DataTableSelectionBar table={table}>
        <Button
          size="sm"
          variant="outline"
          loading={bulk.isPending}
          onClick={() => runBulk('packed')}
        >
          Mark packed
        </Button>
        <Button
          size="sm"
          variant="outline"
          loading={bulk.isPending}
          onClick={() => runBulk('out_for_delivery')}
        >
          Mark out for delivery
        </Button>
      </DataTableSelectionBar>
      <DataTable
        table={table}
        density="compact"
        caption="Orders"
        loading={isPending || (isFetching && !data)}
        error={isError ? error : undefined}
        onRetry={() => void refetch()}
        className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}
        empty={
          <EmptyState
            size="sm"
            icon={<ClipboardList />}
            title="No orders match"
            description={
              listing.activeFilterCount > 0
                ? 'Try widening the filters or the date range.'
                : 'New orders will show up here as they come in.'
            }
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

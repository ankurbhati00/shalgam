import type { Delivery } from '@shalgam/types'
import {
  Avatar,
  Badge,
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnToggle,
  DataTablePagination,
  DataTableToolbar,
  DeliveryStatus,
  EmptyState,
  IconButton,
  useDataTable,
} from '@shalgam/ui'
import { formatDateTime, formatTime, minutesUntil } from '@shalgam/utils'
import { Bike, UserRoundPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { SearchFilter } from '../../../components/filters/search-filter'
import { VEHICLE_LABELS } from '../../../components/status-maps'
import { useDeliveries } from '../api/queries'
import { useDeliveryParams } from '../hooks/use-delivery-params'
import { AssignPartnerDialog } from './assign-partner-dialog'

const EMPTY: Delivery[] = []
const helper = createDataTableColumnHelper<Delivery>()

function EtaCell({ delivery }: { delivery: Delivery }) {
  if (delivery.status === 'delivered') {
    return (
      <span className="text-text-muted">
        {delivery.deliveredAt ? `Delivered ${formatTime(delivery.deliveredAt)}` : 'Delivered'}
      </span>
    )
  }
  if (delivery.status === 'failed') return <span className="text-danger-text">Failed</span>
  if (!delivery.eta) return <span className="text-text-muted">—</span>
  const minutes = minutesUntil(delivery.eta)
  return (
    <span className="flex flex-col">
      <span className={delivery.isDelayed ? 'font-medium text-danger-text' : 'text-text'}>
        {minutes <= 0 ? 'Due now' : `in ${minutes} min`}
      </span>
      <span className="text-xs text-text-muted">by {formatTime(delivery.eta)}</span>
    </span>
  )
}

function buildColumns(onAssign: (delivery: Delivery) => void) {
  return helper.columns([
    helper.accessor('orderNumber', {
      header: 'Order',
      enableSorting: false,
      cell: (info) => (
        <Link
          to={`/orders/${info.row.original.orderId}`}
          className="rounded-xs font-medium text-text tabular focus-ring hover:text-primary-strong hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
      meta: { width: '10rem' },
    }),
    helper.accessor('customerName', { header: 'Customer', meta: { hideBelow: 'md' } }),
    helper.accessor('zone', {
      header: 'Zone',
      cell: (info) => (
        <span className="flex flex-col">
          <span className="text-text">{info.getValue()}</span>
          <span className="max-w-56 truncate text-xs text-text-muted">
            {info.row.original.addressSummary}
          </span>
        </span>
      ),
    }),
    helper.accessor((row) => row.partner?.name ?? '', {
      id: 'partner',
      header: 'Partner',
      cell: (info) => {
        const partner = info.row.original.partner
        if (!partner) return <span className="text-text-muted">Unassigned</span>
        return (
          <span className="flex items-center gap-2">
            <Avatar name={partner.name} size="xs" />
            <span className="flex flex-col">
              <span className="text-text">{partner.name}</span>
              <span className="text-xs text-text-muted">{VEHICLE_LABELS[partner.vehicle]}</span>
            </span>
          </span>
        )
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className="flex flex-wrap items-center gap-1">
          <DeliveryStatus status={info.getValue()} size="sm" />
          {info.row.original.isDelayed &&
            info.getValue() !== 'delivered' &&
            info.getValue() !== 'failed' && (
              <Badge tone="danger" size="sm" variant="outline">
                Delayed
              </Badge>
            )}
        </span>
      ),
    }),
    helper.accessor('eta', {
      header: 'ETA',
      cell: (info) => <EtaCell delivery={info.row.original} />,
      meta: { hideBelow: 'sm' },
    }),
    helper.accessor('distanceKm', {
      header: 'Distance',
      cell: (info) => `${info.getValue().toFixed(1)} km`,
      meta: { align: 'end', numeric: true, hideBelow: 'lg' },
    }),
    helper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => (
        <time dateTime={info.getValue()} className="whitespace-nowrap text-text-muted">
          {formatDateTime(info.getValue())}
        </time>
      ),
      meta: { hideBelow: 'xl' },
    }),
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableHiding: false,
      meta: { align: 'end', width: '3rem', label: 'Actions' },
      cell: (info) => {
        const delivery = info.row.original
        if (delivery.status === 'delivered' || delivery.status === 'failed') return null
        return (
          <IconButton
            aria-label={`${delivery.partner ? 'Reassign' : 'Assign'} partner for ${delivery.orderNumber}`}
            icon={<UserRoundPlus />}
            size="sm"
            variant="ghost"
            onClick={() => onAssign(delivery)}
          />
        )
      },
    }),
  ])
}

export function DeliveriesTable() {
  const listing = useDeliveryParams()
  const { params, table: tableState, tab } = listing
  const { data, isPending, isFetching, isError, error, refetch } = useDeliveries(params)
  const [assigning, setAssigning] = useState<Delivery | null>(null)
  const columns = useMemo(() => buildColumns(setAssigning), [])

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
      <DataTableToolbar actions={<DataTableColumnToggle table={table} />}>
        <SearchFilter
          value={listing.q}
          onChange={listing.setQ}
          placeholder="Search order, customer, partner"
          aria-label="Search deliveries"
        />
      </DataTableToolbar>
      <DataTable
        table={table}
        density="compact"
        caption="Deliveries"
        loading={isPending}
        error={isError ? error : undefined}
        onRetry={() => void refetch()}
        className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}
        empty={
          <EmptyState
            size="sm"
            icon={<Bike />}
            title={
              tab === 'delayed'
                ? 'Nothing is running late'
                : tab === 'completed'
                  ? 'No completed deliveries yet'
                  : 'No active deliveries'
            }
            description={
              tab === 'delayed'
                ? 'Every active delivery is on schedule.'
                : 'Deliveries appear here as orders are packed.'
            }
          />
        }
      />
      <DataTablePagination table={table} />
      <AssignPartnerDialog
        delivery={assigning}
        open={assigning !== null}
        onOpenChange={(open) => {
          if (!open) setAssigning(null)
        }}
      />
    </div>
  )
}

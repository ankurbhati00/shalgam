import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table'
import { Download, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../button'
import { SearchInput } from '../search-input'
import { defineStatusMap, StatusBadge } from '../status-badge'
import {
  DataTable,
  DataTableColumnToggle,
  DataTablePagination,
  DataTableSelectionBar,
  DataTableToolbar,
  createDataTableColumnHelper,
  selectionColumn,
  useDataTable,
} from './index'

interface DemoOrder {
  id: string
  number: string
  customer: string
  items: number
  amount: number
  status: 'placed' | 'packed' | 'delivered' | 'cancelled'
  placedAt: string
}

const statusMap = defineStatusMap<DemoOrder['status']>({
  placed: { label: 'Placed', tone: 'info' },
  packed: { label: 'Packed', tone: 'warning' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
})

const names = [
  'Ananya Rao',
  'Rohan Iyer',
  'Priya Sharma',
  'Karthik Reddy',
  'Meera Nair',
  'Vikram Patel',
  'Sneha Menon',
  'Aarav Gupta',
]
const statuses: Array<DemoOrder['status']> = [
  'placed',
  'packed',
  'delivered',
  'delivered',
  'delivered',
  'cancelled',
]

function makeRows(count: number): DemoOrder[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ord_${i}`,
    number: `SHL-2609${String(18 - (i % 9)).padStart(2, '0')}-${String(1000 + i).slice(1)}`,
    customer: names[i % names.length]!,
    items: (i % 6) + 1,
    amount: 120 + ((i * 137) % 1800),
    status: statuses[i % statuses.length]!,
    placedAt: new Date(Date.now() - i * 37 * 60_000).toISOString(),
  }))
}

const helper = createDataTableColumnHelper<DemoOrder>()
const columns = helper.columns([
  selectionColumn<DemoOrder>(),
  helper.accessor('number', {
    header: 'Order',
    cell: (info) => <span className="font-medium text-text">{info.getValue()}</span>,
    meta: { width: '11rem' },
  }),
  helper.accessor('customer', { header: 'Customer' }),
  helper.accessor('items', {
    header: 'Items',
    meta: { align: 'end', numeric: true, hideBelow: 'md' },
  }),
  helper.accessor('amount', {
    header: 'Amount',
    cell: (info) => `₹${info.getValue().toLocaleString('en-IN')}`,
    meta: { align: 'end', numeric: true },
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} map={statusMap} />,
    enableSorting: false,
  }),
  helper.accessor('placedAt', {
    header: 'Placed',
    cell: (info) =>
      new Date(info.getValue()).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }),
    meta: { hideBelow: 'lg' },
  }),
])

const meta = {
  title: 'Components/Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

function ClientSideDemo({
  loading = false,
  error = false,
  emptyData = false,
}: {
  loading?: boolean
  error?: boolean
  emptyData?: boolean
}) {
  const [query, setQuery] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const allRows = useMemo(() => (emptyData ? [] : makeRows(57)), [emptyData])
  const data = useMemo(
    () =>
      allRows.filter(
        (r) =>
          r.customer.toLowerCase().includes(query.toLowerCase()) ||
          r.number.toLowerCase().includes(query.toLowerCase()),
      ),
    [allRows, query],
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    rowSelection,
    onRowSelectionChange: setRowSelection,
    initialState: {
      sorting: [{ id: 'placedAt', desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })
  return (
    <div className="space-y-3">
      <DataTableToolbar
        actions={
          <>
            <DataTableColumnToggle table={table} />
            <Button variant="outline" size="sm" leadingIcon={<Download />}>
              Export
            </Button>
            <Button size="sm" leadingIcon={<Plus />}>
              New order
            </Button>
          </>
        }
      >
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search orders"
          className="sm:w-72"
          size="sm"
        />
      </DataTableToolbar>
      <DataTableSelectionBar table={table}>
        <Button size="sm" variant="outline">
          Mark packed
        </Button>
        <Button size="sm" variant="danger-outline">
          Cancel
        </Button>
      </DataTableSelectionBar>
      <DataTable
        table={table}
        loading={loading}
        error={error ? new Error('boom') : undefined}
        onRetry={() => undefined}
        caption="Orders"
        onRowClick={(row) => alert(row.number)}
      />
      <DataTablePagination table={table} />
    </div>
  )
}

export const ClientSide: Story = {
  args: { table: undefined as never },
  render: () => <ClientSideDemo />,
}

export const Loading: Story = {
  args: { table: undefined as never },
  render: () => <ClientSideDemo loading />,
}
export const ErrorStory: Story = {
  name: 'Error',
  args: { table: undefined as never },
  render: () => <ClientSideDemo error />,
}
export const Empty: Story = {
  args: { table: undefined as never },
  render: () => <ClientSideDemo emptyData />,
}

function ServerSideDemo() {
  // Simulates URL-held state: the server sorts and paginates, the table only reflects it.
  const [sorting, setSorting] = useState<SortingState>([{ id: 'placedAt', desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const all = useMemo(() => makeRows(240), [])
  const page = useMemo(() => {
    const sort = sorting[0]
    const sorted = sort
      ? all.slice().sort((a, b) => {
          const av = a[sort.id as keyof DemoOrder]
          const bv = b[sort.id as keyof DemoOrder]
          return (av < bv ? -1 : av > bv ? 1 : 0) * (sort.desc ? -1 : 1)
        })
      : all
    return sorted.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize,
    )
  }, [all, sorting, pagination])
  const table = useDataTable({
    data: page,
    columns,
    getRowId: (row) => row.id,
    manual: true,
    rowCount: all.length,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
  })
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        Sorting: <code>{JSON.stringify(sorting)}</code> · Page {pagination.pageIndex + 1}
      </p>
      <DataTable table={table} density="compact" caption="Orders (server-side)" />
      <DataTablePagination table={table} />
    </div>
  )
}

export const ServerSide: Story = {
  args: { table: undefined as never },
  render: () => <ServerSideDemo />,
}

function VirtualizedDemo() {
  const data = useMemo(() => makeRows(5000), [])
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 5000 } },
  })
  return (
    <DataTable table={table} virtualize maxHeight={480} density="compact" caption="5,000 orders" />
  )
}

export const Virtualized: Story = {
  args: { table: undefined as never },
  render: () => <VirtualizedDemo />,
}

import type { Customer } from '@shalgam/types'
import { Avatar, createDataTableColumnHelper, StatusBadge } from '@shalgam/ui'
import { formatINR, formatNumber } from '@shalgam/utils'
import { Link } from 'react-router'

import { RelativeTime } from '../../../components/relative-time'
import { customerStatusMap, customerTierMap } from '../../../components/status-maps'

const helper = createDataTableColumnHelper<Customer>()

export const customerColumns = helper.columns([
  helper.accessor('name', {
    header: 'Customer',
    cell: (info) => {
      const customer = info.row.original
      return (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={customer.name} src={customer.avatarUrl} size="sm" />
          <span className="min-w-0">
            <Link
              to={`/customers/${customer.id}`}
              className="block truncate rounded-xs font-medium text-text focus-ring hover:text-primary-strong hover:underline"
            >
              {customer.name}
            </Link>
            <span className="block truncate text-xs text-text-muted">{customer.email}</span>
          </span>
        </span>
      )
    },
    meta: { width: '16rem' },
  }),
  helper.accessor('phone', {
    header: 'Phone',
    enableSorting: false,
    cell: (info) => <span className="text-text-muted tabular">{info.getValue()}</span>,
    meta: { hideBelow: 'lg' },
  }),
  helper.accessor('tier', {
    header: 'Tier',
    cell: (info) => <StatusBadge status={info.getValue()} map={customerTierMap} size="sm" />,
  }),
  helper.accessor('ordersCount', {
    header: 'Orders',
    cell: (info) => formatNumber(info.getValue()),
    meta: { align: 'end', numeric: true, hideBelow: 'sm' },
  }),
  helper.accessor('totalSpent', {
    header: 'Total spent',
    cell: (info) => <span className="font-medium">{formatINR(info.getValue())}</span>,
    meta: { align: 'end', numeric: true },
  }),
  helper.accessor('averageOrderValue', {
    header: 'AOV',
    cell: (info) => formatINR(info.getValue()),
    meta: { align: 'end', numeric: true, hideBelow: 'md' },
  }),
  helper.accessor('lastOrderAt', {
    header: 'Last order',
    cell: (info) => (
      <RelativeTime value={info.getValue()} className="whitespace-nowrap text-text-muted" />
    ),
    meta: { hideBelow: 'md' },
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} map={customerStatusMap} size="sm" />,
  }),
])

import type { Order } from '@shalgam/types'
import {
  createDataTableColumnHelper,
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
  selectionColumn,
} from '@shalgam/ui'
import { formatDateTime, formatINR } from '@shalgam/utils'
import { Link } from 'react-router'

import { formatPaymentMethod } from '../../../lib/format'
import { OrderActionsMenu } from './order-actions-menu'

const helper = createDataTableColumnHelper<Order>()

/** Column ids double as the API sort keys. */
export const orderColumns = helper.columns([
  selectionColumn<Order>(),
  helper.accessor('number', {
    header: 'Order',
    meta: { width: '11rem' },
    cell: (info) => (
      <Link
        to={`/orders/${info.row.original.id}`}
        className="rounded-xs font-medium text-text tabular focus-ring hover:text-primary-strong hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  helper.accessor((row) => row.customer.name, {
    id: 'customer',
    header: 'Customer',
    cell: (info) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-text">{info.getValue()}</span>
        <span className="text-xs text-text-muted tabular">{info.row.original.customer.phone}</span>
      </span>
    ),
  }),
  helper.accessor('itemCount', {
    header: 'Items',
    meta: { align: 'end', numeric: true, hideBelow: 'md', width: '5rem' },
  }),
  helper.accessor((row) => row.pricing.total, {
    id: 'total',
    header: 'Amount',
    cell: (info) => <span className="font-medium">{formatINR(info.getValue())}</span>,
    meta: { align: 'end', numeric: true, width: '7rem' },
  }),
  helper.accessor((row) => row.payment.status, {
    id: 'paymentStatus',
    header: 'Payment',
    cell: (info) => (
      <span className="flex flex-col items-start gap-0.5">
        <PaymentStatus status={info.getValue()} size="sm" />
        <span className="text-xs text-text-muted">
          {formatPaymentMethod(info.row.original.payment.method)}
        </span>
      </span>
    ),
    meta: { hideBelow: 'sm' },
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => <OrderStatus status={info.getValue()} size="sm" />,
  }),
  helper.accessor('deliveryStatus', {
    header: 'Delivery',
    cell: (info) => <DeliveryStatus status={info.getValue()} size="sm" />,
    meta: { hideBelow: 'lg' },
  }),
  helper.accessor('placedAt', {
    header: 'Date',
    cell: (info) => (
      <time dateTime={info.getValue()} className="whitespace-nowrap text-text-muted">
        {formatDateTime(info.getValue())}
      </time>
    ),
    meta: { hideBelow: 'md', width: '9rem' },
  }),
  helper.display({
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    enableHiding: false,
    meta: { align: 'end', width: '3rem', label: 'Actions' },
    cell: (info) => <OrderActionsMenu order={info.row.original} />,
  }),
])

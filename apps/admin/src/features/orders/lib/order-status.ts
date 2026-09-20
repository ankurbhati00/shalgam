import type { DeliveryStatus, Order, OrderStatus, PaymentStatus } from '@shalgam/types'
import { ORDER_STATUS_FLOW } from '@shalgam/types'
import { orderStatusMap, paymentStatusMap } from '@shalgam/ui'

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'placed',
  'preparing',
  'packed',
  'out_for_delivery',
  'delivered',
  'cancelled',
]
export const PAYMENT_STATUSES: readonly PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
  'placed',
  'preparing',
  'packed',
  'out_for_delivery',
]

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: orderStatusMap[status].label,
}))
export const PAYMENT_STATUS_OPTIONS = PAYMENT_STATUSES.map((status) => ({
  value: status,
  label: paymentStatusMap[status].label,
}))

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value)
}

export function isActiveOrder(order: Pick<Order, 'status'>): boolean {
  return ACTIVE_ORDER_STATUSES.includes(order.status)
}

/** The next fulfilment stage, or `null` when the order is delivered or cancelled. */
export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(status)
  if (index === -1) return null
  return ORDER_STATUS_FLOW[index + 1] ?? null
}

export function canCancelOrder(status: OrderStatus): boolean {
  return status === 'placed' || status === 'preparing' || status === 'packed'
}

/** Mirrors the server rule so optimistic updates keep the delivery badge consistent. */
export function deliveryStatusForOrder(status: OrderStatus): DeliveryStatus {
  switch (status) {
    case 'placed':
    case 'preparing':
      return 'pending'
    case 'packed':
      return 'assigned'
    case 'out_for_delivery':
      return 'on_the_way'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'failed'
  }
}

export function statusLabel(status: OrderStatus): string {
  return orderStatusMap[status].label
}

import type { Order, OrderStatus } from '@shalgam/types'
import { ORDER_STATUS_FLOW } from '@shalgam/types'
import { formatDateTime } from '@shalgam/utils'
import type { TimelineStep } from '@shalgam/ui'

const LABELS: Record<OrderStatus, string> = {
  placed: 'Order placed',
  preparing: 'Preparing',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function buildTimelineSteps(order: Order): TimelineStep[] {
  const reached = new Map(order.timeline.map((event) => [event.status, event]))
  if (order.status === 'cancelled') {
    const cancelledAt = reached.get('cancelled')
    return [
      ...order.timeline
        .filter((event) => event.status !== 'cancelled')
        .map<TimelineStep>((event) => ({
          key: event.status,
          label: LABELS[event.status],
          description: event.note ?? undefined,
          time: formatDateTime(event.at),
          state: 'complete',
        })),
      {
        key: 'cancelled',
        label: 'Cancelled',
        description: order.cancelReason ?? undefined,
        time: cancelledAt ? formatDateTime(cancelledAt.at) : undefined,
        state: 'failed',
      },
    ]
  }
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status)
  return ORDER_STATUS_FLOW.map<TimelineStep>((status, index) => {
    const event = reached.get(status)
    const state =
      index < currentIndex
        ? 'complete'
        : index === currentIndex
          ? status === 'delivered'
            ? 'complete'
            : 'current'
          : 'upcoming'
    return {
      key: status,
      label: LABELS[status],
      description: event?.note ?? undefined,
      time: event ? formatDateTime(event.at) : undefined,
      state,
    }
  })
}

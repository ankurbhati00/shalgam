import type { Order, OrderStatus as OrderStatusValue } from '@shalgam/types'
import { ORDER_STATUS_FLOW } from '@shalgam/types'
import type { TimelineStep } from '@shalgam/ui'
import { formatTime } from '@shalgam/utils'

const LABELS: Record<OrderStatusValue, string> = {
  placed: 'Order placed',
  preparing: 'Preparing your order',
  packed: 'Packed & ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function buildTimelineSteps(order: Order): TimelineStep[] {
  const reached = new Map(order.timeline.map((event) => [event.status, event]))
  const cancelledEvent = reached.get('cancelled')
  if (order.status === 'cancelled') {
    return [
      ...order.timeline
        .filter((e) => e.status !== 'cancelled')
        .map<TimelineStep>((e) => ({
          key: e.status,
          label: LABELS[e.status],
          description: e.note ?? undefined,
          time: formatTime(e.at),
          state: 'complete',
        })),
      {
        key: 'cancelled',
        label: 'Cancelled',
        description: order.cancelReason ?? undefined,
        time: cancelledEvent ? formatTime(cancelledEvent.at) : undefined,
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
      time: event ? formatTime(event.at) : undefined,
      state,
    }
  })
}

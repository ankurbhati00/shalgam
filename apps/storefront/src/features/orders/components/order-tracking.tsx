import type { Order } from '@shalgam/types'
import { Badge, OrderTimeline } from '@shalgam/ui'
import { formatTime, minutesUntil } from '@shalgam/utils'
import { Bike, Timer } from 'lucide-react'

import { buildTimelineSteps } from './build-timeline-steps'

export function OrderTracking({
  order,
  partnerName,
}: {
  order: Order
  partnerName?: string | null
}) {
  const isLive = order.status !== 'delivered' && order.status !== 'cancelled'
  return (
    <div className="space-y-5">
      {isLive && order.eta && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary-muted/60 p-4">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {order.status === 'out_for_delivery' ? (
              <Bike className="size-5" aria-hidden />
            ) : (
              <Timer className="size-5" aria-hidden />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-text" aria-live="polite">
              {minutesUntil(order.eta) <= 0
                ? 'Arriving any moment'
                : `Arriving in ${minutesUntil(order.eta)} min`}
            </p>
            <p className="text-xs text-text-muted">
              Promised by {formatTime(order.eta)}
              {partnerName && order.status === 'out_for_delivery'
                ? ` · ${partnerName} is on the way`
                : ''}
            </p>
          </div>
          <Badge tone="brand" className="ml-auto">
            Live
          </Badge>
        </div>
      )}
      <OrderTimeline steps={buildTimelineSteps(order)} />
    </div>
  )
}

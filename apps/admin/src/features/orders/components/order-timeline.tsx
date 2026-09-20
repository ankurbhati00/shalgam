import type { Order } from '@shalgam/types'
import { OrderTimeline as TimelineView } from '@shalgam/ui'

import { buildTimelineSteps } from '../lib/build-timeline-steps'

export function OrderTimeline({
  order,
  orientation = 'vertical',
}: {
  order: Order
  orientation?: 'vertical' | 'horizontal'
}) {
  return <TimelineView steps={buildTimelineSteps(order)} orientation={orientation} />
}

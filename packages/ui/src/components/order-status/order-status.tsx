import { Check, Clock } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { defineStatusMap, StatusBadge, type StatusBadgeProps } from '../status-badge'

export type OrderStatusValue =
  'placed' | 'preparing' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type PaymentStatusValue = 'pending' | 'paid' | 'failed' | 'refunded'
export type DeliveryStatusValue =
  'pending' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
export type InventoryStatusValue = 'in_stock' | 'low_stock' | 'out_of_stock'

export const orderStatusMap = defineStatusMap<OrderStatusValue>({
  placed: { label: 'Placed', tone: 'info' },
  preparing: { label: 'Preparing', tone: 'warning' },
  packed: { label: 'Packed', tone: 'warning' },
  out_for_delivery: { label: 'Out for delivery', tone: 'brand' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
})

export const paymentStatusMap = defineStatusMap<PaymentStatusValue>({
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
})

export const deliveryStatusMap = defineStatusMap<DeliveryStatusValue>({
  pending: { label: 'Awaiting rider', tone: 'neutral' },
  assigned: { label: 'Rider assigned', tone: 'info' },
  picked_up: { label: 'Picked up', tone: 'warning' },
  on_the_way: { label: 'On the way', tone: 'brand' },
  delivered: { label: 'Delivered', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
})

export const inventoryStatusMap = defineStatusMap<InventoryStatusValue>({
  in_stock: { label: 'In stock', tone: 'success' },
  low_stock: { label: 'Low stock', tone: 'warning' },
  out_of_stock: { label: 'Out of stock', tone: 'danger' },
})

type BadgeOnlyProps = Omit<StatusBadgeProps<string>, 'status' | 'map'>

export function OrderStatus({ status, ...props }: BadgeOnlyProps & { status: OrderStatusValue }) {
  return <StatusBadge status={status} map={orderStatusMap} {...props} />
}

export function PaymentStatus({
  status,
  ...props
}: BadgeOnlyProps & { status: PaymentStatusValue }) {
  return <StatusBadge status={status} map={paymentStatusMap} {...props} />
}

export function DeliveryStatus({
  status,
  ...props
}: BadgeOnlyProps & { status: DeliveryStatusValue }) {
  return <StatusBadge status={status} map={deliveryStatusMap} {...props} />
}

export function InventoryStatus({
  status,
  ...props
}: BadgeOnlyProps & { status: InventoryStatusValue }) {
  return <StatusBadge status={status} map={inventoryStatusMap} {...props} />
}

export interface TimelineStep {
  key: string
  label: ReactNode
  description?: ReactNode
  /** Formatted timestamp; omitted for future steps. */
  time?: ReactNode
  state: 'complete' | 'current' | 'upcoming' | 'failed'
}

export interface OrderTimelineProps {
  steps: TimelineStep[]
  className?: string
  /** Horizontal layout for wide screens. */
  orientation?: 'vertical' | 'horizontal'
}

/** Fulfilment progress: Placed → Preparing → Packed → Out for delivery → Delivered. */
export function OrderTimeline({ steps, className, orientation = 'vertical' }: OrderTimelineProps) {
  const current = steps.find((s) => s.state === 'current')
  return (
    <ol
      aria-label="Order progress"
      className={cn(
        orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row items-start',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const dot = (
          <span
            aria-hidden
            className={cn(
              'z-10 inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-surface [&_svg]:size-3.5',
              step.state === 'complete' && 'border-brand-500 bg-brand-500 text-primary-foreground',
              step.state === 'current' &&
                'border-brand-600 text-primary-strong shadow-[0_0_0_4px_var(--color-brand-100)]',
              step.state === 'upcoming' && 'border-border-strong text-transparent',
              step.state === 'failed' && 'border-danger bg-danger-muted text-danger-text',
            )}
          >
            {step.state === 'complete' ? (
              <Check strokeWidth={3} />
            ) : step.state === 'current' ? (
              <Clock />
            ) : step.state === 'failed' ? (
              '×'
            ) : null}
          </span>
        )
        const connector = !isLast && (
          <span
            aria-hidden
            className={cn(
              orientation === 'vertical'
                ? 'absolute top-6 left-[11px] h-[calc(100%-0.5rem)] w-0.5'
                : 'absolute top-[11px] left-6 h-0.5 w-[calc(100%-1.5rem)]',
              step.state === 'complete' ? 'bg-brand-500' : 'bg-border',
            )}
          />
        )
        return (
          <li
            key={step.key}
            aria-current={step.state === 'current' ? 'step' : undefined}
            className={cn(
              'relative',
              orientation === 'vertical'
                ? 'flex gap-3 pb-6 last:pb-0'
                : 'flex flex-1 flex-col gap-2',
            )}
          >
            {connector}
            {dot}
            <div className={cn('min-w-0', orientation === 'horizontal' && 'pr-3')}>
              <p
                className={cn(
                  'text-sm font-semibold',
                  step.state === 'upcoming'
                    ? 'text-text-subtle'
                    : step.state === 'failed'
                      ? 'text-danger-text'
                      : 'text-text',
                )}
              >
                {step.label}
              </p>
              {step.description && <p className="text-xs text-text-muted">{step.description}</p>}
              {step.time && <p className="mt-0.5 text-xs text-text-subtle tabular">{step.time}</p>}
            </div>
          </li>
        )
      })}
      {current && <li className="sr-only">Current step: {current.label}</li>}
    </ol>
  )
}

import { Progress, Skeleton, cn } from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'
import { Truck } from 'lucide-react'

import { useCartBill } from '../hooks/use-cart-bill'
import type { CartTotals } from '../store/cart-store'

export interface CartSummaryProps {
  totals: CartTotals
  tip?: number
  className?: string
  /** Show the free-delivery progress nudge. */
  showNudge?: boolean
}

/** Bill breakdown driven by server-side pricing rules (delivery fee, thresholds, handling). */
export function CartSummary({ totals, tip = 0, className, showNudge = true }: CartSummaryProps) {
  const { options, isPending, deliveryFee, handlingFee, freeDelivery, threshold, total } =
    useCartBill(totals, tip)
  const remaining = Math.max(0, threshold - totals.subtotal)

  return (
    <div className={cn('space-y-3', className)}>
      {showNudge && options && threshold > 0 && (
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-text">
            <Truck className="size-4 text-primary-strong" aria-hidden />
            {freeDelivery
              ? 'You have unlocked free delivery'
              : `Add ${formatINR(remaining)} more for free delivery`}
          </p>
          <Progress
            className="mt-2"
            size="sm"
            value={Math.min(totals.subtotal, threshold)}
            max={threshold}
            aria-label="Progress to free delivery"
          />
        </div>
      )}
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-muted">Item total</dt>
          <dd className="text-text tabular">{formatINR(totals.subtotal)}</dd>
        </div>
        {totals.savings > 0 && (
          <div className="flex justify-between text-success-text">
            <dt>Product savings</dt>
            <dd className="tabular">−{formatINR(totals.savings)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-text-muted">Delivery fee</dt>
          <dd className="text-text tabular">
            {isPending ? (
              <Skeleton className="h-4 w-10" />
            ) : freeDelivery ? (
              <span className="text-success-text">Free</span>
            ) : (
              formatINR(deliveryFee)
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">Handling fee</dt>
          <dd className="text-text tabular">
            {isPending ? <Skeleton className="h-4 w-10" /> : formatINR(handlingFee)}
          </dd>
        </div>
        {tip > 0 && (
          <div className="flex justify-between">
            <dt className="text-text-muted">Rider tip</dt>
            <dd className="text-text tabular">{formatINR(tip)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt>To pay</dt>
          <dd className="tabular">{formatINR(total)}</dd>
        </div>
      </dl>
      {totals.savings > 0 && (
        <p className="rounded-md bg-success-muted px-3 py-2 text-center text-xs font-medium text-success-text">
          You save {formatINR(totals.savings + (freeDelivery && options ? options.deliveryFee : 0))}{' '}
          on this order
        </p>
      )}
    </div>
  )
}

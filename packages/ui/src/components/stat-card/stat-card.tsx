import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Card } from '../card'
import { Skeleton } from '../skeleton'

export interface StatCardProps {
  label: ReactNode
  /** Pre-formatted value (₹1.2L, 1,204, 96.5%). */
  value: ReactNode
  /** Percentage change vs. the previous period; `null` hides the trend. */
  changePercent?: number | null
  /** Text after the trend, e.g. "vs last 30 days". */
  changeLabel?: ReactNode
  /** Whether an increase is good (revenue) or bad (cancellation rate). */
  positiveIsGood?: boolean
  icon?: ReactNode
  /** Small chart or extra content rendered at the bottom. */
  footer?: ReactNode
  loading?: boolean
  className?: string
  /** Highlight the card with the brand tint (use for one key metric at most). */
  emphasis?: boolean
}

/** KPI tile for dashboards. Keep to one number, one trend. */
export function StatCard({
  label,
  value,
  changePercent,
  changeLabel,
  positiveIsGood = true,
  icon,
  footer,
  loading = false,
  className,
  emphasis = false,
}: StatCardProps) {
  const hasTrend = changePercent !== undefined && changePercent !== null
  const direction = !hasTrend
    ? 'flat'
    : changePercent > 0
      ? 'up'
      : changePercent < 0
        ? 'down'
        : 'flat'
  const good = direction === 'flat' ? null : (direction === 'up') === positiveIsGood
  return (
    <Card
      padding="md"
      className={cn(
        'flex flex-col gap-3',
        emphasis && 'border-brand-300 bg-primary-muted/40',
        className,
      )}
      aria-busy={loading || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {icon && (
          <span className="shrink-0 rounded-md bg-surface-muted p-1.5 text-text-muted [&_svg]:size-4">
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton shape="text" className="w-20" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold tracking-tight text-text tabular sm:text-[1.75rem]">
            {value}
          </span>
          {hasTrend && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular',
                  good === null && 'bg-surface-muted text-text-muted',
                  good === true && 'bg-success-muted text-success-text',
                  good === false && 'bg-danger-muted text-danger-text',
                )}
              >
                {direction === 'up' ? (
                  <ArrowUpRight className="size-3" aria-hidden />
                ) : direction === 'down' ? (
                  <ArrowDownRight className="size-3" aria-hidden />
                ) : (
                  <Minus className="size-3" aria-hidden />
                )}
                {direction === 'up' ? '+' : ''}
                {changePercent.toFixed(1)}%
              </span>
              {changeLabel}
            </span>
          )}
        </div>
      )}
      {footer && <div className="mt-auto">{footer}</div>}
    </Card>
  )
}

import { Star } from 'lucide-react'

import { cn } from '../../lib/cn'

export interface RatingProps {
  /** Average rating from 0 to 5. */
  value: number
  /** Number of ratings; shown in brackets when provided. */
  count?: number
  size?: 'sm' | 'md'
  /** Compact form: one star and the number, for product cards. */
  compact?: boolean
  className?: string
}

/** Read-only star rating with an accessible text equivalent. */
export function Rating({ value, count, size = 'sm', compact = false, className }: RatingProps) {
  const rounded = Math.round(value * 10) / 10
  const label = `Rated ${rounded} out of 5${count !== undefined ? ` from ${count.toLocaleString('en-IN')} ratings` : ''}`
  const starClass = size === 'sm' ? 'size-3.5' : 'size-4'
  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium text-text-muted tabular',
          size === 'md' && 'text-sm',
          className,
        )}
        aria-label={label}
      >
        <Star aria-hidden className={cn(starClass, 'fill-warning-500 text-warning-500')} />
        {rounded.toFixed(1)}
        {count !== undefined && (
          <span className="text-text-subtle">({count.toLocaleString('en-IN')})</span>
        )}
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={label}>
      <span aria-hidden className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, rounded - (star - 1)))
          return (
            <span key={star} className={cn('relative inline-block', starClass)}>
              <Star className={cn(starClass, 'absolute inset-0 text-neutral-300')} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(starClass, 'fill-warning-500 text-warning-500')} />
              </span>
            </span>
          )
        })}
      </span>
      <span className={cn('font-medium text-text tabular', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rounded.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={cn('text-text-subtle tabular', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({count.toLocaleString('en-IN')})
        </span>
      )}
    </span>
  )
}

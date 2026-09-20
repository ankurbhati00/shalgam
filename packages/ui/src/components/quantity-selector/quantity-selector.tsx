import { Minus, Plus, Trash } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/cn'

export const quantitySelectorVariants = cva(
  'inline-flex shrink-0 items-center overflow-hidden rounded-full border font-semibold tabular select-none',
  {
    variants: {
      variant: {
        /** Lime pill used on product cards. */
        primary: 'border-primary bg-primary text-primary-foreground',
        /** Neutral control for cart rows and forms. */
        outline: 'border-border-strong bg-surface text-text',
      },
      size: {
        sm: 'h-8 text-sm pointer-coarse:h-10 [&_button]:size-8 pointer-coarse:[&_button]:size-10 [&_svg]:size-3.5',
        md: 'h-10 text-sm pointer-coarse:h-11 [&_button]:size-10 pointer-coarse:[&_button]:size-11 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'sm' },
  },
)

export interface QuantitySelectorProps extends VariantProps<typeof quantitySelectorVariants> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Accessible name for the group, e.g. the product name. */
  label: string
  className?: string
  /** Show a bin icon instead of minus when decrementing would remove the item. */
  removable?: boolean
  loading?: boolean
}

/**
 * Stepper for cart quantities. Announces changes via `aria-live` and keeps the
 * value within `min`/`max`, disabling the buttons at the limits.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  label,
  className,
  variant,
  size,
  removable = min === 0,
  loading = false,
}: QuantitySelectorProps) {
  const canDecrement = !disabled && !loading && value - step >= min
  const canIncrement = !disabled && !loading && value + step <= max
  const atRemove = removable && value - step < 1
  const buttonClass = cn(
    'inline-flex items-center justify-center focus-ring-inset transition-colors',
    variant === 'outline' ? 'hover:bg-surface-muted' : 'hover:bg-primary-hover',
    'disabled:cursor-not-allowed disabled:opacity-40',
  )
  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className={cn(
        quantitySelectorVariants({ variant, size }),
        disabled && 'opacity-60',
        className,
      )}
    >
      <button
        type="button"
        className={buttonClass}
        aria-label={atRemove ? `Remove ${label}` : `Decrease quantity of ${label}`}
        disabled={!canDecrement}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        {atRemove ? <Trash aria-hidden /> : <Minus aria-hidden strokeWidth={2.5} />}
      </button>
      <output
        aria-live="polite"
        aria-label={`Quantity of ${label}`}
        className="min-w-6 px-0.5 text-center"
      >
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Increase quantity of ${label}`}
        disabled={!canIncrement}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        <Plus aria-hidden strokeWidth={2.5} />
      </button>
    </div>
  )
}

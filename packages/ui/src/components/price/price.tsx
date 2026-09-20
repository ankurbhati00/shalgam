import { cva, type VariantProps } from 'class-variance-authority'
import { formatINR } from '@shalgam/utils'

import { cn } from '../../lib/cn'

export const priceVariants = cva('inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0 tabular', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-xl',
      xl: 'text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
})

export interface PriceProps extends VariantProps<typeof priceVariants> {
  /** Selling price in rupees. */
  amount: number
  /** Original price; when higher than `amount` it renders struck through with the discount. */
  mrp?: number
  /** Show "x% off" next to the MRP. */
  showDiscount?: boolean
  className?: string
  /** Per-unit suffix such as "/ kg". */
  suffix?: string
}

/** Rupee price with optional MRP and discount, formatted with Indian digit grouping. */
export function Price({ amount, mrp, showDiscount = true, size, className, suffix }: PriceProps) {
  const hasDiscount = mrp !== undefined && mrp > amount
  const discount = hasDiscount ? Math.round(((mrp - amount) / mrp) * 100) : 0
  return (
    <span className={cn(priceVariants({ size }), className)}>
      <span className="font-semibold text-text">
        {formatINR(amount)}
        {suffix && (
          <span className="ml-0.5 text-[0.75em] font-normal text-text-muted">{suffix}</span>
        )}
      </span>
      {hasDiscount && (
        <>
          <s className="text-[0.8em] text-text-subtle" aria-label={`MRP ${formatINR(mrp)}`}>
            {formatINR(mrp)}
          </s>
          {showDiscount && discount > 0 && (
            <span className="text-[0.75em] font-semibold text-success-text">{discount}% off</span>
          )}
        </>
      )}
    </span>
  )
}

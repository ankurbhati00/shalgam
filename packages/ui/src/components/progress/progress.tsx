import { Progress as BaseProgress } from '@base-ui-components/react/progress'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export const progressIndicatorVariants = cva(
  'h-full rounded-full transition-[width] duration-300 ease-out-soft',
  {
    variants: {
      tone: {
        brand: 'bg-brand-500',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-danger',
        info: 'bg-info',
        neutral: 'bg-neutral-500',
      },
    },
    defaultVariants: { tone: 'brand' },
  },
)

export interface ProgressProps
  extends
    Omit<BaseProgress.Root.Props, 'className'>,
    VariantProps<typeof progressIndicatorVariants> {
  className?: string
  label?: ReactNode
  /** Show the formatted value next to the label. */
  showValue?: boolean
  size?: 'sm' | 'md'
}

/** Determinate progress bar (stock levels, delivery progress, upload state). `value={null}` renders indeterminate. */
export function Progress({
  className,
  tone,
  label,
  showValue = false,
  size = 'md',
  ...props
}: ProgressProps) {
  return (
    <BaseProgress.Root className={cn('flex w-full flex-col gap-1.5', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
          {label ? (
            <BaseProgress.Label className="font-medium">{label}</BaseProgress.Label>
          ) : (
            <span />
          )}
          {showValue && <BaseProgress.Value className="tabular" />}
        </div>
      )}
      <BaseProgress.Track
        className={cn(
          'w-full overflow-hidden rounded-full bg-neutral-200',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <BaseProgress.Indicator
          className={cn(
            progressIndicatorVariants({ tone }),
            'data-[indeterminate]:w-1/3 data-[indeterminate]:animate-[shimmer_1.2s_ease-in-out_infinite]',
          )}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
}

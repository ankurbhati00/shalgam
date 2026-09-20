import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/cn'

export const spinnerVariants = cva('shrink-0 animate-spin', {
  variants: {
    size: { xs: 'size-3.5', sm: 'size-4', md: 'size-5', lg: 'size-8', xl: 'size-12' },
    tone: {
      default: 'text-text-muted',
      brand: 'text-primary-strong',
      inverse: 'text-text-inverse',
      current: 'text-current',
    },
  },
  defaultVariants: { size: 'md', tone: 'default' },
})

export interface SpinnerProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>, VariantProps<typeof spinnerVariants> {
  /** Screen-reader text. Defaults to "Loading". */
  label?: string
}

export function Spinner({ size, tone, label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex', className)} {...props}>
      <LoaderCircle aria-hidden className={spinnerVariants({ size, tone })} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

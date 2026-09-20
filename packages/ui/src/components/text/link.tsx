import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import { cloneElement, isValidElement } from 'react'

import { cn } from '../../lib/cn'

export const linkVariants = cva(
  'inline-flex items-center gap-1 rounded-xs font-medium underline-offset-4 focus-ring transition-colors',
  {
    variants: {
      tone: {
        brand: 'text-primary-strong hover:underline',
        default: 'text-text hover:text-primary-strong hover:underline',
        muted: 'text-text-muted hover:text-text hover:underline',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
      },
    },
    defaultVariants: { tone: 'brand', size: 'md' },
  },
)

export interface LinkProps
  extends ComponentPropsWithoutRef<'a'>, VariantProps<typeof linkVariants> {
  /**
   * Swap the underlying element, e.g. a router `<Link to="/orders" />`.
   * The Shalgam link styles are applied to it.
   */
  render?: ReactElement<{ className?: string }>
}

/** Text link. Routers plug in through `render` so the design system stays router-agnostic. */
export function Link({ className, tone, size, render, children, ...props }: LinkProps) {
  const classes = cn(linkVariants({ tone, size }), className)
  if (isValidElement(render)) {
    return cloneElement(
      render,
      { ...props, className: cn(classes, render.props.className) } as Record<string, unknown>,
      children,
    )
  }
  return (
    <a className={classes} {...props}>
      {children}
    </a>
  )
}

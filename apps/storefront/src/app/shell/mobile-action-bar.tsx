import { cn } from '@shalgam/ui'
import type { ComponentPropsWithoutRef } from 'react'

/**
 * Sticky card for a page's primary action on phones and tablets (cart checkout,
 * place order, add to cart). It is `position: sticky`, so it keeps its place in the
 * flow and never covers content, and it floats above the bottom navigation using
 * the `--bottom-nav-height` variable from the app stylesheet. Large screens hide it:
 * there the action lives in the page's sticky side column.
 */
export function MobileActionBar({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'sticky z-30 rounded-xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur lg:hidden',
        'bottom-[calc(var(--bottom-nav-height)+0.75rem+env(safe-area-inset-bottom,0px))] md:bottom-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

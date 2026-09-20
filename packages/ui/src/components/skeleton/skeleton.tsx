import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/cn'

export interface SkeletonProps extends ComponentPropsWithoutRef<'div'> {
  /** Rounded pill shape for text lines, circle for avatars. */
  shape?: 'rect' | 'text' | 'circle'
}

/** Placeholder block shown while content loads. Announced as busy to assistive tech by the parent region. */
export function Skeleton({ className, shape = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'skeleton',
        shape === 'circle' ? 'rounded-full' : shape === 'text' ? 'h-4 rounded-sm' : 'rounded-md',
        className,
      )}
      {...props}
    />
  )
}

export interface SkeletonTextProps extends ComponentPropsWithoutRef<'div'> {
  lines?: number
}

/** A paragraph of skeleton lines, the last one shorter. */
export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  return (
    <div aria-hidden className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} shape="text" className={index === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  )
}

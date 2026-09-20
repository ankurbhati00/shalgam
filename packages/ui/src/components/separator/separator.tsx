import { Separator as BaseSeparator } from '@base-ui-components/react/separator'

import { cn } from '../../lib/cn'

export interface SeparatorProps extends Omit<BaseSeparator.Props, 'className'> {
  className?: string
  /** Optional label rendered in the middle of a horizontal separator. */
  label?: string
}

/** Thin rule between content groups. Decorative unless it separates meaningful sections. */
export function Separator({
  className,
  orientation = 'horizontal',
  label,
  ...props
}: SeparatorProps) {
  if (label && orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <BaseSeparator orientation="horizontal" className="h-px flex-1 bg-border" {...props} />
        <span className="text-xs font-medium text-text-subtle">{label}</span>
        <BaseSeparator orientation="horizontal" className="h-px flex-1 bg-border" aria-hidden />
      </div>
    )
  }
  return (
    <BaseSeparator
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px self-stretch',
        className,
      )}
      {...props}
    />
  )
}

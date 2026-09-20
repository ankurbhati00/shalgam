import { Button, cn } from '@shalgam/ui'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export interface FilterBarProps {
  children: ReactNode
  /** Number of active filters; shows a "Clear" button when > 0. */
  activeCount?: number
  onClear?: () => void
  className?: string
}

/** One left-aligned row of filters that scopes everything rendered below it. */
export function FilterBar({ children, activeCount = 0, onClear, className }: FilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Filters"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {children}
      {activeCount > 0 && onClear && (
        <Button variant="ghost" size="sm" leadingIcon={<X />} onClick={onClear}>
          Clear{activeCount > 1 ? ` (${activeCount})` : ''}
        </Button>
      )}
    </div>
  )
}

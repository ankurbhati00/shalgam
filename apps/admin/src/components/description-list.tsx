import { cn } from '@shalgam/ui'
import type { ReactNode } from 'react'

export function DescriptionList({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <dl className={cn('divide-y divide-border-subtle text-sm', className)}>{children}</dl>
}

export function DescriptionItem({
  label,
  children,
  className,
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0', className)}
    >
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd className="min-w-0 text-end font-medium text-text">{children}</dd>
    </div>
  )
}

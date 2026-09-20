import type { ReactNode } from 'react'

import { Badge, type BadgeProps } from '../badge'

export type StatusTone = NonNullable<BadgeProps['tone']>

export interface StatusDefinition {
  label: string
  tone: StatusTone
}

export type StatusMap<T extends string> = Record<T, StatusDefinition>

export interface StatusBadgeProps<T extends string> extends Omit<BadgeProps, 'tone' | 'children'> {
  status: T
  /** Map from status key to label and tone. Domain packages export their own maps. */
  map: StatusMap<T>
  /** Show a leading dot instead of an icon. */
  dot?: boolean
  children?: ReactNode
}

/**
 * Generic status pill driven by a `StatusMap`, so every domain status
 * (order, payment, delivery, inventory) renders with one consistent look.
 */
export function StatusBadge<T extends string>({
  status,
  map,
  dot = true,
  size,
  variant,
  className,
  children,
  ...props
}: StatusBadgeProps<T>) {
  const definition = map[status]
  return (
    <Badge
      tone={definition.tone}
      size={size}
      variant={variant}
      dot={dot}
      className={className}
      {...props}
    >
      {children ?? definition.label}
    </Badge>
  )
}

/** Helper to author strongly typed status maps. */
export function defineStatusMap<T extends string>(map: StatusMap<T>): StatusMap<T> {
  return map
}

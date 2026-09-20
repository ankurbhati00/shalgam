import {
  cloneElement,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/cn'

export type BottomNavigationProps = ComponentPropsWithoutRef<'nav'>

/** Mobile tab bar pinned to the bottom of the storefront. Hidden on `md` and up. */
export function BottomNavigation({ className, children, ...props }: BottomNavigationProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 safe-bottom backdrop-blur md:hidden',
        className,
      )}
      {...props}
    >
      <ul className="grid h-14 auto-cols-fr grid-flow-col">{children}</ul>
    </nav>
  )
}

export interface BottomNavigationItemProps {
  label: string
  icon: ReactElement
  active?: boolean
  render?: ReactElement<{ className?: string }>
  href?: string
  badge?: ReactNode
}

export function BottomNavigationItem({
  label,
  icon,
  active = false,
  render,
  href,
  badge,
}: BottomNavigationItemProps) {
  const className = cn(
    'relative flex h-full flex-col items-center justify-center gap-0.5 text-2xs font-medium text-text-muted focus-ring-inset transition-colors',
    active && 'text-primary-strong',
  )
  const content = (
    <>
      <span className="relative [&_svg]:size-5">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1.5 -right-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-semibold text-primary-foreground tabular">
            {badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </>
  )
  return (
    <li>
      {isValidElement(render) ? (
        cloneElement(
          render,
          {
            className: cn(className, render.props.className),
            'aria-current': active ? 'page' : undefined,
          } as Record<string, unknown>,
          content,
        )
      ) : (
        <a href={href} className={className} aria-current={active ? 'page' : undefined}>
          {content}
        </a>
      )}
    </li>
  )
}

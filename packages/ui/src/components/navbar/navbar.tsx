import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface NavbarProps extends ComponentPropsWithoutRef<'header'> {
  /** Leading slot: logo, menu button, location. */
  start?: ReactNode
  /** Centre slot: search, primary navigation. */
  center?: ReactNode
  /** Trailing slot: account, cart, actions. */
  end?: ReactNode
  /** Secondary row rendered under the main bar (category strip, breadcrumbs). */
  secondary?: ReactNode
  sticky?: boolean
  /** Brand-tinted header for the storefront; neutral for the admin. */
  tone?: 'brand' | 'neutral'
}

/** Top app bar with three flexible slots. Apps compose their own content into it. */
export function Navbar({
  start,
  center,
  end,
  secondary,
  sticky = true,
  tone = 'neutral',
  className,
  children,
  ...props
}: NavbarProps) {
  return (
    <header
      className={cn(
        'z-40 w-full border-b',
        sticky && 'sticky top-0',
        tone === 'brand'
          ? 'border-brand-300/60 bg-primary text-primary-foreground'
          : 'border-border bg-surface/95 text-text backdrop-blur supports-[backdrop-filter]:bg-surface/80',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        {start && <div className="flex min-w-0 items-center gap-2">{start}</div>}
        {center && <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div>}
        {end && <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">{end}</div>}
        {children}
      </div>
      {secondary && <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">{secondary}</div>}
    </header>
  )
}

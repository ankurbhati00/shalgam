import {
  cloneElement,
  type ComponentPropsWithoutRef,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  use,
} from 'react'

import { cn } from '../../lib/cn'
import { Tooltip } from '../tooltip'

interface SidebarContextValue {
  collapsed: boolean
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false })

export interface SidebarProps extends ComponentPropsWithoutRef<'aside'> {
  /** Icon-only rail mode. Labels move into tooltips. */
  collapsed?: boolean
}

/** Vertical navigation shell for the admin. Compose `SidebarHeader`, `SidebarNav`, `SidebarSection`, `SidebarItem` and `SidebarFooter`. */
export function Sidebar({ collapsed = false, className, children, ...props }: SidebarProps) {
  return (
    <SidebarContext value={{ collapsed }}>
      <aside
        data-collapsed={collapsed ? '' : undefined}
        className={cn(
          'flex h-full flex-col border-r border-border bg-surface text-text transition-[width] duration-200 ease-out-soft',
          collapsed ? 'w-16' : 'w-64',
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext>
  )
}

export function SidebarHeader({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const { collapsed } = use(SidebarContext)
  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 px-3 sm:h-16',
        collapsed && 'justify-center px-0',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarNav({ className, ...props }: ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav
      className={cn(
        'flex min-h-0 flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto px-2 py-3',
        className,
      )}
      {...props}
    />
  )
}

export interface SidebarSectionProps extends ComponentPropsWithoutRef<'div'> {
  label?: string
}

export function SidebarSection({ label, className, children, ...props }: SidebarSectionProps) {
  const { collapsed } = use(SidebarContext)
  return (
    <div className={cn('flex flex-col gap-0.5', className)} {...props}>
      {label && !collapsed && (
        <div className="px-3 pb-1 text-2xs font-semibold tracking-wider text-text-subtle uppercase">
          {label}
        </div>
      )}
      {label && collapsed && <div aria-hidden className="mx-3 my-1 h-px bg-border" />}
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  )
}

export interface SidebarItemProps {
  label: string
  icon: ReactElement
  active?: boolean
  /** Router element such as `<NavLink to="/orders" />`. Falls back to an anchor with `href`. */
  render?: ReactElement<{ className?: string }>
  href?: string
  badge?: ReactNode
  onClick?: () => void
}

export function SidebarItem({
  label,
  icon,
  active = false,
  render,
  href,
  badge,
  onClick,
}: SidebarItemProps) {
  const { collapsed } = use(SidebarContext)
  const className = cn(
    'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted focus-ring-inset transition-colors duration-150',
    'hover:bg-surface-muted hover:text-text',
    active &&
      'bg-primary-muted text-primary-strong hover:bg-primary-muted hover:text-primary-strong',
    collapsed && 'justify-center px-0',
  )
  const content = (
    <>
      <span
        className={cn(
          'shrink-0 [&_svg]:size-5',
          active ? 'text-primary-strong' : 'text-text-subtle group-hover:text-text',
        )}
      >
        {icon}
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-muted px-1.5 text-xs text-text-muted tabular">
          {badge}
        </span>
      )}
      {collapsed && <span className="sr-only">{label}</span>}
    </>
  )
  const element = isValidElement(render) ? (
    cloneElement(
      render,
      {
        className: cn(className, render.props.className),
        'aria-current': active ? 'page' : undefined,
        onClick,
      } as Record<string, unknown>,
      content,
    )
  ) : (
    <a
      href={href}
      className={className}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {content}
    </a>
  )
  return (
    <li>
      {collapsed ? (
        <Tooltip content={label} side="right">
          {element as ReactElement<Record<string, unknown>>}
        </Tooltip>
      ) : (
        element
      )}
    </li>
  )
}

export function SidebarFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('shrink-0 border-t border-border-subtle p-2', className)} {...props} />
}

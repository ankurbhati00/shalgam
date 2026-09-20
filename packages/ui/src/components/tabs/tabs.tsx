import { Tabs as BaseTabs } from '@base-ui-components/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface TabsProps extends Omit<BaseTabs.Root.Props, 'className'> {
  className?: string
}

/** Root. Use `value`/`onValueChange` to keep the active tab in the URL. */
export function Tabs({ className, ...props }: TabsProps) {
  return <BaseTabs.Root className={cn('flex min-w-0 flex-col gap-4', className)} {...props} />
}

export const tabsListVariants = cva('relative flex', {
  variants: {
    variant: {
      /** Underlined tabs for page sections. */
      line: 'gap-1 border-b border-border',
      /** Pill segmented control for compact filters. */
      pills: 'w-fit max-w-full gap-1 rounded-full bg-surface-muted p-1',
    },
    scrollable: {
      true: 'scrollbar-none overflow-x-auto',
    },
  },
  defaultVariants: { variant: 'line' },
})

export interface TabsListProps
  extends Omit<BaseTabs.List.Props, 'className'>, VariantProps<typeof tabsListVariants> {
  className?: string
}

export function TabsList({ className, variant, scrollable, children, ...props }: TabsListProps) {
  return (
    <BaseTabs.List className={cn(tabsListVariants({ variant, scrollable }), className)} {...props}>
      {children}
      {variant !== 'pills' && (
        <BaseTabs.Indicator
          // Shalgam apps are client-rendered SPAs, so the SSR positioning script is unnecessary.
          renderBeforeHydration={false}
          className="absolute bottom-0 left-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-full bg-primary-strong transition-[translate,width] duration-200 ease-out-soft"
        />
      )}
    </BaseTabs.List>
  )
}

export interface TabProps extends Omit<BaseTabs.Tab.Props, 'className'> {
  className?: string
  icon?: ReactNode
  /** Small count or status shown after the label. */
  badge?: ReactNode
}

export function Tab({ className, icon, badge, children, ...props }: TabProps) {
  return (
    <BaseTabs.Tab
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap text-text-muted focus-ring-inset outline-none select-none',
        'transition-colors duration-150 hover:text-text data-[disabled]:opacity-50 data-[selected]:text-text',
        '[&_svg]:size-4 [[data-variant=pills]_&]:rounded-full',
        // pills variant styles via parent data attribute are not available; rely on group class
        'group-data-[pills]:rounded-full',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {badge !== undefined && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-muted px-1.5 text-xs text-text-muted tabular [[data-selected]_&]:bg-primary-muted [[data-selected]_&]:text-primary-strong">
          {badge}
        </span>
      )}
    </BaseTabs.Tab>
  )
}

export type PillTabProps = TabProps

/** Tab styled for the `pills` list variant. */
export function PillTab({ className, ...props }: PillTabProps) {
  return (
    <Tab
      className={cn(
        'rounded-full px-3.5 py-1.5 data-[selected]:bg-surface data-[selected]:shadow-xs pointer-coarse:py-2.5',
        className,
      )}
      {...props}
    />
  )
}

export interface TabPanelProps extends Omit<BaseTabs.Panel.Props, 'className'> {
  className?: string
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <BaseTabs.Panel className={cn('rounded-md focus-ring outline-none', className)} {...props} />
  )
}

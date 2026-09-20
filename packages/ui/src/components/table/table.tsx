import type { ComponentProps, ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/cn'

export interface TableProps extends ComponentPropsWithoutRef<'table'> {
  /** Tighter rows for dense admin views. */
  density?: 'comfortable' | 'compact'
}

/**
 * Semantic table primitives. Wrap in `TableContainer` for horizontal scrolling.
 * `DataTable` builds on these for sorting, selection and pagination.
 */
export function Table({ className, density = 'comfortable', ...props }: TableProps) {
  return (
    <table
      data-density={density}
      className={cn('w-full caption-bottom border-collapse text-sm text-text', className)}
      {...props}
    />
  )
}

export function TableContainer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative w-full scrollbar-thin overflow-x-auto rounded-xl border border-border bg-surface',
        className,
      )}
      {...props}
    />
  )
}

export function TableHeader({ className, ...props }: ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead
      className={cn('bg-surface-subtle [&_tr]:border-b [&_tr]:border-border', className)}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: ComponentPropsWithoutRef<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableFooter({ className, ...props }: ComponentPropsWithoutRef<'tfoot'>) {
  return (
    <tfoot
      className={cn('border-t border-border bg-surface-subtle font-medium', className)}
      {...props}
    />
  )
}

export interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  selected?: boolean
  interactive?: boolean
}

export function TableRow({ className, selected, interactive, ...props }: TableRowProps) {
  return (
    <tr
      data-selected={selected ? '' : undefined}
      className={cn(
        'border-b border-border-subtle transition-colors',
        interactive && 'cursor-pointer hover:bg-surface-subtle',
        selected && 'bg-primary-muted/40 hover:bg-primary-muted/50',
        className,
      )}
      {...props}
    />
  )
}

export interface TableHeadProps extends Omit<ComponentPropsWithoutRef<'th'>, 'align'> {
  align?: 'start' | 'center' | 'end'
}

export function TableHead({ className, align = 'start', ...props }: TableHeadProps) {
  return (
    <th
      scope="col"
      className={cn(
        'h-10 px-3 text-xs font-semibold tracking-wide whitespace-nowrap text-text-muted uppercase',
        '[[data-density=compact]_&]:h-9 [[data-density=compact]_&]:px-2',
        align === 'end' && 'text-end',
        align === 'center' && 'text-center',
        align === 'start' && 'text-start',
        className,
      )}
      {...props}
    />
  )
}

export interface TableCellProps extends Omit<ComponentPropsWithoutRef<'td'>, 'align'> {
  align?: 'start' | 'center' | 'end'
  /** Tabular numerals for numbers and currency. */
  numeric?: boolean
}

export function TableCell({ className, align = 'start', numeric, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-3 py-3 align-middle',
        '[[data-density=compact]_&]:px-2 [[data-density=compact]_&]:py-2',
        align === 'end' && 'text-end',
        align === 'center' && 'text-center',
        numeric && 'tabular',
        className,
      )}
      {...props}
    />
  )
}

export function TableCaption({ className, ...props }: ComponentPropsWithoutRef<'caption'>) {
  return <caption className={cn('mt-3 text-sm text-text-muted', className)} {...props} />
}

import { flexRender, type Header, type Row, type RowData } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Inbox } from 'lucide-react'
import { type ComponentPropsWithoutRef, type ReactNode, useRef } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { PageSizeSelect, Pagination } from '../pagination'
import { Skeleton } from '../skeleton'
import { EmptyState, ErrorState } from '../states'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'
import { type DataTableFeatures, createDataTableColumnHelper } from './features'
import type { DataTableInstance } from './use-data-table'

const hideBelowClass = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
} as const

function cellClasses(
  meta:
    | {
        align?: 'start' | 'center' | 'end'
        numeric?: boolean
        hideBelow?: keyof typeof hideBelowClass
        className?: string
      }
    | undefined,
) {
  return cn(meta?.hideBelow && hideBelowClass[meta.hideBelow], meta?.className)
}

/** Ready-made selection column: header toggles the page, cells toggle rows (Shift-click for ranges). */
export function selectionColumn<TData extends RowData>() {
  const helper = createDataTableColumnHelper<TData>()
  return helper.display({
    id: '__select',
    enableHiding: false,
    enableSorting: false,
    meta: { width: '2.5rem', align: 'center' },
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onClick={row.getToggleSelectedHandler()}
      />
    ),
  })
}

interface HeaderCellProps<TData extends RowData> {
  header: Header<DataTableFeatures, TData>
}

function HeaderCell<TData extends RowData>({ header }: HeaderCellProps<TData>) {
  const meta = header.column.columnDef.meta
  const canSort = header.column.getCanSort()
  const sorted = header.column.getIsSorted()
  const label = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext())
  return (
    <TableHead
      align={meta?.align}
      aria-sort={
        sorted === 'asc'
          ? 'ascending'
          : sorted === 'desc'
            ? 'descending'
            : canSort
              ? 'none'
              : undefined
      }
      style={meta?.width ? { width: meta.width, minWidth: meta.width } : undefined}
      className={cellClasses(meta)}
    >
      {canSort ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className={cn(
            '-mx-1.5 inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 uppercase focus-ring transition-colors hover:text-text',
            sorted && 'text-text',
            meta?.align === 'end' && 'flex-row-reverse',
          )}
        >
          {label}
          <span aria-hidden className="text-text-subtle [&_svg]:size-3.5">
            {sorted === 'asc' ? (
              <ArrowUp className="text-primary-strong" />
            ) : sorted === 'desc' ? (
              <ArrowDown className="text-primary-strong" />
            ) : (
              <ArrowUpDown />
            )}
          </span>
        </button>
      ) : (
        label
      )}
    </TableHead>
  )
}

interface BodyRowProps<TData extends RowData> {
  row: Row<DataTableFeatures, TData>
  onRowClick?: (row: TData) => void
  style?: React.CSSProperties
}

function BodyRow<TData extends RowData>({ row, onRowClick, style }: BodyRowProps<TData>) {
  return (
    <TableRow
      selected={row.getIsSelected()}
      interactive={!!onRowClick}
      style={style}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      onKeyDown={
        onRowClick
          ? (event) => {
              if (event.key === 'Enter' && event.target === event.currentTarget)
                onRowClick(row.original)
            }
          : undefined
      }
      tabIndex={onRowClick ? 0 : undefined}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta
        return (
          <TableCell
            key={cell.id}
            align={meta?.align}
            numeric={meta?.numeric}
            className={cellClasses(meta)}
            onClick={cell.column.id === '__select' ? (event) => event.stopPropagation() : undefined}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

export interface DataTableProps<TData extends RowData> {
  table: DataTableInstance<TData>
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  /** Rendered when there are no rows and no error. */
  empty?: ReactNode
  onRowClick?: (row: TData) => void
  density?: 'comfortable' | 'compact'
  /** Virtualise the body — use for large client-side datasets (hundreds+ rows). */
  virtualize?: boolean
  /** Height of the scroll container when virtualised. */
  maxHeight?: number | string
  className?: string
  caption?: string
}

/**
 * Data-heavy table for admin screens: sorting, selection, column visibility,
 * pagination and loading/empty/error states, driven by `useDataTable`.
 * Compose with `DataTableToolbar`, `DataTableSelectionBar` and `DataTablePagination`.
 */
export function DataTable<TData extends RowData>({
  table,
  loading = false,
  error,
  onRetry,
  empty,
  onRowClick,
  density = 'comfortable',
  virtualize = false,
  maxHeight = 560,
  className,
  caption,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length
  const scrollRef = useRef<HTMLDivElement>(null)
  const rowHeight = density === 'compact' ? 40 : 52
  const virtualizer = useVirtualizer({
    count: virtualize ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  })
  const virtualItems = virtualize ? virtualizer.getVirtualItems() : []
  const showSkeleton = loading && rows.length === 0
  const showError = !!error && !loading
  const showEmpty = !loading && !error && rows.length === 0

  const header = (
    <TableHeader className={cn(virtualize && 'sticky top-0 z-10')}>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id} className="hover:bg-transparent">
          {group.headers.map((h) => (
            <HeaderCell key={h.id} header={h} />
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )

  return (
    <TableContainer
      ref={scrollRef}
      className={cn(
        'relative',
        loading && rows.length > 0 && 'opacity-70 transition-opacity',
        className,
      )}
      style={virtualize ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      <Table density={density} aria-busy={loading || undefined}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {header}
        <TableBody>
          {showSkeleton &&
            Array.from({ length: 8 }, (_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {Array.from({ length: columnCount }, (_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton
                      shape="text"
                      className={cellIndex === 0 ? 'w-24' : 'w-full max-w-32'}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {showError && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount}>
                <ErrorState size="sm" onRetry={onRetry} />
              </TableCell>
            </TableRow>
          )}
          {showEmpty && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount}>
                {empty ?? (
                  <EmptyState
                    size="sm"
                    icon={<Inbox />}
                    title="Nothing here yet"
                    description="Try changing your filters."
                  />
                )}
              </TableCell>
            </TableRow>
          )}
          {!showSkeleton &&
            !showError &&
            !virtualize &&
            rows.map((row) => <BodyRow key={row.id} row={row} onRowClick={onRowClick} />)}
          {!showSkeleton && !showError && virtualize && (
            <>
              {virtualItems[0] && <tr aria-hidden style={{ height: virtualItems[0].start }} />}
              {virtualItems.map((item) => {
                const row = rows[item.index]
                return row ? (
                  <BodyRow
                    key={row.id}
                    row={row}
                    onRowClick={onRowClick}
                    style={{ height: item.size }}
                  />
                ) : null
              })}
              {virtualItems.length > 0 && (
                <tr
                  aria-hidden
                  style={{ height: virtualizer.getTotalSize() - (virtualItems.at(-1)?.end ?? 0) }}
                />
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export interface DataTableToolbarProps extends ComponentPropsWithoutRef<'div'> {
  /** Search input, filters. */
  children?: ReactNode
  /** Right-aligned actions: column toggle, export, create. */
  actions?: ReactNode
}

export function DataTableToolbar({
  className,
  children,
  actions,
  ...props
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export interface DataTableColumnToggleProps<TData extends RowData> {
  table: DataTableInstance<TData>
  label?: string
}

/** Dropdown to show/hide columns. */
export function DataTableColumnToggle<TData extends RowData>({
  table,
  label = 'Columns',
}: DataTableColumnToggleProps<TData>) {
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide())
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" leadingIcon={<Columns3 />} />}
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Toggle columns</DropdownMenuGroupLabel>
          {columns.map((column) => {
            const headerLabel =
              column.columnDef.meta?.label ??
              (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
                closeOnClick={false}
              >
                {headerLabel}
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface DataTableSelectionBarProps<TData extends RowData> {
  table: DataTableInstance<TData>
  /** Bulk actions for the selected rows. */
  children: ReactNode
  className?: string
}

/** Appears when rows are selected; hosts bulk actions. */
export function DataTableSelectionBar<TData extends RowData>({
  table,
  children,
  className,
}: DataTableSelectionBarProps<TData>) {
  const selected = table.getSelectedRowIds().length
  if (selected === 0) return null
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Bulk actions"
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-brand-300 bg-primary-muted/50 px-3 py-2 text-sm',
        className,
      )}
    >
      <span className="font-medium text-text">{selected} selected</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={() => table.resetRowSelection(true)}
      >
        Clear
      </Button>
    </div>
  )
}

export interface DataTablePaginationProps<TData extends RowData> {
  table: DataTableInstance<TData>
  className?: string
  pageSizeOptions?: number[]
}

/** Pagination footer with a page-size select and a "showing x–y of z" summary. */
export function DataTablePagination<TData extends RowData>({
  table,
  className,
  pageSizeOptions,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination
  const total = table.getRowCount()
  const pageCount = Math.max(1, table.getPageCount())
  const start = total === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(total, (pageIndex + 1) * pageSize)
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <PageSizeSelect
          pageSize={pageSize}
          onPageSizeChange={(size) => table.setPageSize(size)}
          options={pageSizeOptions}
        />
        <p className="text-sm text-text-muted tabular" aria-live="polite">
          {total === 0 ? 'No results' : `${start}–${end} of ${total.toLocaleString('en-IN')}`}
        </p>
      </div>
      <Pagination
        page={pageIndex + 1}
        totalPages={pageCount}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />
    </div>
  )
}

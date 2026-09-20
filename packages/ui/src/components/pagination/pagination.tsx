import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '../../lib/cn'
import { Button, IconButton } from '../button'
import { Select } from '../select'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /** Show first/last page buttons and numbered pages (desktop). */
  showNumbers?: boolean
  /** Max numbered buttons to show. */
  siblingCount?: number
}

function pageRange(page: number, totalPages: number, siblingCount: number): Array<number | 'gap'> {
  const total = Math.max(1, totalPages)
  const windowSize = siblingCount * 2 + 5
  if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1)
  const left = Math.max(2, page - siblingCount)
  const right = Math.min(total - 1, page + siblingCount)
  const items: Array<number | 'gap'> = [1]
  if (left > 2) items.push('gap')
  for (let i = left; i <= right; i++) items.push(i)
  if (right < total - 1) items.push('gap')
  items.push(total)
  return items
}

/** Page navigation. Keep `page` in the URL so tables are shareable. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  showNumbers = true,
  siblingCount = 1,
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages)
  const current = Math.min(Math.max(1, page), safeTotal)
  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      <IconButton
        aria-label="Previous page"
        icon={<ChevronLeft />}
        variant="outline"
        size="sm"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      />
      {showNumbers ? (
        <ul className="hidden items-center gap-1 sm:flex">
          {pageRange(current, safeTotal, siblingCount).map((item, index) =>
            item === 'gap' ? (
              <li key={`gap-${index}`} aria-hidden className="px-1 text-text-subtle">
                …
              </li>
            ) : (
              <li key={item}>
                <Button
                  size="sm"
                  variant={item === current ? 'secondary' : 'ghost'}
                  aria-current={item === current ? 'page' : undefined}
                  aria-label={`Page ${item}`}
                  className="min-w-8 px-2 tabular"
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              </li>
            ),
          )}
        </ul>
      ) : null}
      <span className={cn('px-2 text-sm text-text-muted tabular', showNumbers && 'sm:hidden')}>
        {current} / {safeTotal}
      </span>
      <IconButton
        aria-label="Next page"
        icon={<ChevronRight />}
        variant="outline"
        size="sm"
        disabled={current >= safeTotal}
        onClick={() => onPageChange(current + 1)}
      />
    </nav>
  )
}

export interface PageSizeSelectProps {
  pageSize: number
  onPageSizeChange: (size: number) => void
  options?: number[]
  className?: string
}

export function PageSizeSelect({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  className,
}: PageSizeSelectProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-text-muted', className)}>
      <span className="hidden sm:inline">Rows per page</span>
      <Select
        aria-label="Rows per page"
        size="sm"
        className="w-20"
        value={String(pageSize)}
        onValueChange={(value) => value && onPageSizeChange(Number(value))}
        options={options.map((n) => ({ value: String(n), label: String(n) }))}
      />
    </div>
  )
}

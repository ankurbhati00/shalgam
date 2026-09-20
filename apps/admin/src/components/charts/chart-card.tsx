import { getErrorMessage } from '@shalgam/api-client'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@shalgam/ui'
import type { ReactNode } from 'react'

import { ChartTable, type ChartTableData } from './chart-table'

export interface ChartCardProps {
  title: string
  description?: string
  actions?: ReactNode
  /** Rendered above the plot; required for two or more series. */
  legend?: ReactNode
  /** Initial load: no data yet. */
  loading?: boolean
  /** Refetch with data on screen: hold the render at reduced opacity. */
  fetching?: boolean
  error?: unknown
  onRetry?: () => void
  isEmpty?: boolean
  emptyMessage?: string
  /** Plot height in px, or `'auto'` for content that sizes itself (lists). */
  height?: number | 'auto'
  /** Table twin of the plot for assistive tech (and a `visible` toggle if wanted). */
  table?: ChartTableData
  children: ReactNode
  className?: string
}

/** Titled, described chart surface with loading / empty / error states and an accessible table twin. */
export function ChartCard({
  title,
  description,
  actions,
  legend,
  loading = false,
  fetching = false,
  error,
  onRetry,
  isEmpty = false,
  emptyMessage = 'No data for this period.',
  height = 240,
  table,
  children,
  className,
}: ChartCardProps) {
  const ariaLabel = description ? `${title}. ${description}` : title
  return (
    <Card
      padding="md"
      className={cn('flex min-w-0 flex-col', className)}
      aria-busy={loading || fetching || undefined}
    >
      <CardHeader actions={actions}>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {legend && !loading && !error && !isEmpty && <div className="mt-3">{legend}</div>}
      <div className={cn('mt-3 min-w-0 transition-opacity', fetching && !loading && 'opacity-60')}>
        {loading ? (
          <Skeleton className="w-full" style={{ height: height === 'auto' ? 160 : height }} />
        ) : error ? (
          <ErrorState size="sm" description={getErrorMessage(error)} onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState size="sm" title="Nothing to chart" description={emptyMessage} />
        ) : (
          <>
            <div
              role={height === 'auto' ? undefined : 'img'}
              aria-label={height === 'auto' ? undefined : ariaLabel}
              style={height === 'auto' ? undefined : { height }}
              className="w-full min-w-0"
            >
              {children}
            </div>
            {table && <ChartTable data={table} />}
          </>
        )}
      </div>
    </Card>
  )
}

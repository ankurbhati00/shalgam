import type { AnalyticsSeries, OrderStatus } from '@shalgam/types'
import { orderStatusMap, ProductImage } from '@shalgam/ui'
import { formatDate, formatDuration, formatINR, formatNumber, truncate } from '@shalgam/utils'
import { Link } from 'react-router'

import { useUiStore } from '../../../app/store/ui-store'
import {
  ChartCard,
  ChartLegend,
  HorizontalBarChart,
  orderStageRamp,
  seriesColors,
  ShareBar,
  StackedBarChart,
  statusColors,
  TimeSeriesChart,
} from '../../../components/charts'
import { formatCompactINR, formatCompactNumber } from '../../../lib/format'

interface SeriesChartProps {
  series: AnalyticsSeries | undefined
  loading: boolean
  fetching: boolean
  error: unknown
  onRetry: () => void
  granularity?: 'day' | 'week'
}

function dateLabel(granularity: 'day' | 'week' | undefined) {
  return (date: string) =>
    granularity === 'week' ? `Wk of ${formatDate(date, 'short')}` : formatDate(date, 'short')
}

export function RevenueTrendChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
  granularity,
}: SeriesChartProps) {
  const points = series?.timeSeries ?? []
  return (
    <ChartCard
      title="Revenue"
      description={`Completed order value per ${granularity === 'week' ? 'week' : 'day'}.`}
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={points.length === 0}
      table={{
        caption: 'Revenue by date',
        columns: [
          { key: 'date', label: 'Date', format: (value) => formatDate(String(value)) },
          { key: 'revenue', label: 'Revenue', format: (value) => formatINR(Number(value)) },
        ],
        rows: points,
      }}
    >
      <TimeSeriesChart
        data={points.map((point) => ({ date: point.date, value: point.revenue }))}
        name="Revenue"
        kind="area"
        formatValue={(value) => formatINR(value)}
        formatAxis={formatCompactINR}
        formatDateLabel={dateLabel(granularity)}
      />
    </ChartCard>
  )
}

export function OrdersTrendChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
  granularity,
}: SeriesChartProps) {
  const points = series?.timeSeries ?? []
  return (
    <ChartCard
      title="Orders"
      description={`Orders placed per ${granularity === 'week' ? 'week' : 'day'}, including cancellations.`}
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={points.length === 0}
      table={{
        caption: 'Orders by date',
        columns: [
          { key: 'date', label: 'Date', format: (value) => formatDate(String(value)) },
          { key: 'orders', label: 'Orders' },
        ],
        rows: points,
      }}
    >
      <TimeSeriesChart
        data={points.map((point) => ({ date: point.date, value: point.orders }))}
        name="Orders"
        kind="line"
        formatValue={(value) => formatNumber(value)}
        formatAxis={formatCompactNumber}
        formatDateLabel={dateLabel(granularity)}
      />
    </ChartCard>
  )
}

export function SalesByCategoryChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
}: SeriesChartProps) {
  const rows = (series?.salesByCategory ?? []).slice(0, 8)
  return (
    <ChartCard
      title="Sales by category"
      description="Revenue from completed orders, top eight categories."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      height={Math.max(160, rows.length * 34 + 16)}
      table={{
        caption: 'Revenue by category',
        columns: [
          { key: 'categoryName', label: 'Category' },
          { key: 'revenue', label: 'Revenue', format: (value) => formatINR(Number(value)) },
          { key: 'orders', label: 'Orders' },
          { key: 'share', label: 'Share', format: (value) => `${Number(value).toFixed(1)}%` },
        ],
        rows,
      }}
    >
      <HorizontalBarChart
        data={rows.map((row) => ({ label: row.categoryName, value: row.revenue }))}
        name="Revenue"
        formatValue={formatCompactINR}
        labelWidth={132}
      />
    </ChartCard>
  )
}

export function TopProductsList({ series, loading, fetching, error, onRetry }: SeriesChartProps) {
  const products = series?.topProducts ?? []
  const max = Math.max(1, ...products.map((product) => product.revenue))
  return (
    <ChartCard
      title="Top products"
      description="By revenue in the period."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={products.length === 0}
      height="auto"
    >
      <ol className="divide-y divide-border-subtle">
        {products.map((product, index) => (
          <li key={product.productId} className="flex items-center gap-3 py-1.5 first:pt-0">
            <span className="w-4 shrink-0 text-xs text-text-subtle tabular">{index + 1}</span>
            <ProductImage src={product.imageUrl} alt="" className="size-8 shrink-0" rounded="md" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <Link
                  to={`/products/${product.productId}/edit`}
                  className="truncate rounded-xs text-sm font-medium text-text focus-ring hover:underline"
                >
                  {product.name}
                </Link>
                <span className="shrink-0 text-sm font-semibold text-text tabular">
                  {formatINR(product.revenue)}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(product.revenue / max) * 100}%`,
                      backgroundColor: seriesColors.primary,
                    }}
                  />
                </span>
                <span className="w-16 shrink-0 text-end text-xs text-text-muted tabular">
                  {formatNumber(product.unitsSold)} sold
                </span>
              </span>
            </span>
          </li>
        ))}
      </ol>
    </ChartCard>
  )
}

const STAGES: readonly OrderStatus[] = [
  'placed',
  'preparing',
  'packed',
  'out_for_delivery',
  'delivered',
]

export function StatusDistributionChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
}: SeriesChartProps) {
  const theme = useUiStore((state) => state.theme)
  const ramp = orderStageRamp(theme)
  const distribution = series?.statusDistribution ?? []
  const total = distribution.reduce((acc, point) => acc + point.count, 0)
  const segments = distribution.map((point) => {
    const stageIndex = STAGES.indexOf(point.status)
    return {
      key: point.status,
      label: orderStatusMap[point.status].label,
      value: point.count,
      color: stageIndex === -1 ? seriesColors.muted : (ramp[stageIndex] ?? seriesColors.primary),
    }
  })
  return (
    <ChartCard
      title="Order status"
      description="Where every order in the period sits right now. Stages darken toward delivered; cancelled is grey."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={total === 0}
      height={96}
      table={{
        caption: 'Orders by status',
        columns: [
          {
            key: 'status',
            label: 'Status',
            format: (value) => orderStatusMap[value as OrderStatus].label,
          },
          { key: 'count', label: 'Orders' },
        ],
        rows: distribution,
      }}
    >
      <ShareBar
        segments={segments}
        ariaLabel={`Order status distribution across ${formatNumber(total)} orders`}
      />
    </ChartCard>
  )
}

const DELIVERY_SERIES = [
  { key: 'onTime', label: 'On time', color: statusColors.good },
  { key: 'delayed', label: 'Delayed', color: statusColors.warning },
  { key: 'failed', label: 'Cancelled / failed', color: statusColors.bad },
]

export function DeliveryPerformanceChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
  granularity,
}: SeriesChartProps) {
  const points = series?.deliveryPerformance ?? []
  return (
    <ChartCard
      title="Delivery performance"
      description="Delivered orders on time versus delayed, plus cancellations."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={points.length === 0}
      legend={<ChartLegend items={DELIVERY_SERIES} />}
      table={{
        caption: 'Delivery performance by date',
        columns: [
          { key: 'date', label: 'Date', format: (value) => formatDate(String(value)) },
          { key: 'onTime', label: 'On time' },
          { key: 'delayed', label: 'Delayed' },
          { key: 'failed', label: 'Cancelled / failed' },
          { key: 'averageMinutes', label: 'Avg. minutes' },
        ],
        rows: points,
      }}
    >
      <StackedBarChart
        data={points}
        xKey="date"
        series={DELIVERY_SERIES}
        formatValue={(value) => formatNumber(value)}
        formatX={dateLabel(granularity)}
      />
    </ChartCard>
  )
}

export function DeliveryTimeChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
  granularity,
}: SeriesChartProps) {
  const points = (series?.deliveryPerformance ?? []).map((point) => ({
    date: point.date,
    value: point.averageMinutes,
  }))
  return (
    <ChartCard
      title="Average delivery time"
      description="Minutes from order placed to delivered."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={points.length === 0}
      table={{
        caption: 'Average delivery minutes by date',
        columns: [
          { key: 'date', label: 'Date', format: (value) => formatDate(String(value)) },
          { key: 'value', label: 'Average minutes' },
        ],
        rows: points,
      }}
    >
      <TimeSeriesChart
        data={points}
        name="Avg. delivery time"
        kind="line"
        color={seriesColors.secondary}
        formatValue={(value) => formatDuration(value)}
        formatAxis={(value) => `${value}m`}
        formatDateLabel={dateLabel(granularity)}
      />
    </ChartCard>
  )
}

const CUSTOMER_SERIES = [
  { key: 'newCustomers', label: 'New customers', color: seriesColors.primary },
  { key: 'returningCustomers', label: 'Returning customers', color: seriesColors.secondary },
]

export function CustomerTrendChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
  granularity,
}: SeriesChartProps) {
  const points = series?.customerTrend ?? []
  return (
    <ChartCard
      title="New vs returning customers"
      description="Unique customers who ordered, split by whether it was their first order."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={points.length === 0}
      legend={<ChartLegend items={CUSTOMER_SERIES} />}
      table={{
        caption: 'Customers by date',
        columns: [
          { key: 'date', label: 'Date', format: (value) => formatDate(String(value)) },
          { key: 'newCustomers', label: 'New' },
          { key: 'returningCustomers', label: 'Returning' },
        ],
        rows: points,
      }}
    >
      <StackedBarChart
        data={points}
        xKey="date"
        series={CUSTOMER_SERIES}
        formatValue={(value) => formatNumber(value)}
        formatX={dateLabel(granularity)}
      />
    </ChartCard>
  )
}

export function CancellationReasonsChart({
  series,
  loading,
  fetching,
  error,
  onRetry,
}: SeriesChartProps) {
  const reasons = series?.cancellationReasons ?? []
  return (
    <ChartCard
      title="Cancellation reasons"
      description="Why orders were cancelled in the period."
      loading={loading}
      fetching={fetching}
      error={error}
      onRetry={onRetry}
      isEmpty={reasons.length === 0}
      emptyMessage="No cancellations in this period."
      height={Math.max(140, reasons.length * 34 + 16)}
      table={{
        caption: 'Cancellations by reason',
        columns: [
          { key: 'reason', label: 'Reason' },
          { key: 'count', label: 'Orders' },
          { key: 'share', label: 'Share', format: (value) => `${Number(value).toFixed(1)}%` },
        ],
        rows: reasons,
      }}
    >
      <HorizontalBarChart
        data={reasons.map((reason) => ({
          label: truncate(reason.reason, 26),
          value: reason.count,
        }))}
        name="Cancelled orders"
        formatValue={(value) => formatNumber(value)}
        color={seriesColors.muted}
        labelWidth={176}
      />
    </ChartCard>
  )
}

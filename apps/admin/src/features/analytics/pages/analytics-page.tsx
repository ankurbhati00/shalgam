import {
  Card,
  CardHeader,
  CardTitle,
  PillTab,
  Select,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
} from '@shalgam/ui'
import { formatINR, formatNumber } from '@shalgam/utils'

import { DateRangeFilter } from '../../../components/filters/date-range-filter'
import { FilterBar } from '../../../components/filters/filter-bar'
import { PageHeader } from '../../../components/page-header'
import { comparisonLabel } from '../../../lib/date-range'
import { formatRate } from '../../../lib/format'
import { useCategoryOptions } from '../../categories/hooks/use-category-options'
import { useAnalyticsOverview, useAnalyticsSeries } from '../api/queries'
import {
  CancellationReasonsChart,
  CustomerTrendChart,
  DeliveryPerformanceChart,
  DeliveryTimeChart,
  OrdersTrendChart,
  RevenueTrendChart,
  SalesByCategoryChart,
  TopProductsList,
} from '../components/analytics-charts'
import { KpiGrid } from '../components/kpi-grid'
import { useAnalyticsParams } from '../hooks/use-analytics-params'

function SectionHeading({ children }: { children: string }) {
  return <h2 className="text-base font-semibold text-text">{children}</h2>
}

export function AnalyticsPage() {
  const filters = useAnalyticsParams()
  const { options: categoryOptions } = useCategoryOptions()
  const overview = useAnalyticsOverview(filters.params)
  const series = useAnalyticsSeries(filters.params)
  const chartProps = {
    series: series.data,
    loading: series.isPending,
    fetching: series.isFetching,
    error: series.isError ? series.error : undefined,
    onRetry: () => void series.refetch(),
    granularity: filters.granularity,
  }
  const categories = series.data?.salesByCategory ?? []
  const cancellationRate = overview.data?.kpis.cancellationRate
  const cancelledCount =
    series.data?.statusDistribution.find((point) => point.status === 'cancelled')?.count ?? 0

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Trends across sales, customers and delivery. Every chart below follows the filters."
      >
        <FilterBar>
          <DateRangeFilter
            choice={filters.choice}
            range={filters.range}
            onChange={filters.setRange}
          />
          <Select
            aria-label="Category"
            size="sm"
            className="w-48"
            options={[{ value: '__all', label: 'All categories' }, ...categoryOptions]}
            value={filters.categoryId ?? '__all'}
            onValueChange={(value) =>
              filters.setCategory(value && value !== '__all' ? value : null)
            }
          />
          <Tabs
            value={filters.granularity}
            onValueChange={(value) => filters.setGranularity(value === 'week' ? 'week' : 'day')}
          >
            <TabsList variant="pills" aria-label="Granularity">
              <PillTab value="day">Daily</PillTab>
              <PillTab value="week">Weekly</PillTab>
            </TabsList>
          </Tabs>
        </FilterBar>
      </PageHeader>

      <div className="space-y-8">
        <KpiGrid
          overview={overview.data}
          loading={overview.isPending}
          changeLabel={comparisonLabel(filters.range)}
        />

        <section className="space-y-3" aria-labelledby="trends-heading">
          <SectionHeading>Revenue & order trends</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueTrendChart {...chartProps} />
            <OrdersTrendChart {...chartProps} />
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Category performance</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <SalesByCategoryChart {...chartProps} />
            <Card padding="none">
              <CardHeader className="px-4 pt-4 sm:px-5">
                <CardTitle>Category table</CardTitle>
              </CardHeader>
              <TableContainer className="mt-3 rounded-none border-x-0 border-b-0">
                <Table density="compact">
                  <caption className="sr-only">Revenue, orders and share by category</caption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead align="end">Revenue</TableHead>
                      <TableHead align="end">Orders</TableHead>
                      <TableHead align="end">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((row) => (
                      <TableRow key={row.categoryId}>
                        <TableCell className="font-medium">{row.categoryName}</TableCell>
                        <TableCell align="end" numeric>
                          {formatINR(row.revenue)}
                        </TableCell>
                        <TableCell align="end" numeric>
                          {formatNumber(row.orders)}
                        </TableCell>
                        <TableCell align="end" numeric>
                          {row.share.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {!series.isPending && categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-text-muted">
                          No sales in this period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Product performance</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <TopProductsList {...chartProps} />
            <CustomerTrendChart {...chartProps} />
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Delivery performance</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <DeliveryPerformanceChart {...chartProps} />
            <DeliveryTimeChart {...chartProps} />
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Cancellation analysis</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="grid gap-3">
              <StatCard
                label="Cancellation rate"
                value={cancellationRate ? formatRate(cancellationRate.value) : '—'}
                changePercent={cancellationRate?.changePercent}
                changeLabel={comparisonLabel(filters.range)}
                positiveIsGood={false}
                loading={overview.isPending}
              />
              <StatCard
                label="Cancelled orders"
                value={formatNumber(cancelledCount)}
                loading={series.isPending}
              />
            </div>
            <CancellationReasonsChart {...chartProps} />
          </div>
        </section>
      </div>
    </>
  )
}

export const route = {
  Component: AnalyticsPage,
  handle: { title: 'Analytics' },
}

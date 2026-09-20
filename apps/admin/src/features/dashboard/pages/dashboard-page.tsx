import { PillTab, Tabs, TabsList } from '@shalgam/ui'
import { formatDate } from '@shalgam/utils'

import { PageHeader } from '../../../components/page-header'
import { comparisonLabel, isRangePreset, RANGE_PRESETS } from '../../../lib/date-range'
import { useAnalyticsOverview, useAnalyticsSeries } from '../../analytics/api/queries'
import {
  DeliveryPerformanceChart,
  OrdersTrendChart,
  RevenueTrendChart,
  SalesByCategoryChart,
  StatusDistributionChart,
  TopProductsList,
} from '../../analytics/components/analytics-charts'
import { KpiGrid } from '../../analytics/components/kpi-grid'
import { RecentOrders } from '../components/recent-orders'
import { useDashboardRange } from '../hooks/use-dashboard-range'

export function DashboardPage() {
  const { preset, range, params, setPreset } = useDashboardRange()
  const overview = useAnalyticsOverview(params)
  const series = useAnalyticsSeries(params)
  const chartProps = {
    series: series.data,
    loading: series.isPending,
    fetching: series.isFetching,
    error: series.isError ? series.error : undefined,
    onRetry: () => void series.refetch(),
    granularity: params.granularity,
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${formatDate(range.from)} – ${formatDate(range.to)} · Bengaluru`}
        actions={
          <Tabs
            value={preset}
            onValueChange={(value) =>
              isRangePreset(String(value)) && setPreset(value as typeof preset)
            }
          >
            <TabsList variant="pills" aria-label="Period">
              {RANGE_PRESETS.map((option) => (
                <PillTab key={option.value} value={option.value}>
                  {option.days}d
                </PillTab>
              ))}
            </TabsList>
          </Tabs>
        }
      />
      <div className="space-y-4">
        <KpiGrid
          overview={overview.data}
          loading={overview.isPending}
          changeLabel={comparisonLabel(range)}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueTrendChart {...chartProps} />
          <OrdersTrendChart {...chartProps} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SalesByCategoryChart {...chartProps} />
          <TopProductsList {...chartProps} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <StatusDistributionChart {...chartProps} />
          <DeliveryPerformanceChart {...chartProps} />
        </div>
        <RecentOrders />
      </div>
    </>
  )
}

export const route = {
  Component: DashboardPage,
  handle: { title: 'Dashboard' },
}

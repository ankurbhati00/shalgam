import type { AnalyticsOverview } from '@shalgam/types'
import { StatCard } from '@shalgam/ui'
import { formatINR, formatNumber } from '@shalgam/utils'
import { ClipboardList, IndianRupee, Receipt, Truck, UsersRound, XCircle } from 'lucide-react'

import { formatRate } from '../../../lib/format'

export interface KpiGridProps {
  overview: AnalyticsOverview | undefined
  loading: boolean
  changeLabel: string
}

/** The six headline KPIs shared by the dashboard and analytics pages. */
export function KpiGrid({ overview, loading, changeLabel }: KpiGridProps) {
  const kpis = overview?.kpis
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total orders"
        value={kpis ? formatNumber(kpis.totalOrders.value) : '—'}
        changePercent={kpis?.totalOrders.changePercent}
        changeLabel={changeLabel}
        loading={loading}
        icon={<ClipboardList />}
      />
      <StatCard
        label="Revenue"
        value={kpis ? formatINR(kpis.revenue.value) : '—'}
        changePercent={kpis?.revenue.changePercent}
        changeLabel={changeLabel}
        loading={loading}
        icon={<IndianRupee />}
        emphasis
      />
      <StatCard
        label="Average order value"
        value={kpis ? formatINR(kpis.averageOrderValue.value) : '—'}
        changePercent={kpis?.averageOrderValue.changePercent}
        changeLabel={changeLabel}
        loading={loading}
        icon={<Receipt />}
      />
      <StatCard
        label="Active customers"
        value={kpis ? formatNumber(kpis.activeCustomers.value) : '—'}
        changePercent={kpis?.activeCustomers.changePercent}
        changeLabel={changeLabel}
        loading={loading}
        icon={<UsersRound />}
      />
      <StatCard
        label="Cancellation rate"
        value={kpis ? formatRate(kpis.cancellationRate.value) : '—'}
        changePercent={kpis?.cancellationRate.changePercent}
        changeLabel={changeLabel}
        positiveIsGood={false}
        loading={loading}
        icon={<XCircle />}
      />
      <StatCard
        label="Delivery success"
        value={kpis ? formatRate(kpis.deliverySuccessRate.value) : '—'}
        changePercent={kpis?.deliverySuccessRate.changePercent}
        changeLabel={changeLabel}
        loading={loading}
        icon={<Truck />}
      />
    </div>
  )
}

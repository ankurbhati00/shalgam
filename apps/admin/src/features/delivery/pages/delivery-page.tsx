import { StatCard, Tab, Tabs, TabsList } from '@shalgam/ui'
import { formatDuration, formatNumber } from '@shalgam/utils'
import { Bike, CircleCheck, Timer, TriangleAlert } from 'lucide-react'

import { PageHeader } from '../../../components/page-header'
import { formatRate } from '../../../lib/format'
import { useDeliveryStats } from '../api/queries'
import { DeliveriesTable } from '../components/deliveries-table'
import { PartnerRoster } from '../components/partner-roster'
import { DELIVERY_TABS, useDeliveryParams } from '../hooks/use-delivery-params'

function StatsRow() {
  const { data, isPending } = useDeliveryStats()
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatCard
        label="Active now"
        value={data ? formatNumber(data.active) : '—'}
        loading={isPending}
        icon={<Bike />}
      />
      <StatCard
        label="Delayed"
        value={data ? formatNumber(data.delayed) : '—'}
        loading={isPending}
        icon={<TriangleAlert />}
      />
      <StatCard
        label="Completed today"
        value={data ? formatNumber(data.completedToday) : '—'}
        loading={isPending}
        icon={<CircleCheck />}
      />
      <StatCard
        label="Avg. delivery time"
        value={data ? formatDuration(data.averageMinutes) : '—'}
        loading={isPending}
        icon={<Timer />}
      />
      <StatCard
        label="On-time rate (7d)"
        value={data ? formatRate(data.onTimeRate) : '—'}
        loading={isPending}
        className="col-span-2 md:col-span-1"
      />
    </div>
  )
}

export function DeliveryPage() {
  const { tab, setTab } = useDeliveryParams()
  return (
    <>
      <PageHeader
        title="Delivery"
        description="Live deliveries, what is running late, and who is on shift."
      />
      <div className="space-y-5">
        <StatsRow />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <Tabs
            value={tab}
            onValueChange={(value) => {
              const next = DELIVERY_TABS.find((option) => option.value === value)
              if (next) setTab(next.value)
            }}
          >
            <TabsList aria-label="Delivery views">
              {DELIVERY_TABS.map((option) => (
                <Tab key={option.value} value={option.value}>
                  {option.label}
                </Tab>
              ))}
            </TabsList>
            <DeliveriesTable />
          </Tabs>
          <PartnerRoster />
        </div>
      </div>
    </>
  )
}

export const route = {
  Component: DeliveryPage,
  handle: { title: 'Delivery' },
}

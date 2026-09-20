import { PillTab, Tabs, TabsList } from '@shalgam/ui'

import { PageHeader } from '../../../components/page-header'
import { OrdersTable } from '../components/orders-table'
import { ORDER_QUICK_FILTERS, useOrderListParams } from '../hooks/use-order-list-params'

function QuickFilters() {
  const { quickFilter, setQuickFilter } = useOrderListParams()
  return (
    <Tabs
      value={quickFilter}
      onValueChange={(value) => {
        const option = ORDER_QUICK_FILTERS.find((item) => item.value === value)
        if (option) setQuickFilter(option.value)
      }}
    >
      <TabsList variant="pills" scrollable aria-label="Quick status filters">
        {ORDER_QUICK_FILTERS.map((option) => (
          <PillTab key={option.value} value={option.value}>
            {option.label}
          </PillTab>
        ))}
        {quickFilter === 'custom' && (
          <PillTab value="custom" disabled>
            Custom
          </PillTab>
        )}
      </TabsList>
    </Tabs>
  )
}

export function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order across Bengaluru, live. Filter, bulk-update and drill into any order."
      >
        <QuickFilters />
      </PageHeader>
      <OrdersTable />
    </>
  )
}

export const route = {
  Component: OrdersPage,
  handle: { title: 'Orders' },
}

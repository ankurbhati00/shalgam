import { StatCard, Tab, TabPanel, Tabs, TabsList } from '@shalgam/ui'
import { formatINR, formatNumber } from '@shalgam/utils'
import { Boxes, CircleAlert, CircleCheck, IndianRupee, TriangleAlert } from 'lucide-react'

import { PageHeader } from '../../../components/page-header'
import { useInventorySummary } from '../api/queries'
import { MovementsTable } from '../components/movements-table'
import { StockTable } from '../components/stock-table'
import { useInventoryParams } from '../hooks/use-inventory-params'

function SummaryCards() {
  const { data, isPending } = useInventorySummary()
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Total SKUs"
        value={data ? formatNumber(data.totalSkus) : '—'}
        loading={isPending}
        icon={<Boxes />}
      />
      <StatCard
        label="In stock"
        value={data ? formatNumber(data.inStock) : '—'}
        loading={isPending}
        icon={<CircleCheck />}
      />
      <StatCard
        label="Low stock"
        value={data ? formatNumber(data.lowStock) : '—'}
        loading={isPending}
        icon={<TriangleAlert />}
      />
      <StatCard
        label="Out of stock"
        value={data ? formatNumber(data.outOfStock) : '—'}
        loading={isPending}
        icon={<CircleAlert />}
      />
      <StatCard
        label="Stock value"
        value={data ? formatINR(data.stockValue) : '—'}
        loading={isPending}
        icon={<IndianRupee />}
        className="col-span-2 md:col-span-1"
      />
    </div>
  )
}

export function InventoryPage() {
  const { tab, setTab } = useInventoryParams()
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Stock on hand, what is reserved for open orders, and every movement in the ledger."
      />
      <div className="space-y-5">
        <SummaryCards />
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value === 'movements' ? 'movements' : 'stock')}
        >
          <TabsList aria-label="Inventory views">
            <Tab value="stock">Stock</Tab>
            <Tab value="movements">Movements</Tab>
          </TabsList>
          <TabPanel value="stock">{tab === 'stock' && <StockTable />}</TabPanel>
          <TabPanel value="movements">{tab === 'movements' && <MovementsTable />}</TabPanel>
        </Tabs>
      </div>
    </>
  )
}

export const route = {
  Component: InventoryPage,
  handle: { title: 'Inventory' },
}

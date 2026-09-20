import type { Meta, StoryObj } from '@storybook/react-vite'
import { IndianRupee, Package, Users } from 'lucide-react'

import { Button } from '../button'
import {
  DeliveryStatus,
  InventoryStatus,
  OrderStatus,
  OrderTimeline,
  PaymentStatus,
} from '../order-status'
import { Progress } from '../progress'
import { EmptyState, ErrorState, LoadingState } from '../states'
import { defineStatusMap, StatusBadge } from '../status-badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'
import { StatCard } from './stat-card'

const meta = {
  title: 'Components/Data/StatCard & Status',
  component: StatCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const StatCards: Story = {
  args: { label: 'Revenue', value: '₹4.2L' },
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Revenue"
        value="₹4,21,830"
        changePercent={12.4}
        changeLabel="vs last 30 days"
        icon={<IndianRupee />}
        emphasis
      />
      <StatCard
        label="Total orders"
        value="1,284"
        changePercent={-3.2}
        changeLabel="vs last 30 days"
        icon={<Package />}
      />
      <StatCard
        label="Cancellation rate"
        value="4.1%"
        changePercent={0.8}
        positiveIsGood={false}
        changeLabel="vs last 30 days"
      />
      <StatCard
        label="Active customers"
        value="312"
        changePercent={null}
        icon={<Users />}
        footer={<Progress size="sm" value={72} aria-label="Retention" />}
      />
      <StatCard label="Loading" value="" loading />
    </div>
  ),
}

const inventoryMap = defineStatusMap<'ok' | 'low' | 'out'>({
  ok: { label: 'Healthy', tone: 'success' },
  low: { label: 'Reorder soon', tone: 'warning' },
  out: { label: 'Out of stock', tone: 'danger' },
})

export const StatusBadges: Story = {
  args: { label: '', value: '' },
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          ['placed', 'preparing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'] as const
        ).map((s) => (
          <OrderStatus key={s} status={s} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(['pending', 'paid', 'failed', 'refunded'] as const).map((s) => (
          <PaymentStatus key={s} status={s} />
        ))}
        {(['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'failed'] as const).map(
          (s) => (
            <DeliveryStatus key={s} status={s} variant="outline" />
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {(['in_stock', 'low_stock', 'out_of_stock'] as const).map((s) => (
          <InventoryStatus key={s} status={s} size="sm" />
        ))}
        <StatusBadge status="low" map={inventoryMap} />
      </div>
    </div>
  ),
}

export const Timeline: Story = {
  args: { label: '', value: '' },
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      <OrderTimeline
        steps={[
          {
            key: 'placed',
            label: 'Order placed',
            description: 'Order confirmed',
            time: '9:41 am',
            state: 'complete',
          },
          {
            key: 'preparing',
            label: 'Preparing your order',
            description: 'Picking your items',
            time: '9:43 am',
            state: 'complete',
          },
          { key: 'packed', label: 'Packed & ready', time: '9:47 am', state: 'complete' },
          {
            key: 'out',
            label: 'Out for delivery',
            description: 'Manjunath K is on the way',
            state: 'current',
          },
          { key: 'delivered', label: 'Delivered', state: 'upcoming' },
        ]}
      />
      <OrderTimeline
        steps={[
          { key: 'placed', label: 'Order placed', time: '8:02 pm', state: 'complete' },
          {
            key: 'cancelled',
            label: 'Cancelled',
            description: 'Items out of stock',
            time: '8:09 pm',
            state: 'failed',
          },
        ]}
      />
    </div>
  ),
}

export const ProgressBars: Story = {
  args: { label: '', value: '' },
  render: () => (
    <div className="max-w-md space-y-4">
      <Progress value={68} label="Stock health" showValue />
      <Progress value={22} max={100} tone="danger" label="Low stock SKUs" showValue size="sm" />
      <Progress value={null} label="Syncing…" tone="info" />
    </div>
  ),
}

export const States: Story = {
  name: 'Empty, Error & Loading states',
  args: { label: '', value: '' },
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-border">
        <EmptyState
          title="No orders yet"
          description="Orders will appear here as soon as customers start shopping."
          action={<Button size="sm">Create order</Button>}
        />
      </div>
      <div className="rounded-xl border border-border">
        <ErrorState onRetry={() => undefined} />
      </div>
      <div className="rounded-xl border border-border">
        <LoadingState />
      </div>
    </div>
  ),
}

export const TablePrimitives: Story = {
  name: 'Table',
  args: { label: '', value: '' },
  render: () => (
    <TableContainer>
      <Table density="compact">
        <TableCaption>Low-stock products</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead align="end">On hand</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ['Gokul Fresh Paneer 200 g', 'Dairy', 3, 'low_stock'],
            ['Alphonso Mango 1 kg', 'Fruits', 0, 'out_of_stock'],
            ['Rasoi Queen Toor Dal 1 kg', 'Staples', 142, 'in_stock'],
          ].map(([name, category, qty, status]) => (
            <TableRow key={String(name)} interactive>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>{category}</TableCell>
              <TableCell align="end" numeric>
                {qty}
              </TableCell>
              <TableCell>
                <InventoryStatus
                  status={status as 'in_stock' | 'low_stock' | 'out_of_stock'}
                  size="sm"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
}

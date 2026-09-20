import { isApiError } from '@shalgam/api-client'
import { customerQueries } from '@shalgam/query'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Heading,
  Skeleton,
  StatCard,
  StatusBadge,
  Text,
} from '@shalgam/ui'
import { formatDate, formatINR, formatNumber } from '@shalgam/utils'
import { Ban, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, type LoaderFunctionArgs, useParams } from 'react-router'

import { DescriptionItem, DescriptionList } from '../../../components/description-list'
import { PageHeader } from '../../../components/page-header'
import { RelativeTime } from '../../../components/relative-time'
import { customerStatusMap, customerTierMap } from '../../../components/status-maps'
import { queryClient } from '../../../lib/query-client'
import { OrdersTable } from '../../orders/components/orders-table'
import { useCustomer, useUpdateCustomerStatus } from '../api/queries'

export function CustomerDetailPage() {
  const { id = '' } = useParams()
  const { data: customer, isPending, error, refetch } = useCustomer(id)
  const updateStatus = useUpdateCustomerStatus()
  const [confirmBlock, setConfirmBlock] = useState(false)

  if (error) {
    return isApiError(error) && error.isNotFound ? (
      <EmptyState
        title="Customer not found"
        action={
          <Button variant="outline" render={<Link to="/customers" />}>
            Back to customers
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void refetch()} />
    )
  }

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  const blocked = customer.status === 'blocked'

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.joinedAt)} · ${customer.city}`}
        actions={
          blocked ? (
            <Button
              variant="outline"
              leadingIcon={<ShieldCheck />}
              loading={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: customer.id, status: 'active' })}
            >
              Unblock customer
            </Button>
          ) : (
            <Button
              variant="danger-outline"
              leadingIcon={<Ban />}
              onClick={() => setConfirmBlock(true)}
            >
              Block customer
            </Button>
          )
        }
      />
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={customer.name} src={customer.avatarUrl} size="xl" />
            <div className="min-w-0">
              <Heading level={2} size="sm" className="truncate">
                {customer.name}
              </Heading>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <StatusBadge status={customer.tier} map={customerTierMap} size="sm" />
                <StatusBadge status={customer.status} map={customerStatusMap} size="sm" />
              </div>
            </div>
          </div>
          <DescriptionList className="mt-5">
            <DescriptionItem label="Email">
              <a
                href={`mailto:${customer.email}`}
                className="truncate rounded-xs focus-ring hover:underline"
              >
                {customer.email}
              </a>
            </DescriptionItem>
            <DescriptionItem label="Phone">
              <span className="tabular">{customer.phone}</span>
            </DescriptionItem>
            <DescriptionItem label="City">{customer.city}</DescriptionItem>
            <DescriptionItem label="Joined">{formatDate(customer.joinedAt)}</DescriptionItem>
            <DescriptionItem label="Last order">
              <RelativeTime value={customer.lastOrderAt} />
            </DescriptionItem>
          </DescriptionList>
          {blocked && (
            <Text size="xs" tone="danger" className="mt-4">
              Blocked customers cannot place new orders.
            </Text>
          )}
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard label="Orders" value={formatNumber(customer.ordersCount)} />
            <StatCard label="Total spent" value={formatINR(customer.totalSpent)} />
            <StatCard label="Average order" value={formatINR(customer.averageOrderValue)} />
            <StatCard
              label="Last order"
              value={customer.lastOrderAt ? formatDate(customer.lastOrderAt, 'short') : '—'}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Order history</CardTitle>
            </CardHeader>
            <div className="mt-4">
              <OrdersTable baseParams={{ customerId: customer.id }} hideCustomer compact />
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        tone="danger"
        title={`Block ${customer.name}?`}
        description="They will not be able to sign in or place orders until unblocked. Existing orders are unaffected."
        confirmLabel="Block customer"
        loading={updateStatus.isPending}
        onConfirm={async () => {
          try {
            await updateStatus.mutateAsync({ id: customer.id, status: 'blocked' })
            setConfirmBlock(false)
          } catch {
            // Toasted by the hook.
          }
        }}
      />
    </>
  )
}

export const route = {
  Component: CustomerDetailPage,
  handle: { title: 'Customer', parent: { label: 'Customers', to: '/customers' } },
  loader: ({ params }: LoaderFunctionArgs) => {
    if (params.id) void queryClient.query(customerQueries.detail(params.id)).catch(() => undefined)
    return null
  },
}

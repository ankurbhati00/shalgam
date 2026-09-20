import { isApiError } from '@shalgam/api-client'
import { orderQueries } from '@shalgam/query'
import type { Order } from '@shalgam/types'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  DeliveryStatus,
  EmptyState,
  ErrorState,
  Heading,
  OrderStatus,
  PaymentStatus,
  ProductImage,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@shalgam/ui'
import { countLabel, formatDateTime, formatINR, formatTime, minutesUntil } from '@shalgam/utils'
import { ArrowRight, Bike, CircleX } from 'lucide-react'
import { useState } from 'react'
import { Link, type LoaderFunctionArgs, useParams } from 'react-router'

import { DescriptionItem, DescriptionList } from '../../../components/description-list'
import { PageHeader } from '../../../components/page-header'
import { RelativeTime } from '../../../components/relative-time'
import { formatPaymentMethod } from '../../../lib/format'
import { queryClient } from '../../../lib/query-client'
import { useDeliveryPartners } from '../../delivery/api/queries'
import { useOrder, useUpdateOrderStatus } from '../api/queries'
import { canCancelOrder, isActiveOrder, nextOrderStatus, statusLabel } from '../lib/order-status'
import { AssignRiderDialog } from '../components/assign-rider-dialog'
import { CancelOrderDialog } from '../components/cancel-order-dialog'
import { OrderTimeline } from '../components/order-timeline'

function OrderItemsCard({ order }: { order: Order }) {
  return (
    <Card padding="none">
      <CardHeader className="px-4 pt-4 sm:px-5">
        <CardTitle>Items · {countLabel(order.itemCount, 'unit')}</CardTitle>
      </CardHeader>
      <TableContainer className="mt-3 rounded-none border-x-0 border-b-0">
        <Table density="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead align="end">Qty</TableHead>
              <TableHead align="end">Unit price</TableHead>
              <TableHead align="end">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <span className="flex items-center gap-3">
                    <ProductImage
                      src={item.imageUrl}
                      alt=""
                      className="size-10 shrink-0"
                      rounded="md"
                    />
                    <span className="min-w-0">
                      <Link
                        to={`/products/${item.productId}/edit`}
                        className="block truncate rounded-xs font-medium text-text focus-ring hover:underline"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-text-muted">{item.unit}</span>
                    </span>
                  </span>
                </TableCell>
                <TableCell align="end" numeric>
                  {item.quantity}
                </TableCell>
                <TableCell align="end" numeric>
                  {formatINR(item.unitPrice)}
                  {item.mrp > item.unitPrice && (
                    <span className="ml-1 text-xs text-text-subtle line-through">
                      {formatINR(item.mrp)}
                    </span>
                  )}
                </TableCell>
                <TableCell align="end" numeric className="font-medium">
                  {formatINR(item.lineTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

function BillCard({ order }: { order: Order }) {
  const { pricing } = order
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill</CardTitle>
      </CardHeader>
      <DescriptionList className="mt-3">
        <DescriptionItem label="Item total">{formatINR(pricing.subtotal)}</DescriptionItem>
        {pricing.discount > 0 && (
          <DescriptionItem label="Discount">
            <span className="text-success-text">−{formatINR(pricing.discount)}</span>
          </DescriptionItem>
        )}
        <DescriptionItem label="Delivery fee">
          {pricing.deliveryFee === 0 ? 'Free' : formatINR(pricing.deliveryFee)}
        </DescriptionItem>
        <DescriptionItem label="Handling fee">{formatINR(pricing.handlingFee)}</DescriptionItem>
        {pricing.tip > 0 && (
          <DescriptionItem label="Rider tip">{formatINR(pricing.tip)}</DescriptionItem>
        )}
        <DescriptionItem label={<span className="font-semibold text-text">Total</span>}>
          <span className="text-base font-semibold">{formatINR(pricing.total)}</span>
        </DescriptionItem>
      </DescriptionList>
    </Card>
  )
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, error, refetch } = useOrder(id)
  const { data: partners } = useDeliveryPartners()
  const updateStatus = useUpdateOrderStatus()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [riderOpen, setRiderOpen] = useState(false)

  if (error) {
    return isApiError(error) && error.isNotFound ? (
      <EmptyState
        title="Order not found"
        description="It may have been removed, or the link is wrong."
        action={
          <Button variant="outline" render={<Link to="/orders" />}>
            Back to orders
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
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const next = nextOrderStatus(order.status)
  const partner = partners?.find((candidate) => candidate.id === order.deliveryPartnerId) ?? null
  const live = isActiveOrder(order)
  const address = order.address

  return (
    <>
      <PageHeader
        title={order.number}
        description={
          <>
            Placed {formatDateTime(order.placedAt)} · {countLabel(order.itemCount, 'unit')} ·{' '}
            {formatINR(order.pricing.total)}
          </>
        }
        actions={
          <>
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Button variant="outline" leadingIcon={<Bike />} onClick={() => setRiderOpen(true)}>
                {order.deliveryPartnerId ? 'Change rider' : 'Assign rider'}
              </Button>
            )}
            {canCancelOrder(order.status) && (
              <Button
                variant="danger-outline"
                leadingIcon={<CircleX />}
                onClick={() => setCancelOpen(true)}
              >
                Cancel order
              </Button>
            )}
            {next && (
              <Button
                trailingIcon={<ArrowRight />}
                loading={updateStatus.isPending}
                loadingText="Updating…"
                onClick={() => updateStatus.mutate({ id: order.id, status: next })}
              >
                Mark {statusLabel(next).toLowerCase()}
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatus status={order.status} size="lg" />
          <DeliveryStatus status={order.deliveryStatus} />
          <PaymentStatus status={order.payment.status} />
          {live && order.eta && (
            <Badge tone="brand" size="md">
              {minutesUntil(order.eta) <= 0 ? 'Due now' : `ETA ${minutesUntil(order.eta)} min`} ·
              promised by {formatTime(order.eta)}
            </Badge>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{live ? 'Progress' : 'Timeline'}</CardTitle>
            </CardHeader>
            <div className="mt-4">
              <OrderTimeline order={order} />
            </div>
          </Card>
          <OrderItemsCard order={order} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={order.customer.name} size="md" />
              <div className="min-w-0">
                <Link
                  to={`/customers/${order.customerId}`}
                  className="block truncate rounded-xs text-sm font-medium text-text focus-ring hover:underline"
                >
                  {order.customer.name}
                </Link>
                <Text size="xs" tone="muted" tabular>
                  {order.customer.phone}
                </Text>
              </div>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-3">
              <Heading level={3} size="xs" className="mb-1 tracking-wide text-text-muted uppercase">
                Delivery address
              </Heading>
              <Text size="sm" weight="medium">
                {address.recipientName} · <span className="capitalize">{address.label}</span>
              </Text>
              <Text size="sm" tone="muted">
                {[address.line1, address.line2, address.landmark].filter(Boolean).join(', ')}
              </Text>
              <Text size="sm" tone="muted">
                {address.city}, {address.state} {address.pincode}
              </Text>
            </div>
            {order.note && (
              <div className="mt-4 border-t border-border-subtle pt-3">
                <Heading
                  level={3}
                  size="xs"
                  className="mb-1 tracking-wide text-text-muted uppercase"
                >
                  Instructions
                </Heading>
                <Text size="sm">{order.note}</Text>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <DescriptionList className="mt-3">
              <DescriptionItem label="Rider">
                {partner ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={partner.name} size="xs" />
                    {partner.name}
                  </span>
                ) : (
                  (order.deliveryPartnerId ?? <span className="text-text-muted">Not assigned</span>)
                )}
              </DescriptionItem>
              <DescriptionItem label="Slot">{order.slot.label}</DescriptionItem>
              <DescriptionItem label="ETA">
                {order.eta ? formatTime(order.eta) : '—'}
              </DescriptionItem>
              <DescriptionItem label="Delivered">
                {order.deliveredAt ? <RelativeTime value={order.deliveredAt} absolute /> : '—'}
              </DescriptionItem>
              <DescriptionItem label="Last update">
                <RelativeTime value={order.updatedAt} />
              </DescriptionItem>
            </DescriptionList>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <DescriptionList className="mt-3">
              <DescriptionItem label="Method">
                {formatPaymentMethod(order.payment.method)}
              </DescriptionItem>
              <DescriptionItem label="Status">
                <PaymentStatus status={order.payment.status} size="sm" />
              </DescriptionItem>
              {order.payment.transactionId && (
                <DescriptionItem label="Reference">
                  <span className="tabular">{order.payment.transactionId}</span>
                </DescriptionItem>
              )}
            </DescriptionList>
          </Card>

          <BillCard order={order} />
        </div>
      </div>

      <CancelOrderDialog order={order} open={cancelOpen} onOpenChange={setCancelOpen} />
      <AssignRiderDialog order={order} open={riderOpen} onOpenChange={setRiderOpen} />
    </>
  )
}

export const route = {
  Component: OrderDetailPage,
  handle: { title: 'Order detail', parent: { label: 'Orders', to: '/orders' } },
  loader: ({ params }: LoaderFunctionArgs) => {
    if (params.id) void queryClient.query(orderQueries.detail(params.id)).catch(() => undefined)
    return null
  },
}

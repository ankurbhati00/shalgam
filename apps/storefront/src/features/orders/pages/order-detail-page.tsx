import { isApiError } from '@shalgam/api-client'
import { orderQueries } from '@shalgam/query'
import {
  Breadcrumb,
  Button,
  Card,
  ConfirmDialog,
  Container,
  EmptyState,
  ErrorState,
  Heading,
  OrderStatus,
  PaymentStatus,
  ProductImage,
  Skeleton,
  Text,
} from '@shalgam/ui'
import { countLabel, formatDateTime, formatINR } from '@shalgam/utils'
import { useState } from 'react'
import { Link, type LoaderFunctionArgs, useParams } from 'react-router'

import { prefetch } from '../../../lib/query-client'
import { formatAddressLines } from '../../addresses/components/address-utils'
import { isActiveOrder, useCancelOrder, useOrder } from '../api/queries'
import { OrderTracking } from '../components/order-tracking'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, error, refetch } = useOrder(id)
  const cancel = useCancelOrder()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (error) {
    return (
      <Container className="py-10">
        {isApiError(error) && error.isNotFound ? (
          <EmptyState title="Order not found" />
        ) : (
          <ErrorState onRetry={() => void refetch()} />
        )}
      </Container>
    )
  }

  if (isPending) {
    return (
      <Container size="lg" className="space-y-4 py-8" aria-busy>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 rounded-xl" />
      </Container>
    )
  }

  const canCancel =
    order.status === 'placed' || order.status === 'preparing' || order.status === 'packed'

  return (
    <Container size="lg" className="space-y-5 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: 'Home', render: <Link to="/" /> },
          { label: 'Orders', render: <Link to="/orders" /> },
          { label: order.number },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={1} size="xl" className="tabular">
            {order.number}
          </Heading>
          <Text size="sm" tone="muted">
            Placed {formatDateTime(order.placedAt)} · {countLabel(order.itemCount, 'item')}
          </Text>
        </div>
        <OrderStatus status={order.status} size="lg" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-5">
          <Card>
            <Heading level={2} size="sm" className="mb-4">
              {isActiveOrder(order) ? 'Tracking' : 'Timeline'}
            </Heading>
            <OrderTracking order={order} />
          </Card>
          <Card padding="none" className="px-4 sm:px-5">
            <Heading level={2} size="sm" className="py-4">
              Items
            </Heading>
            <ul className="divide-y divide-border-subtle">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3 text-sm">
                  <ProductImage
                    src={item.imageUrl}
                    alt=""
                    className="size-14 shrink-0"
                    rounded="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium text-text">{item.name}</span>
                    <span className="text-xs text-text-muted">
                      {item.unit} × {item.quantity} · {formatINR(item.unitPrice)} each
                    </span>
                  </span>
                  <span className="font-medium tabular">{formatINR(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="space-y-4">
            <div>
              <Heading level={2} size="xs" className="mb-1 tracking-wide text-text-muted uppercase">
                Delivery address
              </Heading>
              <Text size="sm" weight="medium">
                {order.address.recipientName}
              </Text>
              <Text size="sm" tone="muted">
                {formatAddressLines(order.address)}
              </Text>
              <Text size="sm" tone="muted">
                {order.address.phone}
              </Text>
            </div>
            <div>
              <Heading level={2} size="xs" className="mb-1 tracking-wide text-text-muted uppercase">
                Payment
              </Heading>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text">
                  {order.payment.method === 'cod'
                    ? 'Cash on delivery'
                    : order.payment.method.toUpperCase()}
                </span>
                <PaymentStatus status={order.payment.status} size="sm" />
              </div>
              {order.payment.transactionId && (
                <Text size="xs" tone="subtle" tabular>
                  Ref {order.payment.transactionId}
                </Text>
              )}
            </div>
            {order.note && (
              <div>
                <Heading
                  level={2}
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
            <Heading level={2} size="sm" className="mb-3">
              Bill details
            </Heading>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Item total</dt>
                <dd className="tabular">{formatINR(order.pricing.subtotal)}</dd>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-success-text">
                  <dt>Savings</dt>
                  <dd className="tabular">−{formatINR(order.pricing.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-text-muted">Delivery fee</dt>
                <dd className="tabular">
                  {order.pricing.deliveryFee === 0 ? 'Free' : formatINR(order.pricing.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Handling fee</dt>
                <dd className="tabular">{formatINR(order.pricing.handlingFee)}</dd>
              </div>
              {order.pricing.tip > 0 && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Rider tip</dt>
                  <dd className="tabular">{formatINR(order.pricing.tip)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular">{formatINR(order.pricing.total)}</dd>
              </div>
            </dl>
          </Card>
          {canCancel && (
            <Button variant="danger-outline" fullWidth onClick={() => setConfirmOpen(true)}>
              Cancel order
            </Button>
          )}
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            tone="danger"
            title="Cancel this order?"
            description="We'll stop packing it right away. Prepaid amounts are refunded to the original payment method."
            confirmLabel="Cancel order"
            cancelLabel="Keep order"
            loading={cancel.isPending}
            onConfirm={async () => {
              await cancel.mutateAsync({ id: order.id, reason: 'Customer requested cancellation' })
              setConfirmOpen(false)
            }}
          />
        </div>
      </div>
    </Container>
  )
}

export const route = {
  Component: OrderDetailPage,
  loader: ({ params }: LoaderFunctionArgs) => {
    if (params.id) prefetch(orderQueries.detail(params.id))
    return null
  },
}

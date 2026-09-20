import {
  Button,
  Card,
  Container,
  ErrorState,
  Heading,
  ProductImage,
  Skeleton,
  Text,
} from '@shalgam/ui'
import { formatINR, formatTime, minutesUntil } from '@shalgam/utils'
import { CircleCheck, PackageCheck, ShoppingBag } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { useOrder } from '../../orders/api/queries'

export function OrderConfirmationPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, isError, refetch } = useOrder(id)

  if (isError) {
    return (
      <Container className="py-10">
        <ErrorState onRetry={() => void refetch()} />
      </Container>
    )
  }

  return (
    <Container size="md" className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <span className="mx-auto inline-flex size-16 animate-pop items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CircleCheck className="size-8" aria-hidden />
        </span>
        <div className="space-y-2">
          <Heading level={1} size="xl">
            Order placed!
          </Heading>
          {isPending ? (
            <Skeleton shape="text" className="mx-auto w-64" />
          ) : (
            <Text tone="muted">
              Order <span className="font-medium text-text tabular">{order.number}</span> is being
              picked.
              {order.eta && (
                <>
                  {' '}
                  Arriving in about{' '}
                  <span className="font-medium text-text">{minutesUntil(order.eta)} min</span> (
                  {formatTime(order.eta)}).
                </>
              )}
            </Text>
          )}
        </div>
        {order && (
          <Card className="text-left">
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 text-sm">
                  <ProductImage
                    src={item.imageUrl}
                    alt=""
                    className="size-11 shrink-0"
                    rounded="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-text">{item.name}</span>
                    <span className="text-xs text-text-muted">
                      {item.unit} × {item.quantity}
                    </span>
                  </span>
                  <span className="tabular">{formatINR(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-text-muted">Paid via {order.payment.method.toUpperCase()}</span>
              <span className="font-semibold tabular">{formatINR(order.pricing.total)}</span>
            </div>
          </Card>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button render={<Link to={`/orders/${id}`} />} leadingIcon={<PackageCheck />} size="lg">
            Track order
          </Button>
          <Button
            variant="outline"
            render={<Link to="/" />}
            leadingIcon={<ShoppingBag />}
            size="lg"
          >
            Continue shopping
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const route = { Component: OrderConfirmationPage }

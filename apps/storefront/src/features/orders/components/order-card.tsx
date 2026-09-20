import { productQueries } from '@shalgam/query'
import type { Order } from '@shalgam/types'
import { Button, Card, OrderStatus, ProductImage, Text, toast } from '@shalgam/ui'
import { countLabel, formatDateTime, formatINR } from '@shalgam/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { useCartStore } from '../../cart/store/cart-store'
import { isActiveOrder } from '../api/queries'

export function OrderCard({ order }: { order: Order }) {
  const queryClient = useQueryClient()
  const add = useCartStore((s) => s.add)
  const openCart = useCartStore((s) => s.open)
  const [reordering, setReordering] = useState(false)
  const preview = order.items.slice(0, 4)
  const more = order.items.length - preview.length

  const reorder = async () => {
    setReordering(true)
    try {
      // Re-validate every line against the live catalogue before adding.
      const products = await Promise.all(
        order.items.map((item) =>
          queryClient.query(productQueries.detail(item.productId)).catch(() => null),
        ),
      )
      let added = 0
      products.forEach((product, index) => {
        const item = order.items[index]
        if (product?.status === 'active' && product.stock > 0 && item) {
          add(product, item.quantity)
          added += 1
        }
      })
      if (added === 0)
        toast.warning('Nothing could be re-added', 'These items are currently unavailable.')
      else {
        toast.success(
          `${countLabel(added, 'item')} added to cart`,
          added < order.items.length ? 'Some items were unavailable.' : undefined,
        )
        openCart()
      }
    } finally {
      setReordering(false)
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Text as="p" size="sm" weight="semibold" tabular>
            {order.number}
          </Text>
          <Text as="p" size="xs" tone="muted">
            {formatDateTime(order.placedAt)} · {countLabel(order.itemCount, 'item')}
          </Text>
        </div>
        <OrderStatus status={order.status} />
      </div>
      <div className="flex items-center gap-2">
        {preview.map((item) => (
          <ProductImage
            key={item.productId}
            src={item.imageUrl}
            alt={item.name}
            className="size-12 shrink-0"
            rounded="md"
          />
        ))}
        {more > 0 && (
          <span className="inline-flex size-12 items-center justify-center rounded-md bg-surface-muted text-xs font-medium text-text-muted">
            +{more}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <Text as="span" size="sm" weight="semibold" tabular>
          {formatINR(order.pricing.total)}
        </Text>
        <div className="flex gap-2">
          {!isActiveOrder(order) && order.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="outline"
              leadingIcon={<RotateCcw />}
              loading={reordering}
              onClick={() => void reorder()}
            >
              Reorder
            </Button>
          )}
          <Button
            size="sm"
            variant={isActiveOrder(order) ? 'primary' : 'ghost'}
            trailingIcon={<ChevronRight />}
            render={<Link to={`/orders/${order.id}`} />}
          >
            {isActiveOrder(order) ? 'Track' : 'Details'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

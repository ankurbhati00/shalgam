import { Button, IconButton, Price, ProductImage, QuantitySelector, cn } from '@shalgam/ui'
import { Trash } from 'lucide-react'
import { Link } from 'react-router'

import { type CartLine, useCartStore } from '../store/cart-store'

export interface CartLineItemProps {
  line: CartLine
  compact?: boolean
  onNavigate?: () => void
}

/**
 * One cart row. On phones the explicit remove action is a text button under the
 * name (the stepper's bin icon also removes at quantity one); from `sm` up it is
 * an icon button beside the stepper.
 */
export function CartLineItem({ line, compact = false, onNavigate }: CartLineItemProps) {
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  return (
    <li className={cn('flex gap-3', compact ? 'py-3' : 'py-4')}>
      <Link
        to={`/product/${line.slug}`}
        onClick={onNavigate}
        className="shrink-0 rounded-lg focus-ring"
      >
        <ProductImage
          src={line.imageUrl}
          alt=""
          className={compact ? 'size-16' : 'size-16 sm:size-20'}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          to={`/product/${line.slug}`}
          onClick={onNavigate}
          className="line-clamp-2 rounded-xs text-sm leading-5 font-medium text-text focus-ring"
        >
          {line.name}
        </Link>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-muted">{line.unit}</span>
          {!compact && (
            <Button
              variant="link"
              size="sm"
              aria-label={`Remove ${line.name}`}
              className="text-xs text-text-muted hover:text-danger-text sm:hidden"
              onClick={() => remove(line.productId)}
            >
              Remove
            </Button>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <Price
            amount={line.price * line.quantity}
            mrp={line.mrp > line.price ? line.mrp * line.quantity : undefined}
            size="sm"
            showDiscount={false}
          />
          <div className="flex items-center gap-1">
            <QuantitySelector
              variant="outline"
              size="sm"
              value={line.quantity}
              max={line.maxPerOrder}
              label={line.name}
              onChange={(quantity) => setQuantity(line.productId, quantity)}
            />
            {!compact && (
              <IconButton
                aria-label={`Remove ${line.name}`}
                icon={<Trash />}
                size="sm"
                variant="danger"
                className="hidden sm:inline-flex"
                onClick={() => remove(line.productId)}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

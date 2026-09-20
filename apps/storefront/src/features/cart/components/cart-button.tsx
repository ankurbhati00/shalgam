import { Button, IconButton } from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'
import { ShoppingCart } from 'lucide-react'

import { useCartStore, useCartTotals } from '../store/cart-store'

/** Header cart control: total and count on desktop, icon with a badge on mobile. */
export function CartButton() {
  const { count, subtotal } = useCartTotals()
  const open = useCartStore((s) => s.open)
  const label = count === 0 ? 'Cart, empty' : `Cart, ${count} items, ${formatINR(subtotal)}`
  return (
    <>
      <span className="relative md:hidden">
        <IconButton aria-label={label} icon={<ShoppingCart />} variant="secondary" onClick={open} />
        {count > 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1 text-2xs font-bold text-text tabular ring-2 ring-primary"
          >
            {count}
          </span>
        )}
      </span>
      <Button
        variant="secondary"
        leadingIcon={<ShoppingCart />}
        onClick={open}
        aria-label={label}
        className="hidden md:inline-flex"
      >
        {count === 0 ? (
          'Cart'
        ) : (
          <span className="flex flex-col items-start leading-none">
            <span className="text-2xs font-medium opacity-80">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
            <span className="tabular">{formatINR(subtotal)}</span>
          </span>
        )}
      </Button>
    </>
  )
}

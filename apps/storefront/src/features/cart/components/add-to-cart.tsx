import type { Product } from '@shalgam/types'
import { Button, QuantitySelector, toast } from '@shalgam/ui'
import { Plus } from 'lucide-react'

import { useCartLine, useCartStore } from '../store/cart-store'

export interface AddToCartProps {
  product: Product
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

/** "Add" button that turns into a quantity stepper once the product is in the cart. */
export function AddToCart({ product, size = 'sm', fullWidth = false }: AddToCartProps) {
  const line = useCartLine(product.id)
  const add = useCartStore((s) => s.add)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const max = Math.max(0, Math.min(product.maxPerOrder, product.stock))

  if (product.stock <= 0) {
    return (
      <Button size={size} variant="outline" disabled fullWidth={fullWidth}>
        Sold out
      </Button>
    )
  }

  if (!line) {
    return (
      <Button
        size={size}
        variant="primary"
        fullWidth={fullWidth}
        leadingIcon={<Plus />}
        className="animate-pop"
        onClick={() => add(product)}
        aria-label={`Add ${product.name} to cart`}
      >
        Add
      </Button>
    )
  }

  return (
    <QuantitySelector
      value={line.quantity}
      max={max}
      label={product.name}
      size={size}
      className={fullWidth ? 'w-full justify-between sm:w-auto' : undefined}
      onChange={(quantity) => {
        if (quantity > line.quantity && quantity >= max) {
          toast.info(
            max < product.maxPerOrder ? `Only ${max} left in stock` : `Maximum ${max} per order`,
            product.name,
          )
        }
        setQuantity(product.id, quantity)
      }}
    />
  )
}

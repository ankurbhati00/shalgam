import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  EmptyState,
} from '@shalgam/ui'
import { ArrowRight, ShoppingBasket } from 'lucide-react'
import { Link } from 'react-router'

import { useCartLines, useCartStore, useCartTotals } from '../store/cart-store'
import { CartLineItem } from './cart-line-item'
import { CartSummary } from './cart-summary'

/** Slide-over cart mounted once in the root layout; opened from the header. */
export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const close = useCartStore((s) => s.close)
  const lines = useCartLines()
  const totals = useCartTotals()

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <DrawerTitle>
            Your cart
            {totals.count > 0 ? ` · ${totals.count} ${totals.count === 1 ? 'item' : 'items'}` : ''}
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="py-0">
          {lines.length === 0 ? (
            <EmptyState
              icon={<ShoppingBasket />}
              title="Your cart is empty"
              description="Fresh produce, dairy, snacks — add a few things and we'll bring them over in minutes."
              action={
                <Button onClick={close} render={<Link to="/category/fruits-vegetables" />}>
                  Start shopping
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {lines.map((line) => (
                <CartLineItem key={line.productId} line={line} compact onNavigate={close} />
              ))}
            </ul>
          )}
        </DrawerBody>
        {lines.length > 0 && (
          <DrawerFooter className="space-y-3">
            <CartSummary totals={totals} />
            <Button
              fullWidth
              size="lg"
              trailingIcon={<ArrowRight />}
              onClick={close}
              render={<Link to="/checkout" />}
            >
              Checkout
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}

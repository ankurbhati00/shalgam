import { Button, Card, Container, EmptyState, Heading, Text } from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'
import { ArrowRight, ShoppingBasket } from 'lucide-react'
import { Link } from 'react-router'

import { MobileActionBar } from '../../../app/shell/mobile-action-bar'
import { CartLineItem } from '../components/cart-line-item'
import { CartSummary } from '../components/cart-summary'
import { useCartBill } from '../hooks/use-cart-bill'
import { useCartLines, useCartStore, useCartTotals } from '../store/cart-store'

export function CartPage() {
  const lines = useCartLines()
  const totals = useCartTotals()
  const clear = useCartStore((s) => s.clear)
  const bill = useCartBill(totals)

  return (
    <Container size="lg" className="py-6 sm:py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <Heading level={1} size="xl">
          Your cart
        </Heading>
        {lines.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear cart
          </Button>
        )}
      </div>
      {lines.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            size="lg"
            icon={<ShoppingBasket />}
            title="Your cart is empty"
            description="Browse categories or search for what you need. Delivery is free above ₹299."
            action={
              <Button render={<Link to="/" />} trailingIcon={<ArrowRight />}>
                Browse groceries
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <Card padding="none" className="px-4 sm:px-5">
            <ul className="divide-y divide-border-subtle">
              {lines.map((line) => (
                <CartLineItem key={line.productId} line={line} />
              ))}
            </ul>
          </Card>
          <Card className="lg:sticky lg:top-24">
            <Heading level={2} size="sm" className="mb-3">
              Bill details
            </Heading>
            <CartSummary totals={totals} />
            <Button
              fullWidth
              size="lg"
              className="mt-4 hidden lg:inline-flex"
              trailingIcon={<ArrowRight />}
              render={<Link to="/checkout" />}
            >
              Proceed to checkout
            </Button>
          </Card>
          {/* Phones and tablets: the checkout action stays within thumb reach. */}
          <MobileActionBar className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Text as="p" size="xs" tone="muted">
                To pay
              </Text>
              <Text as="p" size="lg" weight="semibold" tabular>
                {bill.isPending ? '…' : formatINR(bill.total)}
              </Text>
            </div>
            <Button size="lg" trailingIcon={<ArrowRight />} render={<Link to="/checkout" />}>
              Checkout
            </Button>
          </MobileActionBar>
        </div>
      )}
    </Container>
  )
}

export const route = { Component: CartPage }

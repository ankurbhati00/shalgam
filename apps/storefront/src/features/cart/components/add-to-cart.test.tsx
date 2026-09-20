import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { makeProduct } from '../../../test/factories'
import { renderWithProviders } from '../../../test/render'
import { useCartStore } from '../store/cart-store'
import { AddToCart } from './add-to-cart'
import { CartDrawer } from './cart-drawer'

const product = makeProduct({
  id: 'prd_tomato',
  name: 'Tomato Hybrid',
  price: 24,
  mrp: 32,
  maxPerOrder: 3,
  stock: 2,
})

describe('AddToCart', () => {
  beforeEach(() => useCartStore.setState({ lines: {}, isOpen: false }))

  it('turns into a stepper after adding and removes the line at zero', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddToCart product={product} />)

    await user.click(screen.getByRole('button', { name: /add tomato hybrid to cart/i }))
    expect(screen.getByRole('group', { name: /quantity of tomato hybrid/i })).toBeInTheDocument()
    expect(useCartStore.getState().lines.prd_tomato?.quantity).toBe(1)

    await user.click(screen.getByRole('button', { name: /increase quantity/i }))
    expect(useCartStore.getState().lines.prd_tomato?.quantity).toBe(2)
    // Stock is 2, so the increase button is now disabled.
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /decrease quantity/i }))
    await user.click(screen.getByRole('button', { name: /remove tomato hybrid/i }))
    expect(useCartStore.getState().lines.prd_tomato).toBeUndefined()
    expect(screen.getByRole('button', { name: /add tomato hybrid to cart/i })).toBeInTheDocument()
  })

  it('shows a sold-out state for products without stock', () => {
    renderWithProviders(<AddToCart product={makeProduct({ stock: 0 })} />)
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled()
  })
})

describe('CartDrawer', () => {
  beforeEach(() => useCartStore.setState({ lines: {}, isOpen: false }))

  it('lists lines with server-priced delivery fees and a checkout link', async () => {
    useCartStore.getState().add(product, 2)
    useCartStore.getState().open()
    renderWithProviders(<CartDrawer />)

    const drawer = await screen.findByRole('dialog', { name: /your cart · 2 items/i })
    expect(within(drawer).getByText('Tomato Hybrid')).toBeInTheDocument()
    // Delivery fee comes from GET /api/checkout/options (₹29 below the free-delivery threshold).
    expect(await within(drawer).findByText('₹29')).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: /checkout/i })).toHaveAttribute(
      'href',
      '/checkout',
    )
  })
})

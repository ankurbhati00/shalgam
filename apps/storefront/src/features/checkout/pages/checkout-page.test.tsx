import { getDb } from '@shalgam/mock-api'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderWithProviders } from '../../../test/render'
import { useCartStore } from '../../cart/store/cart-store'
import { CheckoutPage } from './checkout-page'

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: {}, isOpen: false })
    const product = getDb().products.find(
      (p) => p.status === 'active' && p.stock > 3 && p.price > 120,
    )
    if (!product) throw new Error('Seed has no suitable product')
    useCartStore.getState().add(product, 2)
  })

  it('validates the UPI id and places the order through the API', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders(<CheckoutPage />, {
      route: '/checkout',
      routes: [{ path: '/orders/:id/confirmation', element: <h1>Order confirmed</h1> }],
    })

    // Saved addresses load from the API and the default one is preselected.
    const addressGroup = await screen.findByRole('radiogroup', { name: /delivery address/i })
    expect(within(addressGroup).getAllByRole('radio').length).toBeGreaterThan(0)
    expect(within(addressGroup).getByRole('radio', { checked: true })).toBeInTheDocument()

    // The action renders in the summary card and in the phone action bar; CSS hides one.
    const [placeOrder] = await screen.findAllByRole('button', { name: /place order/i })
    if (!placeOrder) throw new Error('Place order button missing')
    await waitFor(() => expect(placeOrder).toBeEnabled())

    await user.type(screen.getByLabelText(/upi id/i), 'not-a-upi')
    await user.click(placeOrder)
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    expect(router.state.location.pathname).toBe('/checkout')

    await user.clear(screen.getByLabelText(/upi id/i))
    await user.type(screen.getByLabelText(/upi id/i), 'ananya@okaxis')
    await user.click(placeOrder)

    await waitFor(
      () => expect(router.state.location.pathname).toMatch(/^\/orders\/.+\/confirmation$/),
      { timeout: 10_000 },
    )
    expect(useCartStore.getState().lines).toEqual({})
  })
})

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '../../../test/render'
import { OrdersPage } from '../pages/orders-page'

describe('Orders page', () => {
  it('renders orders from the mock API and a status filter updates the URL and the rows', async () => {
    const { router } = renderWithProviders(<OrdersPage />, { route: '/orders' })

    // Rows come from the seeded mock backend; order numbers are rendered as links.
    const links = await screen.findAllByRole('link', { name: /^SHL-/ })
    expect(links.length).toBeGreaterThan(5)
    const table = screen.getByRole('table', { name: 'Orders' })
    expect(within(table).getAllByText('Delivered').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('tab', { name: 'Cancelled' }))

    await waitFor(() => expect(router.state.location.search).toContain('status=cancelled'))
    await waitFor(() => {
      const rows = within(screen.getByRole('table', { name: 'Orders' }))
        .getAllByRole('row')
        .slice(1)
      expect(rows.length).toBeGreaterThan(0)
      for (const row of rows)
        expect(within(row).getAllByText('Cancelled').length).toBeGreaterThan(0)
    })
    expect(
      within(screen.getByRole('table', { name: 'Orders' })).queryByText('Delivered'),
    ).not.toBeInTheDocument()
  })
})

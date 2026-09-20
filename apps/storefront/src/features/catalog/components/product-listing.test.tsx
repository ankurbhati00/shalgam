import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '../../../test/render'
import { ProductListing } from './product-listing'

describe('ProductListing', () => {
  it('reads filters from the URL and writes filter changes back to it', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders(
      <ProductListing baseParams={{ categorySlug: 'fruits-vegetables' }} />,
      {
        route: '/category/fruits-vegetables?tags=deal',
      },
    )

    const grid = await screen.findByRole('list', { busy: false }, { timeout: 5000 })
    await waitFor(() => expect(within(grid).getAllByRole('listitem').length).toBeGreaterThan(0))
    // Every card is a deal because the URL said so.
    const badges = within(grid).getAllByText(/% off/)
    expect(badges.length).toBe(within(grid).getAllByRole('listitem').length)

    // Toggling a filter updates the URL, which drives the next query.
    // The sidebar and the phone sheet each render the checkbox; the sidebar's comes first.
    const [bestsellers] = screen.getAllByLabelText('Bestsellers')
    if (!bestsellers) throw new Error('Bestsellers filter missing')
    await user.click(bestsellers)
    await waitFor(() => expect(router.state.location.search).toContain('tags=bestseller'))
    expect(router.state.location.search).toContain('tags=deal')
  })

  it('shows an empty state with a clear-filters action when nothing matches', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders(
      <ProductListing baseParams={{ categorySlug: 'fruits-vegetables' }} />,
      {
        route: '/category/fruits-vegetables?tags=non-veg&tags=organic',
      },
    )
    expect(await screen.findByText(/no products match/i, {}, { timeout: 5000 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    await waitFor(() => expect(router.state.location.search).toBe(''))
  })
})

import { queryKeys } from '@shalgam/query'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '../../../test/render'
import { InventoryPage } from './inventory-page'

const ON_HAND_CELL = 3

function onHandOf(button: HTMLElement): number {
  const row = button.closest('tr')
  if (!row) throw new Error('Adjust button is not inside a row')
  const cell = within(row).getAllByRole('cell')[ON_HAND_CELL]
  return Number((cell?.textContent ?? '').replace(/[^\d-]/g, ''))
}

describe('Inventory page', () => {
  it('applies a stock adjustment and refreshes the table and the summary', async () => {
    // Sort by SKU so the adjusted row stays on the first page after its status changes.
    const { queryClient } = renderWithProviders(<InventoryPage />, {
      route: '/inventory?sort=sku&order=asc',
    })

    const [firstButton] = await screen.findAllByRole('button', { name: /^Adjust stock for / })
    if (!firstButton) throw new Error('No inventory rows rendered')
    const label = firstButton.getAttribute('aria-label') ?? ''
    const before = onHandOf(firstButton)
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.inventory.summary)?.status).toBe('success'),
    )
    const summaryUpdatedAt =
      queryClient.getQueryState(queryKeys.inventory.summary)?.dataUpdatedAt ?? 0

    await userEvent.click(firstButton)
    const dialog = await screen.findByRole('dialog', { name: 'Adjust stock' })
    // Base UI radios are not native inputs, so the wrapping <label> does not name them; check the group's default instead.
    expect(within(dialog).getAllByRole('radio')[0]).toHaveAttribute('aria-checked', 'true')
    await userEvent.type(within(dialog).getByLabelText(/Quantity/), '10')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply adjustment' }))

    // The success toast is also a Base UI dialog, so look the adjust dialog up by name.
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Adjust stock' })).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('Stock updated')).toBeInTheDocument()
    await waitFor(() =>
      expect(onHandOf(screen.getByRole('button', { name: label }))).toBe(before + 10),
    )
    await waitFor(() =>
      expect(
        queryClient.getQueryState(queryKeys.inventory.summary)?.dataUpdatedAt ?? 0,
      ).toBeGreaterThan(summaryUpdatedAt),
    )
  })
})

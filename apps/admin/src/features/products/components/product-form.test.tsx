import { api } from '@shalgam/api-client'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../test/render'
import { ProductForm } from './product-form'

describe('ProductForm', () => {
  it('shows Zod validation errors and submits successfully once fixed', async () => {
    const page = await api.catalog.listProducts({ pageSize: 1, status: ['active'] })
    const product = page.data[0]
    if (!product) throw new Error('Seeded catalog has no products')
    const onSaved = vi.fn()

    renderWithProviders(<ProductForm product={product} onSaved={onSaved} />)

    const name = await screen.findByLabelText(/Product name/)
    const price = screen.getByLabelText(/Selling price/)
    await userEvent.clear(name)
    await userEvent.clear(price)
    await userEvent.type(price, String(product.mrp + 50))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Name must be at least 2 characters.')).toBeInTheDocument()
    expect(screen.getByText('Selling price cannot exceed MRP.')).toBeInTheDocument()
    expect(onSaved).not.toHaveBeenCalled()

    await userEvent.type(name, 'Renamed Product')
    await userEvent.clear(price)
    await userEvent.type(price, String(product.price))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({ id: product.id, name: 'Renamed Product', price: product.price }),
    )
    expect(screen.queryByText('Name must be at least 2 characters.')).not.toBeInTheDocument()
  })
})

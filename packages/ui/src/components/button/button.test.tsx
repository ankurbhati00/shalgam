import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'
import { IconButton } from './icon-button'

describe('Button', () => {
  it('renders a native button and fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Add to cart</Button>)
    const button = screen.getByRole('button', { name: 'Add to cart' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('blocks interaction and announces busy state while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading loadingText="Placing order…" onClick={onClick}>
        Place order
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Placing order…' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('can render as another element', () => {
    render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Button
      <Button render={<a href="/orders" />} variant="outline">
        View orders
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'View orders' })).toHaveAttribute('href', '/orders')
  })

  it('requires an accessible name for icon buttons', () => {
    render(<IconButton aria-label="Delete item" icon={<svg aria-hidden />} />)
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument()
  })
})

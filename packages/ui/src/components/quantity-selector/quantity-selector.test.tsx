import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { QuantitySelector } from './quantity-selector'

function Harness({ max = 3 }: { max?: number }) {
  const [value, setValue] = useState(1)
  return <QuantitySelector value={value} onChange={setValue} max={max} label="Tomato" />
}

describe('QuantitySelector', () => {
  it('increments to the maximum, then disables the increase button', async () => {
    const user = userEvent.setup()
    render(<Harness max={2} />)
    const increase = screen.getByRole('button', { name: /increase quantity of tomato/i })
    await user.click(increase)
    expect(screen.getByRole('status')).toHaveTextContent('2')
    expect(increase).toBeDisabled()
  })

  it('offers removal at quantity one and announces the value', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByRole('group', { name: /quantity of tomato/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove tomato/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /remove tomato/i }))
    expect(screen.getByRole('status')).toHaveTextContent('0')
  })
})

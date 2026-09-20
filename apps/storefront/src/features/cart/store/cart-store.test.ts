import { beforeEach, describe, expect, it } from 'vitest'

import { makeProduct } from '../../../test/factories'
import { computeTotals, useCartStore } from './cart-store'

const tomato = makeProduct({ id: 'prd_tomato', name: 'Tomato', price: 24, mrp: 32, maxPerOrder: 3 })
const paneer = makeProduct({
  id: 'prd_paneer',
  name: 'Paneer',
  price: 92,
  mrp: 105,
  maxPerOrder: 8,
})

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ lines: {}, isOpen: false }))

  it('adds products as snapshots and increments existing lines', () => {
    const { add } = useCartStore.getState()
    add(tomato)
    add(tomato)
    add(paneer, 2)
    const { lines } = useCartStore.getState()
    expect(lines.prd_tomato?.quantity).toBe(2)
    expect(lines.prd_paneer?.quantity).toBe(2)
    expect(lines.prd_tomato?.price).toBe(24)
  })

  it('never exceeds the per-order maximum', () => {
    const { add, setQuantity } = useCartStore.getState()
    add(tomato, 5)
    expect(useCartStore.getState().lines.prd_tomato?.quantity).toBe(3)
    setQuantity('prd_tomato', 99)
    expect(useCartStore.getState().lines.prd_tomato?.quantity).toBe(3)
  })

  it('removes a line when quantity drops to zero', () => {
    const { add, setQuantity } = useCartStore.getState()
    add(tomato)
    setQuantity('prd_tomato', 0)
    expect(useCartStore.getState().lines.prd_tomato).toBeUndefined()
  })

  it('computes count, subtotal and savings', () => {
    const totals = computeTotals([
      {
        productId: 'a',
        slug: 'a',
        name: 'A',
        unit: '1',
        imageUrl: '',
        price: 24,
        mrp: 32,
        maxPerOrder: 5,
        quantity: 2,
      },
      {
        productId: 'b',
        slug: 'b',
        name: 'B',
        unit: '1',
        imageUrl: '',
        price: 92,
        mrp: 105,
        maxPerOrder: 5,
        quantity: 1,
      },
    ])
    expect(totals).toEqual({ count: 3, subtotal: 140, savings: 29 })
  })

  it('persists lines but not the drawer state', () => {
    useCartStore.getState().add(tomato)
    useCartStore.getState().open()
    const raw = window.localStorage.getItem('shalgam:cart:v1')
    expect(raw).toContain('prd_tomato')
    expect(raw).not.toContain('isOpen')
  })
})

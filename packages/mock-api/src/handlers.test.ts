import type { AnalyticsOverview, Order, Paginated, Product } from '@shalgam/types'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { resetDb } from './db/store'
import { server } from './node'

const BASE = 'http://localhost/api'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`)
  if (!response.ok) throw new Error(`${path} → ${response.status}`)
  return (await response.json()) as T
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
beforeEach(() => resetDb({ seed: 7 }))

describe('catalog', () => {
  it('lists active products with pagination, filtering and sorting', async () => {
    const page = await getJson<Paginated<Product>>(
      '/products?pageSize=5&categorySlug=fruits-vegetables&sortBy=price_asc',
    )
    expect(page.data).toHaveLength(5)
    expect(page.meta.pageSize).toBe(5)
    expect(page.meta.total).toBeGreaterThan(5)
    const prices = page.data.map((p) => p.price)
    expect(prices).toEqual(prices.slice().sort((a, b) => a - b))
    expect(page.data.every((p) => p.status === 'active')).toBe(true)
  })

  it('searches by name and resolves products by slug', async () => {
    const page = await getJson<Paginated<Product>>('/products?q=paneer')
    expect(page.data[0]?.name).toMatch(/paneer/i)
    const product = await getJson<Product>(`/products/${page.data[0]!.slug}`)
    expect(product.id).toBe(page.data[0]!.id)
  })

  it('validates product creation', async () => {
    const response = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X', price: 120, mrp: 100 }),
    })
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: { details: Record<string, string[]> } }
    expect(body.error.details.name).toBeDefined()
    expect(body.error.details.price).toEqual(['Selling price cannot exceed MRP.'])
  })

  it('supports forced errors for demoing failure states', async () => {
    const response = await fetch(`${BASE}/products?mockError=503`)
    expect(response.status).toBe(503)
  })
})

describe('orders', () => {
  it('places an order, reserves stock and exposes it in the list', async () => {
    const products = await getJson<Paginated<Product>>('/products?pageSize=3&inStock=true')
    const [first, second] = products.data
    const before = await getJson<Product>(`/products/${first!.id}`)
    const response = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          { productId: first!.id, quantity: 2 },
          { productId: second!.id, quantity: 1 },
        ],
        addressId: 'adr_ananya_home',
        slotId: 'slot_express',
        paymentMethod: 'upi',
        tip: 20,
        note: 'Ring twice',
      }),
    })
    expect(response.status).toBe(201)
    const order = (await response.json()) as Order
    expect(order.status).toBe('placed')
    expect(order.itemCount).toBe(3)
    expect(order.pricing.tip).toBe(20)
    expect(order.pricing.total).toBeGreaterThan(order.pricing.subtotal)
    expect(order.payment.status).toBe('paid')

    const after = await getJson<Product>(`/products/${first!.id}`)
    expect(after.stock).toBe(before.stock - 2)

    const list = await getJson<Paginated<Order>>('/orders?customerId=cus_ananya&pageSize=1')
    expect(list.data[0]?.id).toBe(order.id)
  })

  it('rejects an empty cart and unknown addresses', async () => {
    const response = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [],
        addressId: 'nope',
        slotId: 'slot_express',
        paymentMethod: 'upi',
        tip: 0,
        note: null,
      }),
    })
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: { details: Record<string, string[]> } }
    expect(body.error.details.items).toBeDefined()
    expect(body.error.details.addressId).toBeDefined()
  })

  it('enforces status transitions', async () => {
    const list = await getJson<Paginated<Order>>('/orders?status=delivered&pageSize=1')
    const delivered = list.data[0]!
    const response = await fetch(`${BASE}/orders/${delivered.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'packed' }),
    })
    expect(response.status).toBe(409)
  })
})

describe('analytics', () => {
  it('returns KPIs with period-over-period comparison', async () => {
    const overview = await getJson<AnalyticsOverview>('/analytics/overview')
    expect(overview.kpis.totalOrders.value).toBeGreaterThan(0)
    expect(overview.kpis.revenue.value).toBeGreaterThan(0)
    expect(typeof overview.kpis.cancellationRate.value).toBe('number')
  })
})

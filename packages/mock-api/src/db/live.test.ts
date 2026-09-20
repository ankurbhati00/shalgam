import { describe, expect, it } from 'vitest'

import { advanceLiveOrders, applyStatus } from './live'
import { seedDatabase } from './seed'

const MINUTE = 60_000

describe('live order simulation', () => {
  it('moves the demo order through the timeline as time passes', () => {
    const now = new Date('2026-09-18T10:00:00.000Z').getTime()
    const db = seedDatabase(11, now)
    const order = db.orders.find((o) => o.id === 'ord_demo_live')
    expect(order?.status).toBe('out_for_delivery')

    // Nothing changes before the next step is due.
    expect(advanceLiveOrders(db, now)).toBe(false)

    // Twenty minutes after placement every in-flight order has been delivered.
    const changed = advanceLiveOrders(db, now + 25 * MINUTE)
    expect(changed).toBe(true)
    const delivered = db.orders.find((o) => o.id === 'ord_demo_live')
    expect(delivered?.status).toBe('delivered')
    expect(delivered?.deliveredAt).not.toBeNull()
    expect(delivered?.timeline.map((e) => e.status)).toEqual([
      'placed',
      'preparing',
      'packed',
      'out_for_delivery',
      'delivered',
    ])
    const delivery = db.deliveries.find((d) => d.orderId === 'ord_demo_live')
    expect(delivery?.status).toBe('delivered')
    expect(db.orders.every((o) => o.status === 'delivered' || o.status === 'cancelled')).toBe(true)
  })

  it('assigns a rider when an order is packed and frees them on delivery', () => {
    const now = new Date('2026-09-18T10:00:00.000Z').getTime()
    const db = seedDatabase(12, now)
    // Rewind a delivered order to a freshly placed one so the transition path is deterministic.
    const order = db.orders.find((o) => o.status === 'delivered' && o.payment.method === 'cod')
    if (!order) throw new Error('seed has no delivered COD order')
    db.deliveries = db.deliveries.filter((d) => d.orderId !== order.id)
    Object.assign(order, {
      status: 'placed',
      deliveryStatus: 'pending',
      deliveryPartnerId: null,
      deliveredAt: null,
      eta: new Date(now + 15 * MINUTE).toISOString(),
      payment: { ...order.payment, status: 'pending' },
      timeline: order.timeline.slice(0, 1),
    })
    applyStatus(db, order, 'packed', new Date(now).toISOString(), 'Packed')
    const partner = db.partners.find((p) => p.id === order.deliveryPartnerId)
    expect(partner).toBeDefined()
    expect(partner?.availability).toBe('on_delivery')
    expect(db.deliveries.find((d) => d.orderId === order.id)?.status).toBe('assigned')

    applyStatus(db, order, 'delivered', new Date(now + 5 * MINUTE).toISOString(), 'Delivered')
    expect(partner?.availability).toBe('available')
    expect(db.deliveries.find((d) => d.orderId === order.id)?.status).toBe('delivered')
    expect(order.payment.status).toBe('paid')
  })
})

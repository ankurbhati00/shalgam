import type { CheckoutOptions, DeliverySlot, HomeFeed, Product } from '@shalgam/types'
import { http, HttpResponse } from 'msw'

import { getDb } from '../db/store'
import { simulate } from '../lib/http'
import { getNumber } from '../lib/list'

const DAY = 86_400_000

function unitsSoldSince(days: number): Map<string, number> {
  const db = getDb()
  const since = Date.now() - days * DAY
  const counts = new Map<string, number>()
  for (const order of db.orders) {
    if (order.status === 'cancelled' || new Date(order.placedAt).getTime() < since) continue
    for (const item of order.items)
      counts.set(item.productId, (counts.get(item.productId) ?? 0) + item.quantity)
  }
  return counts
}

function buildSlots(now: Date): DeliverySlot[] {
  const db = getDb()
  const zone = db.locations[0]
  const expressMinutes = zone?.etaMinutes ?? 12
  const slots: DeliverySlot[] = []
  if (db.settings.expressDeliveryEnabled) {
    slots.push({
      id: 'slot_express',
      label: `Express · ${expressMinutes}–${expressMinutes + 8} min`,
      start: now.toISOString(),
      end: new Date(now.getTime() + (expressMinutes + 8) * 60_000).toISOString(),
      fee: 0,
      isExpress: true,
      isAvailable: now.getHours() >= 6 && now.getHours() < 23,
    })
  }
  const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  for (const dayOffset of [0, 1]) {
    const day = new Date(now)
    day.setDate(day.getDate() + dayOffset)
    for (const hour of [8, 10, 12, 14, 16, 18, 20]) {
      const start = new Date(day)
      start.setHours(hour, 0, 0, 0)
      const end = new Date(start.getTime() + 2 * 60 * 60_000)
      if (start.getTime() < now.getTime() + 45 * 60_000) continue
      slots.push({
        id: `slot_${dayKey(day)}_${String(hour).padStart(2, '0')}`,
        label: `${dayOffset === 0 ? 'Today' : 'Tomorrow'} · ${fmt(start)} – ${fmt(end)}`,
        start: start.toISOString(),
        end: end.toISOString(),
        fee: 0,
        isExpress: false,
        isAvailable: true,
      })
      if (slots.length >= 8) return slots
    }
  }
  return slots
}

export const storefrontHandlers = [
  http.get('*/api/locations', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    return HttpResponse.json(getDb().locations)
  }),

  http.get('*/api/storefront/home', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const locationId = url.searchParams.get('locationId')
    const location = db.locations.find((l) => l.id === locationId) ?? db.locations[0]
    if (!location)
      return HttpResponse.json(
        { error: { code: 'not_found', message: 'No locations' } },
        { status: 404 },
      )

    const active = db.products.filter((p) => p.status === 'active' && p.stock > 0)
    const sold = unitsSoldSince(30)
    const popular = active
      .slice()
      .sort((a, b) => (sold.get(b.id) ?? 0) - (sold.get(a.id) ?? 0))
      .slice(0, 10)

    // "Frequently bought": products that co-occur most with the shopper's own past orders.
    const mine = db.orders.filter(
      (o) => o.customerId === db.currentUserId && o.status !== 'cancelled',
    )
    const myCounts = new Map<string, number>()
    for (const order of mine)
      for (const item of order.items)
        myCounts.set(item.productId, (myCounts.get(item.productId) ?? 0) + item.quantity)
    const frequentlyBought = active
      .filter((p) => myCounts.has(p.id))
      .sort((a, b) => (myCounts.get(b.id) ?? 0) - (myCounts.get(a.id) ?? 0))
      .slice(0, 10)

    const deals = active
      .filter((p) => p.discountPercent >= 15)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 10)

    const popularIds = new Set(popular.map((p) => p.id))
    const recommended: Product[] = active
      .filter((p) => !popularIds.has(p.id) && !myCounts.has(p.id))
      .sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count)
      .slice(0, 10)

    const feed: HomeFeed = {
      location,
      promotions: db.promotions,
      categories: db.categories
        .filter((c) => c.parentId === null && c.isActive)
        .sort((a, b) => a.position - b.position),
      popular,
      frequentlyBought,
      deals,
      recommended,
    }
    return HttpResponse.json(feed)
  }),

  http.get('*/api/checkout/options', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const subtotal = getNumber(url, 'subtotal') ?? 0
    const options: CheckoutOptions = {
      slots: buildSlots(new Date()),
      deliveryFee: subtotal >= db.settings.freeDeliveryThreshold ? 0 : db.settings.deliveryFee,
      freeDeliveryThreshold: db.settings.freeDeliveryThreshold,
      handlingFee: db.settings.handlingFee,
      minimumOrderValue: db.settings.minimumOrderValue,
    }
    return HttpResponse.json(options)
  }),
]

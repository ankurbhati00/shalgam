import type { DeliveryStats, DeliveryStatus } from '@shalgam/types'
import { http, HttpResponse } from 'msw'

import { advanceLiveOrders } from '../db/live'
import { getDb, persist } from '../db/store'
import { notFound, readJson, simulate, validationError } from '../lib/http'
import { getAll, getBoolean, matchesQuery, paginate, parseListParams, sortItems } from '../lib/list'

const ACTIVE: DeliveryStatus[] = ['assigned', 'picked_up', 'on_the_way']
const STATUS_RANK: Record<DeliveryStatus, number> = {
  pending: 0,
  assigned: 1,
  picked_up: 2,
  on_the_way: 3,
  delivered: 4,
  failed: 5,
}

export const deliveryHandlers = [
  http.get('*/api/deliveries', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    if (advanceLiveOrders(db)) persist()
    const url = new URL(request.url)
    const params = parseListParams(url, { sort: 'createdAt' })
    const statuses = getAll(url, 'status')
    const zones = getAll(url, 'zone')
    const partnerId = url.searchParams.get('partnerId')
    const delayed = getBoolean(url, 'delayed')
    const deliveries = db.deliveries.filter((d) => {
      if (statuses.length > 0 && !statuses.includes(d.status)) return false
      if (zones.length > 0 && !zones.includes(d.zone)) return false
      if (partnerId && d.partnerId !== partnerId) return false
      if (delayed !== undefined && d.isDelayed !== delayed) return false
      return matchesQuery(
        params.q,
        d.orderNumber,
        d.customerName,
        d.partner?.name,
        d.addressSummary,
      )
    })
    const sorted = sortItems(deliveries, params.sort, params.order, {
      createdAt: (d) => d.createdAt,
      status: (d) => STATUS_RANK[d.status],
      eta: (d) => d.eta,
      distanceKm: (d) => d.distanceKm,
      zone: (d) => d.zone,
      partner: (d) => d.partner?.name ?? null,
      customerName: (d) => d.customerName,
    })
    return HttpResponse.json(paginate(sorted, params.page, params.pageSize))
  }),

  http.get('*/api/deliveries/stats', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const today = new Date().toDateString()
    const completedToday = db.deliveries.filter(
      (d) =>
        d.status === 'delivered' &&
        d.deliveredAt &&
        new Date(d.deliveredAt).toDateString() === today,
    )
    const durations = completedToday
      .map((d) =>
        d.deliveredAt && d.createdAt
          ? (new Date(d.deliveredAt).getTime() - new Date(d.createdAt).getTime()) / 60_000
          : null,
      )
      .filter((m): m is number => m !== null)
    const last7 = db.deliveries.filter(
      (d) =>
        d.status === 'delivered' && Date.now() - new Date(d.createdAt).getTime() < 7 * 86_400_000,
    )
    const stats: DeliveryStats = {
      active: db.deliveries.filter((d) => ACTIVE.includes(d.status)).length,
      completedToday: completedToday.length,
      delayed: db.deliveries.filter((d) => d.isDelayed && ACTIVE.includes(d.status)).length,
      averageMinutes: durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
      onTimeRate: last7.length
        ? Math.round((last7.filter((d) => !d.isDelayed).length / last7.length) * 1000) / 10
        : 100,
    }
    return HttpResponse.json(stats)
  }),

  http.get('*/api/delivery-partners', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    return HttpResponse.json(getDb().partners)
  }),

  http.patch<{ id: string }>('*/api/deliveries/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const delivery = db.deliveries.find((d) => d.id === params.id)
    if (!delivery) return notFound('Delivery')
    const input = (await readJson<{ partnerId?: string; status?: DeliveryStatus }>(request)) ?? {}
    if (input.partnerId !== undefined) {
      const partner = db.partners.find((p) => p.id === input.partnerId)
      if (!partner) return validationError({ partnerId: ['Unknown delivery partner.'] })
      delivery.partnerId = partner.id
      delivery.partner = {
        id: partner.id,
        name: partner.name,
        phone: partner.phone,
        vehicle: partner.vehicle,
      }
      if (delivery.status === 'pending') delivery.status = 'assigned'
      delivery.assignedAt = delivery.assignedAt ?? new Date().toISOString()
      const order = db.orders.find((o) => o.id === delivery.orderId)
      if (order) order.deliveryPartnerId = partner.id
    }
    if (input.status) {
      if (!(input.status in STATUS_RANK)) return validationError({ status: ['Unknown status.'] })
      delivery.status = input.status
      const now = new Date().toISOString()
      if (input.status === 'picked_up' || input.status === 'on_the_way')
        delivery.pickedUpAt = delivery.pickedUpAt ?? now
      if (input.status === 'delivered') delivery.deliveredAt = now
    }
    persist()
    return HttpResponse.json(delivery)
  }),
]

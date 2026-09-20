import type {
  BulkUpdateOrdersInput,
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatus,
  UpdateOrderInput,
} from '@shalgam/types'
import { http, HttpResponse } from 'msw'

import { advanceLiveOrders, applyStatus } from '../db/live'
import { computePricing, recomputeCustomerStats } from '../db/seed'
import { getDb, persist } from '../db/store'
import { errorResponse, notFound, orNull, readJson, simulate, validationError } from '../lib/http'
import { getAll, inRange, matchesQuery, paginate, parseListParams, sortItems } from '../lib/list'

const STATUS_ORDER: Record<OrderStatus, number> = {
  placed: 0,
  preparing: 1,
  packed: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 5,
}

const NOTES: Record<OrderStatus, string> = {
  placed: 'Order confirmed',
  preparing: 'Picking your items',
  packed: 'Packed and ready for pickup',
  out_for_delivery: 'Rider is on the way',
  delivered: 'Delivered. Enjoy!',
  cancelled: 'Order cancelled',
}

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false
  if (from === 'delivered' || from === 'cancelled') return false
  if (to === 'cancelled') return true
  return STATUS_ORDER[to] === STATUS_ORDER[from] + 1
}

function findOrder(id: string): Order | undefined {
  return getDb().orders.find((o) => o.id === id || o.number === id)
}

function slotFor(slotId: string, now: Date): Order['slot'] | null {
  const db = getDb()
  if (slotId === 'slot_express') {
    const zone = db.locations[0]
    const eta = (zone?.etaMinutes ?? 12) + 8
    return {
      id: slotId,
      label: `Express · ${zone?.etaMinutes ?? 12}–${eta} min`,
      start: now.toISOString(),
      end: new Date(now.getTime() + eta * 60_000).toISOString(),
    }
  }
  const match = /^slot_(\d{4}-\d{2}-\d{2})_(\d{2})$/.exec(slotId)
  if (!match) return null
  const [, day, hour] = match
  const start = new Date(`${day}T${hour}:00:00`)
  const end = new Date(start.getTime() + 2 * 60 * 60_000)
  const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return {
    id: slotId,
    label: `${fmt(start)} – ${fmt(end)}`,
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export const orderHandlers = [
  http.get('*/api/orders', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    if (advanceLiveOrders(db)) persist()
    const url = new URL(request.url)
    const params = parseListParams(url, { sort: 'placedAt' })
    const statuses = getAll(url, 'status')
    const paymentStatuses = getAll(url, 'paymentStatus')
    const deliveryStatuses = getAll(url, 'deliveryStatus')
    const paymentMethods = getAll(url, 'paymentMethod')
    const customerId = url.searchParams.get('customerId')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const orders = db.orders.filter((o) => {
      if (customerId && o.customerId !== customerId) return false
      if (statuses.length > 0 && !statuses.includes(o.status)) return false
      if (paymentStatuses.length > 0 && !paymentStatuses.includes(o.payment.status)) return false
      if (deliveryStatuses.length > 0 && !deliveryStatuses.includes(o.deliveryStatus)) return false
      if (paymentMethods.length > 0 && !paymentMethods.includes(o.payment.method)) return false
      if (!inRange(o.placedAt, from, to)) return false
      return matchesQuery(params.q, o.number, o.customer.name, o.customer.phone, o.address.pincode)
    })
    const sorted = sortItems(orders, params.sort, params.order, {
      placedAt: (o) => o.placedAt,
      total: (o) => o.pricing.total,
      itemCount: (o) => o.itemCount,
      status: (o) => STATUS_ORDER[o.status],
      customer: (o) => o.customer.name,
      number: (o) => o.number,
      paymentStatus: (o) => o.payment.status,
      deliveryStatus: (o) => o.deliveryStatus,
    })
    return HttpResponse.json(paginate(sorted, params.page, params.pageSize))
  }),

  http.get<{ id: string }>('*/api/orders/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    if (advanceLiveOrders(db)) persist()
    const order = findOrder(params.id)
    return order ? HttpResponse.json(order) : notFound('Order')
  }),

  http.post('*/api/orders', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const input = await readJson<Partial<CreateOrderInput>>(request)
    if (!input) return errorResponse(400, 'bad_request', 'Order payload is missing.')

    const errors: Record<string, string[]> = {}
    const requestedItems = Array.isArray(input.items) ? input.items : []
    if (requestedItems.length === 0) errors.items = ['Your cart is empty.']
    const address = db.addresses.find(
      (a) => a.id === input.addressId && a.customerId === db.currentUserId,
    )
    if (!address) errors.addressId = ['Choose a delivery address.']
    const now = new Date()
    const slot = slotFor(input.slotId ?? '', now)
    if (!slot) errors.slotId = ['Choose a delivery slot.']
    const paymentMethod = input.paymentMethod
    if (paymentMethod !== 'upi' && paymentMethod !== 'card' && paymentMethod !== 'cod')
      errors.paymentMethod = ['Choose a payment method.']

    const items: OrderItem[] = []
    for (const line of requestedItems) {
      const product = db.products.find((p) => p.id === line.productId)
      if (product?.status !== 'active') {
        errors.items = [...(errors.items ?? []), `A product in your cart is no longer available.`]
        continue
      }
      const quantity = Math.max(1, Math.floor(line.quantity))
      if (quantity > product.maxPerOrder) {
        errors.items = [
          ...(errors.items ?? []),
          `${product.name}: maximum ${product.maxPerOrder} per order.`,
        ]
      }
      if (quantity > product.stock) {
        errors.items = [
          ...(errors.items ?? []),
          `${product.name}: only ${product.stock} left in stock.`,
        ]
      }
      items.push({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unit: product.unit,
        quantity,
        unitPrice: product.price,
        mrp: product.mrp,
        lineTotal: Math.round(product.price * quantity * 100) / 100,
      })
    }
    if (Object.keys(errors).length > 0 || paymentMethod === undefined)
      return validationError(errors, 'We could not place this order.')

    const slotFee = 0
    const pricing = computePricing(items, db.settings, Math.max(0, input.tip ?? 0), slotFee)
    if (pricing.subtotal < db.settings.minimumOrderValue) {
      return validationError(
        { items: [`Minimum order value is ₹${db.settings.minimumOrderValue}.`] },
        'Add a few more items.',
      )
    }

    const customer = db.customers.find((c) => c.id === db.currentUserId)
    if (!customer || !address || !slot)
      return errorResponse(500, 'server_error', 'Customer profile is missing.')

    const sequence = db.orders.length + 1
    const number = `SHL-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(sequence % 10000).padStart(4, '0')}`
    const order: Order = {
      id: `ord_${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      number,
      customerId: customer.id,
      customer: { id: customer.id, name: customer.name, phone: customer.phone },
      items,
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
      address: { ...address },
      slot,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId:
          paymentMethod === 'cod'
            ? null
            : `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
      },
      status: 'placed',
      deliveryStatus: 'pending',
      deliveryPartnerId: null,
      pricing,
      timeline: [{ status: 'placed', at: now.toISOString(), note: NOTES.placed }],
      eta: slot.end,
      note: orNull(input.note),
      cancelReason: null,
      placedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      deliveredAt: null,
    }
    db.orders.unshift(order)

    // Reserve stock and record ledger movements.
    for (const item of items) {
      const product = db.products.find((p) => p.id === item.productId)
      const inventory = db.inventory.find((i) => i.productId === item.productId)
      if (product) product.stock = Math.max(0, product.stock - item.quantity)
      if (inventory) {
        inventory.reserved += item.quantity
        inventory.available = Math.max(0, inventory.onHand - inventory.reserved)
        inventory.status =
          inventory.available === 0
            ? 'out_of_stock'
            : inventory.available <= inventory.reorderLevel
              ? 'low_stock'
              : 'in_stock'
        inventory.updatedAt = now.toISOString()
        db.movements.unshift({
          id: `mov_${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
          productId: item.productId,
          productName: item.name,
          type: 'sale',
          quantity: -item.quantity,
          balanceAfter: inventory.available,
          reference: order.number,
          note: null,
          actor: 'system',
          createdAt: now.toISOString(),
        })
      }
    }
    recomputeCustomerStats(db.customers, db.orders)
    persist()
    return HttpResponse.json(order, { status: 201 })
  }),

  http.patch<{ id: string }>('*/api/orders/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const order = findOrder(params.id)
    if (!order) return notFound('Order')
    const input = (await readJson<UpdateOrderInput>(request)) ?? {}
    const now = new Date().toISOString()

    if (input.status) {
      if (!canTransition(order.status, input.status)) {
        return errorResponse(
          409,
          'conflict',
          `Cannot move an order from "${order.status}" to "${input.status}".`,
        )
      }
      if (input.status === 'cancelled')
        order.cancelReason = input.cancelReason ?? 'Cancelled by Shalgam'
      applyStatus(
        db,
        order,
        input.status,
        now,
        input.status === 'cancelled' ? order.cancelReason : NOTES[input.status],
      )
    }
    if (input.deliveryPartnerId !== undefined) {
      const partner = input.deliveryPartnerId
        ? db.partners.find((p) => p.id === input.deliveryPartnerId)
        : null
      if (input.deliveryPartnerId && !partner)
        return validationError({ deliveryPartnerId: ['Unknown delivery partner.'] })
      order.deliveryPartnerId = partner?.id ?? null
      const delivery = db.deliveries.find((d) => d.orderId === order.id)
      if (delivery) {
        delivery.partnerId = partner?.id ?? null
        delivery.partner = partner
          ? { id: partner.id, name: partner.name, phone: partner.phone, vehicle: partner.vehicle }
          : null
        if (partner && delivery.status === 'pending') delivery.status = 'assigned'
      }
      order.updatedAt = now
    }
    recomputeCustomerStats(db.customers, db.orders)
    persist()
    return HttpResponse.json(order)
  }),

  http.post<{ id: string }>('*/api/orders/:id/cancel', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const order = findOrder(params.id)
    if (!order) return notFound('Order')
    if (!canTransition(order.status, 'cancelled')) {
      return errorResponse(409, 'conflict', 'This order can no longer be cancelled.')
    }
    if (STATUS_ORDER[order.status] >= STATUS_ORDER.out_for_delivery) {
      return errorResponse(
        409,
        'conflict',
        'The rider is already on the way. Please contact support.',
      )
    }
    const body = (await readJson<{ reason?: string }>(request)) ?? {}
    order.cancelReason = orNull(body.reason) ?? 'Customer requested cancellation'
    applyStatus(db, order, 'cancelled', new Date().toISOString(), order.cancelReason)
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId)
      const inventory = db.inventory.find((i) => i.productId === item.productId)
      if (product) product.stock += item.quantity
      if (inventory) {
        inventory.reserved = Math.max(0, inventory.reserved - item.quantity)
        inventory.available = Math.max(0, inventory.onHand - inventory.reserved)
        inventory.status =
          inventory.available === 0
            ? 'out_of_stock'
            : inventory.available <= inventory.reorderLevel
              ? 'low_stock'
              : 'in_stock'
      }
    }
    recomputeCustomerStats(db.customers, db.orders)
    persist()
    return HttpResponse.json(order)
  }),

  http.post('*/api/orders/bulk-status', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const input = await readJson<BulkUpdateOrdersInput>(request)
    if (!input || !Array.isArray(input.ids) || input.ids.length === 0)
      return validationError({ ids: ['Select at least one order.'] })
    const now = new Date().toISOString()
    const updated: Order[] = []
    for (const id of input.ids) {
      const order = db.orders.find((o) => o.id === id)
      if (!order || !canTransition(order.status, input.status)) continue
      if (input.status === 'cancelled') order.cancelReason = 'Cancelled by Shalgam'
      applyStatus(db, order, input.status, now, NOTES[input.status])
      updated.push(order)
    }
    recomputeCustomerStats(db.customers, db.orders)
    persist()
    return HttpResponse.json(updated)
  }),
]

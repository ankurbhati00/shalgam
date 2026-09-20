import type { DeliveryStatus, Order, OrderStatus } from '@shalgam/types'

import type { MockDatabase } from './seed'

const MINUTE = 60_000

/** Minutes after placement at which a live order reaches each stage. */
const LIVE_STEPS: ReadonlyArray<
  readonly [status: Exclude<OrderStatus, 'placed' | 'cancelled'>, minutes: number, note: string]
> = [
  ['preparing', 1.5, 'Picking your items'],
  ['packed', 5, 'Packed and ready for pickup'],
  ['out_for_delivery', 8, 'Rider is on the way'],
  ['delivered', 17, 'Delivered. Enjoy!'],
]

const ORDER_INDEX: Record<OrderStatus, number> = {
  placed: 0,
  preparing: 1,
  packed: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 5,
}

export function deliveryStatusForOrder(status: OrderStatus): DeliveryStatus {
  switch (status) {
    case 'placed':
    case 'preparing':
      return 'pending'
    case 'packed':
      return 'assigned'
    case 'out_for_delivery':
      return 'on_the_way'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'failed'
  }
}

/**
 * Moves in-flight orders along the fulfilment timeline as wall-clock time passes,
 * so order tracking and the admin dashboard feel alive without a real backend.
 */
export function advanceLiveOrders(db: MockDatabase, now = Date.now()): boolean {
  let changed = false
  for (const order of db.orders) {
    if (order.status === 'delivered' || order.status === 'cancelled') continue
    const placedAt = new Date(order.placedAt).getTime()
    for (const [status, minutes, note] of LIVE_STEPS) {
      const at = placedAt + minutes * MINUTE
      if (at > now || ORDER_INDEX[order.status] >= ORDER_INDEX[status]) continue
      applyStatus(db, order, status, new Date(at).toISOString(), note)
      changed = true
    }
  }
  return changed
}

/** Central transition routine used by both the simulator and admin mutations. */
export function applyStatus(
  db: MockDatabase,
  order: Order,
  status: OrderStatus,
  at: string,
  note: string | null,
): void {
  order.status = status
  order.deliveryStatus = deliveryStatusForOrder(status)
  order.updatedAt = at
  order.timeline.push({ status, at, note })

  if (status === 'delivered') {
    order.deliveredAt = at
    order.eta = null
    if (order.payment.method === 'cod') order.payment.status = 'paid'
  }
  if (status === 'cancelled') {
    order.eta = null
    if (order.payment.status === 'paid') order.payment.status = 'refunded'
  }

  let delivery = db.deliveries.find((d) => d.orderId === order.id)
  if (!delivery && status !== 'cancelled' && ORDER_INDEX[status] >= ORDER_INDEX.packed) {
    const zone = db.locations.find((l) => l.pincode === order.address.pincode)
    delivery = {
      id: `dlv_${order.id.slice(4)}`,
      orderId: order.id,
      orderNumber: order.number,
      customerName: order.customer.name,
      addressSummary: `${order.address.line1}, ${zone?.label ?? order.address.city}`,
      zone: zone?.label ?? order.address.city,
      partnerId: null,
      partner: null,
      status: 'assigned',
      distanceKm: Math.round((1 + Math.random() * 3.5) * 10) / 10,
      eta: order.eta,
      isDelayed: false,
      assignedAt: at,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: order.placedAt,
    }
    db.deliveries.unshift(delivery)
  }
  if (delivery) {
    delivery.status = order.deliveryStatus
    if (!delivery.partnerId && status !== 'cancelled') {
      const partner = db.partners.find((p) => p.availability === 'available') ?? db.partners[0]
      if (partner) {
        delivery.partnerId = partner.id
        delivery.partner = {
          id: partner.id,
          name: partner.name,
          phone: partner.phone,
          vehicle: partner.vehicle,
        }
        order.deliveryPartnerId = partner.id
        partner.availability = 'on_delivery'
        partner.deliveriesToday += 1
      }
    }
    if (status === 'out_for_delivery') delivery.pickedUpAt = at
    if (status === 'delivered') {
      delivery.deliveredAt = at
      delivery.eta = null
      const partner = db.partners.find((p) => p.id === delivery.partnerId)
      if (partner) partner.availability = 'available'
    }
    if (status === 'cancelled') delivery.status = 'failed'
    if (order.eta && status !== 'delivered' && status !== 'cancelled') {
      delivery.isDelayed = new Date(order.eta).getTime() < Date.now()
    }
  }
}

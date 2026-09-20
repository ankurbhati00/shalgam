import type { DateRangeParams, ISODateString, ListParams, Rupees } from './common'
import type { Address } from './customer'

export type OrderStatus =
  'placed' | 'preparing' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'

export const ORDER_STATUS_FLOW: readonly OrderStatus[] = [
  'placed',
  'preparing',
  'packed',
  'out_for_delivery',
  'delivered',
]

export type PaymentMethod = 'upi' | 'card' | 'cod'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type DeliveryStatus =
  'pending' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'

export interface OrderItem {
  productId: string
  name: string
  imageUrl: string
  unit: string
  quantity: number
  unitPrice: Rupees
  mrp: Rupees
  lineTotal: Rupees
}

export interface OrderPricing {
  subtotal: Rupees
  /** Sum of (mrp − price) × qty across items. */
  discount: Rupees
  deliveryFee: Rupees
  handlingFee: Rupees
  tip: Rupees
  total: Rupees
  /** Discount + waived delivery fee, shown as "You saved". */
  savings: Rupees
}

export interface OrderTimelineEvent {
  status: OrderStatus
  at: ISODateString
  note: string | null
}

export interface DeliverySlot {
  id: string
  label: string
  start: ISODateString
  end: ISODateString
  fee: Rupees
  isExpress: boolean
  isAvailable: boolean
}

export interface OrderPayment {
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
}

export interface Order {
  id: string
  /** Human-readable order number, e.g. `SHL-240918-0042`. */
  number: string
  customerId: string
  customer: {
    id: string
    name: string
    phone: string
  }
  items: OrderItem[]
  itemCount: number
  address: Address
  slot: Pick<DeliverySlot, 'id' | 'label' | 'start' | 'end'>
  payment: OrderPayment
  status: OrderStatus
  deliveryStatus: DeliveryStatus
  deliveryPartnerId: string | null
  pricing: OrderPricing
  timeline: OrderTimelineEvent[]
  eta: ISODateString | null
  note: string | null
  cancelReason: string | null
  placedAt: ISODateString
  updatedAt: ISODateString
  deliveredAt: ISODateString | null
}

export interface OrderListParams extends ListParams, DateRangeParams {
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  deliveryStatus?: DeliveryStatus[]
  paymentMethod?: PaymentMethod[]
  customerId?: string
}

export interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>
  addressId: string
  slotId: string
  paymentMethod: PaymentMethod
  tip: Rupees
  note: string | null
}

export interface UpdateOrderInput {
  status?: OrderStatus
  deliveryPartnerId?: string | null
  cancelReason?: string
}

export interface BulkUpdateOrdersInput {
  ids: string[]
  status: OrderStatus
}

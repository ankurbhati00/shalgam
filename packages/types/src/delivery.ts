import type { ISODateString, ListParams } from './common'
import type { DeliveryStatus } from './order'

export type Vehicle = 'bike' | 'scooter' | 'cycle'
export type PartnerAvailability = 'available' | 'on_delivery' | 'offline'

export interface DeliveryPartner {
  id: string
  name: string
  phone: string
  vehicle: Vehicle
  rating: number
  availability: PartnerAvailability
  zone: string
  deliveriesToday: number
}

export interface Delivery {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  addressSummary: string
  zone: string
  partnerId: string | null
  partner: Pick<DeliveryPartner, 'id' | 'name' | 'phone' | 'vehicle'> | null
  status: DeliveryStatus
  distanceKm: number
  eta: ISODateString | null
  isDelayed: boolean
  assignedAt: ISODateString | null
  pickedUpAt: ISODateString | null
  deliveredAt: ISODateString | null
  createdAt: ISODateString
}

export interface DeliveryListParams extends ListParams {
  status?: DeliveryStatus[]
  partnerId?: string
  zone?: string[]
  delayed?: boolean
}

export interface DeliveryStats {
  active: number
  completedToday: number
  delayed: number
  averageMinutes: number
  onTimeRate: number
}

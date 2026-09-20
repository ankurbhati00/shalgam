import type { Category, Product } from './catalog'
import type { DeliverySlot } from './order'

export interface Location {
  id: string
  label: string
  area: string
  city: string
  pincode: string
  /** Promised delivery time in minutes for this location. */
  etaMinutes: number
  isServiceable: boolean
}

export interface Promotion {
  id: string
  title: string
  subtitle: string
  ctaLabel: string
  href: string
  tint: Category['tint']
  imageUrl: string
  badge: string | null
}

export interface HomeFeed {
  location: Location
  promotions: Promotion[]
  categories: Category[]
  popular: Product[]
  frequentlyBought: Product[]
  deals: Product[]
  recommended: Product[]
}

export interface CheckoutOptions {
  slots: DeliverySlot[]
  deliveryFee: number
  freeDeliveryThreshold: number
  handlingFee: number
  minimumOrderValue: number
}

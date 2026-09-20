import type { Rupees } from './common'

export interface StoreSettings {
  storeName: string
  supportEmail: string
  supportPhone: string
  currency: 'INR'
  deliveryFee: Rupees
  freeDeliveryThreshold: Rupees
  handlingFee: Rupees
  minimumOrderValue: Rupees
  lowStockThreshold: number
  expressDeliveryEnabled: boolean
  serviceablePincodes: string[]
  notifications: {
    orderPlaced: boolean
    orderDelayed: boolean
    lowStock: boolean
    dailyDigest: boolean
  }
}

export type StoreSettingsInput = Partial<StoreSettings>

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'ops' | 'catalog' | 'support'
  avatarUrl: string | null
}

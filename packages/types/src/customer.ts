import type { ISODateString, ListParams, Rupees } from './common'

export type CustomerStatus = 'active' | 'inactive' | 'blocked'
export type CustomerTier = 'new' | 'regular' | 'loyal' | 'vip'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  city: string
  status: CustomerStatus
  tier: CustomerTier
  ordersCount: number
  totalSpent: Rupees
  averageOrderValue: Rupees
  lastOrderAt: ISODateString | null
  joinedAt: ISODateString
}

export interface CustomerListParams extends ListParams {
  status?: CustomerStatus[]
  tier?: CustomerTier[]
  city?: string[]
}

export type AddressLabel = 'home' | 'work' | 'other'

export interface Address {
  id: string
  customerId: string
  label: AddressLabel
  recipientName: string
  phone: string
  line1: string
  line2: string | null
  landmark: string | null
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export type AddressInput = Omit<Address, 'id' | 'customerId'>

/** The signed-in shopper as seen by the storefront. */
export interface CurrentUser {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  defaultAddressId: string | null
}

import type {
  CustomerStatus,
  CustomerTier,
  InventoryMovementType,
  PartnerAvailability,
  ProductStatus,
  Vehicle,
} from '@shalgam/types'
import { defineStatusMap } from '@shalgam/ui'

export const productStatusMap = defineStatusMap<ProductStatus>({
  active: { label: 'Active', tone: 'success' },
  draft: { label: 'Draft', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
})

export const customerStatusMap = defineStatusMap<CustomerStatus>({
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  blocked: { label: 'Blocked', tone: 'danger' },
})

export const customerTierMap = defineStatusMap<CustomerTier>({
  new: { label: 'New', tone: 'info' },
  regular: { label: 'Regular', tone: 'neutral' },
  loyal: { label: 'Loyal', tone: 'brand' },
  vip: { label: 'VIP', tone: 'warning' },
})

export const movementTypeMap = defineStatusMap<InventoryMovementType>({
  restock: { label: 'Restock', tone: 'success' },
  sale: { label: 'Sale', tone: 'info' },
  adjustment: { label: 'Adjustment', tone: 'neutral' },
  return: { label: 'Return', tone: 'brand' },
  damage: { label: 'Damage', tone: 'danger' },
})

export const partnerAvailabilityMap = defineStatusMap<PartnerAvailability>({
  available: { label: 'Available', tone: 'success' },
  on_delivery: { label: 'On delivery', tone: 'info' },
  offline: { label: 'Offline', tone: 'neutral' },
})

export const VEHICLE_LABELS: Record<Vehicle, string> = {
  bike: 'Bike',
  scooter: 'Scooter',
  cycle: 'Cycle',
}

import type { AdminUser, CurrentUser, StoreSettings } from '@shalgam/types'

import { zones } from './pools'

export const defaultSettings: StoreSettings = {
  storeName: 'Shalgam',
  supportEmail: 'help@shalgam.in',
  supportPhone: '+91 80 4567 8900',
  currency: 'INR',
  deliveryFee: 29,
  freeDeliveryThreshold: 299,
  handlingFee: 9,
  minimumOrderValue: 99,
  lowStockThreshold: 15,
  expressDeliveryEnabled: true,
  serviceablePincodes: zones.map((zone) => zone.pincode),
  notifications: {
    orderPlaced: true,
    orderDelayed: true,
    lowStock: true,
    dailyDigest: false,
  },
}

/** The storefront's signed-in shopper. Fictional. */
export const currentUserSeed: Omit<CurrentUser, 'defaultAddressId'> = {
  id: 'cus_ananya',
  name: 'Ananya Rao',
  email: 'ananya.rao@example.com',
  phone: '+91 98450 12345',
  avatarUrl: null,
}

export const adminUserSeed: AdminUser = {
  id: 'adm_kabir',
  name: 'Kabir Mehta',
  email: 'kabir@shalgam.in',
  role: 'admin',
  avatarUrl: null,
}

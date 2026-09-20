import { analyticsHandlers } from './analytics'
import { catalogHandlers } from './catalog'
import { customerHandlers } from './customers'
import { deliveryHandlers } from './delivery'
import { inventoryHandlers } from './inventory'
import { orderHandlers } from './orders'
import { settingsHandlers } from './settings'
import { storefrontHandlers } from './storefront'

/** Every REST handler for the Shalgam mock API, in matching order. */
export const handlers = [
  ...storefrontHandlers,
  ...catalogHandlers,
  ...orderHandlers,
  ...customerHandlers,
  ...inventoryHandlers,
  ...deliveryHandlers,
  ...analyticsHandlers,
  ...settingsHandlers,
]

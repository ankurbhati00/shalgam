import { type ApiClient, createApiClient } from './http'
import { createAnalyticsService } from './services/analytics'
import { createCatalogService } from './services/catalog'
import { createCustomerService } from './services/customers'
import { createDeliveryService } from './services/delivery'
import { createInventoryService } from './services/inventory'
import { createOrderService } from './services/orders'
import { createSettingsService } from './services/settings'
import { createStorefrontService } from './services/storefront'

/** Builds the full set of resource services on top of one transport. */
export function createApi(client: ApiClient) {
  return {
    client,
    catalog: createCatalogService(client),
    orders: createOrderService(client),
    customers: createCustomerService(client),
    inventory: createInventoryService(client),
    delivery: createDeliveryService(client),
    analytics: createAnalyticsService(client),
    storefront: createStorefrontService(client),
    settings: createSettingsService(client),
  }
}

export type Api = ReturnType<typeof createApi>

/**
 * Default transport. Apps call `apiClient.configure({ baseUrl })` during bootstrap
 * when they want to talk to something other than `/api`.
 */
export const apiClient = createApiClient({ baseUrl: '/api' })

/** Default service bundle shared by the apps and the query layer. */
export const api = createApi(apiClient)

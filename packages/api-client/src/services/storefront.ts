import type { CheckoutOptions, HomeFeed, Location } from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createStorefrontService(client: ApiClient) {
  return {
    home: (locationId: string | undefined, options?: RequestOptions) =>
      client.get<HomeFeed>('/storefront/home', { ...options, params: { locationId } }),

    listLocations: (options?: RequestOptions) => client.get<Location[]>('/locations', options),

    checkoutOptions: (subtotal: number, options?: RequestOptions) =>
      client.get<CheckoutOptions>('/checkout/options', { ...options, params: { subtotal } }),
  }
}

export type StorefrontService = ReturnType<typeof createStorefrontService>

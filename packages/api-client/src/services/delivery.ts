import type {
  Delivery,
  DeliveryListParams,
  DeliveryPartner,
  DeliveryStats,
  DeliveryStatus,
  Paginated,
} from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createDeliveryService(client: ApiClient) {
  return {
    list: (params: DeliveryListParams = {}, options?: RequestOptions) =>
      client.get<Paginated<Delivery>>('/deliveries', { ...options, params: { ...params } }),

    stats: (options?: RequestOptions) => client.get<DeliveryStats>('/deliveries/stats', options),

    listPartners: (options?: RequestOptions) =>
      client.get<DeliveryPartner[]>('/delivery-partners', options),

    assignPartner: (id: string, partnerId: string) =>
      client.patch<Delivery>(`/deliveries/${encodeURIComponent(id)}`, { partnerId }),

    updateStatus: (id: string, status: DeliveryStatus) =>
      client.patch<Delivery>(`/deliveries/${encodeURIComponent(id)}`, { status }),
  }
}

export type DeliveryService = ReturnType<typeof createDeliveryService>

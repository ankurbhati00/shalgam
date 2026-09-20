import type {
  BulkUpdateOrdersInput,
  CreateOrderInput,
  Order,
  OrderListParams,
  Paginated,
  UpdateOrderInput,
} from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createOrderService(client: ApiClient) {
  return {
    list: (params: OrderListParams = {}, options?: RequestOptions) =>
      client.get<Paginated<Order>>('/orders', { ...options, params: { ...params } }),

    get: (id: string, options?: RequestOptions) =>
      client.get<Order>(`/orders/${encodeURIComponent(id)}`, options),

    create: (input: CreateOrderInput) => client.post<Order>('/orders', input),

    update: (id: string, input: UpdateOrderInput) =>
      client.patch<Order>(`/orders/${encodeURIComponent(id)}`, input),

    cancel: (id: string, reason: string) =>
      client.post<Order>(`/orders/${encodeURIComponent(id)}/cancel`, { reason }),

    bulkUpdateStatus: (input: BulkUpdateOrdersInput) =>
      client.post<Order[]>('/orders/bulk-status', input),
  }
}

export type OrderService = ReturnType<typeof createOrderService>

import type {
  InventoryItem,
  InventoryListParams,
  InventoryMovement,
  InventoryMovementListParams,
  InventorySummary,
  Paginated,
  StockAdjustmentInput,
} from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createInventoryService(client: ApiClient) {
  return {
    list: (params: InventoryListParams = {}, options?: RequestOptions) =>
      client.get<Paginated<InventoryItem>>('/inventory', { ...options, params: { ...params } }),

    summary: (options?: RequestOptions) =>
      client.get<InventorySummary>('/inventory/summary', options),

    listMovements: (params: InventoryMovementListParams = {}, options?: RequestOptions) =>
      client.get<Paginated<InventoryMovement>>('/inventory/movements', {
        ...options,
        params: { ...params },
      }),

    adjust: (input: StockAdjustmentInput) =>
      client.post<InventoryMovement>('/inventory/adjustments', input),
  }
}

export type InventoryService = ReturnType<typeof createInventoryService>

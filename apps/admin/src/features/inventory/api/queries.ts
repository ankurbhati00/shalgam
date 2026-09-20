import { api, getErrorMessage, isApiError } from '@shalgam/api-client'
import { inventoryQueries, queryKeys } from '@shalgam/query'
import type {
  InventoryListParams,
  InventoryMovementListParams,
  StockAdjustmentInput,
} from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useInventory(params: InventoryListParams) {
  return useQuery(inventoryQueries.list(params))
}

export function useInventorySummary() {
  return useQuery(inventoryQueries.summary())
}

export function useInventoryMovements(params: InventoryMovementListParams) {
  return useQuery(inventoryQueries.movements(params))
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StockAdjustmentInput) => api.inventory.adjust(input),
    onSuccess: (movement) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success(
        'Stock updated',
        `${movement.productName}: now ${movement.balanceAfter} on hand.`,
      )
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not adjust stock', getErrorMessage(error))
    },
  })
}

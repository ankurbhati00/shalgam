import { api } from '@shalgam/api-client'
import { queryKeys } from '@shalgam/query'
import type { CreateOrderInput, Order } from '@shalgam/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

/** Places the order; the caller decides what to do on success (clear cart, navigate). */
export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.orders.create(input),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      // Stock changed — product lists and details should refresh when next viewed.
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

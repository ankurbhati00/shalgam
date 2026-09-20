import { api } from '@shalgam/api-client'
import { orderQueries, queryKeys } from '@shalgam/query'
import type { Order, OrderListParams } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useCurrentUser } from '../../session/api/queries'

const ACTIVE_STATUSES: Array<Order['status']> = [
  'placed',
  'preparing',
  'packed',
  'out_for_delivery',
]

export function isActiveOrder(order: Order): boolean {
  return ACTIVE_STATUSES.includes(order.status)
}

export function useMyOrders(params: Omit<OrderListParams, 'customerId'>) {
  const { data: me } = useCurrentUser()
  return useQuery({ ...orderQueries.list({ ...params, customerId: me?.id }), enabled: !!me })
}

/** Order detail; polls while the order is in flight so tracking updates live. */
export function useOrder(id: string) {
  return useQuery({
    ...orderQueries.detail(id),
    refetchInterval: (query) =>
      query.state.data && isActiveOrder(query.state.data) ? 5000 : false,
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.orders.cancel(id, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success('Order cancelled', 'Any payment will be refunded within 3–5 days.')
    },
    onError: (error) => toast.error('Could not cancel order', error.message),
  })
}

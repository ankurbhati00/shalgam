import { api, getErrorMessage } from '@shalgam/api-client'
import { orderQueries, queryKeys } from '@shalgam/query'
import type { BulkUpdateOrdersInput, Order, OrderListParams, OrderStatus } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deliveryStatusForOrder, isActiveOrder, statusLabel } from '../lib/order-status'

export function useOrders(params: OrderListParams) {
  return useQuery(orderQueries.list(params))
}

/** Order detail; polls while the order is in flight so the timeline updates live. */
export function useOrder(id: string) {
  return useQuery({
    ...orderQueries.detail(id),
    enabled: id.length > 0,
    refetchInterval: (query) =>
      query.state.data && isActiveOrder(query.state.data) ? 8000 : false,
  })
}

function invalidateAfterOrderChange(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  if (id) void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
}

/** Moves an order to the next stage. Optimistic on the detail cache; rolls back on failure. */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.orders.update(id, { status }),
    onMutate: async ({ id, status }) => {
      const key = queryKeys.orders.detail(id)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Order>(key)
      if (previous) {
        const at = new Date().toISOString()
        queryClient.setQueryData<Order>(key, {
          ...previous,
          status,
          deliveryStatus: deliveryStatusForOrder(status),
          updatedAt: at,
          timeline: [...previous.timeline, { status, at, note: null }],
        })
      }
      return { previous }
    },
    onError: (error, { id }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.orders.detail(id), context.previous)
      toast.error('Could not update order', getErrorMessage(error))
    },
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      toast.success(`Order ${order.number} marked ${statusLabel(order.status).toLowerCase()}`)
    },
    onSettled: (_order, _error, { id }) => invalidateAfterOrderChange(queryClient, id),
  })
}

export function useAssignRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, partnerId }: { id: string; partnerId: string | null }) =>
      api.orders.update(id, { deliveryPartnerId: partnerId }),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      toast.success(order.deliveryPartnerId ? 'Rider assigned' : 'Rider unassigned')
    },
    onError: (error) => toast.error('Could not assign rider', getErrorMessage(error)),
    onSettled: (_order, _error, { id }) => invalidateAfterOrderChange(queryClient, id),
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.orders.cancel(id, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      toast.success(`Order ${order.number} cancelled`)
    },
    onError: (error) => toast.error('Could not cancel order', getErrorMessage(error)),
    onSettled: (_order, _error, { id }) => invalidateAfterOrderChange(queryClient, id),
  })
}

export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BulkUpdateOrdersInput) => api.orders.bulkUpdateStatus(input),
    onSuccess: (updated, input) => {
      for (const order of updated)
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      const skipped = input.ids.length - updated.length
      toast.success(
        `${updated.length} ${updated.length === 1 ? 'order' : 'orders'} marked ${statusLabel(input.status).toLowerCase()}`,
        skipped > 0
          ? `${skipped} could not move to this status from their current stage.`
          : undefined,
      )
    },
    onError: (error) => toast.error('Bulk update failed', getErrorMessage(error)),
    onSettled: () => invalidateAfterOrderChange(queryClient),
  })
}

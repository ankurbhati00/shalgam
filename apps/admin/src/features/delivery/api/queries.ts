import { api, getErrorMessage } from '@shalgam/api-client'
import { deliveryQueries, queryKeys } from '@shalgam/query'
import type { DeliveryListParams } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useDeliveries(params: DeliveryListParams) {
  return useQuery(deliveryQueries.list(params))
}

export function useDeliveryStats() {
  return useQuery(deliveryQueries.stats())
}

export function useDeliveryPartners() {
  return useQuery(deliveryQueries.partners())
}

export function useAssignDeliveryPartner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, partnerId }: { id: string; partnerId: string }) =>
      api.delivery.assignPartner(id, partnerId),
    onSuccess: (delivery) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      toast.success(
        'Partner assigned',
        `${delivery.partner?.name ?? 'Rider'} will handle ${delivery.orderNumber}.`,
      )
    },
    onError: (error) => toast.error('Could not assign partner', getErrorMessage(error)),
  })
}

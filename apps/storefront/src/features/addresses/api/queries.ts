import { api, isApiError } from '@shalgam/api-client'
import { customerQueries, queryKeys } from '@shalgam/query'
import type { Address, AddressInput } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useAddresses() {
  return useQuery(customerQueries.addresses())
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AddressInput) => api.customers.createAddress(input),
    onSuccess: (address) => {
      queryClient.setQueryData<Address[]>(queryKeys.customers.addresses, (previous) =>
        previous
          ? [...previous.map((a) => (address.isDefault ? { ...a, isDefault: false } : a)), address]
          : [address],
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      toast.success('Address saved')
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not save address', error.message)
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
      api.customers.updateAddress(id, input),
    onSuccess: (address) => {
      queryClient.setQueryData<Address[]>(queryKeys.customers.addresses, (previous) =>
        previous?.map((a) =>
          a.id === address.id ? address : address.isDefault ? { ...a, isDefault: false } : a,
        ),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      toast.success('Address updated')
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not update address', error.message)
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.customers.deleteAddress(id),
    // Optimistic removal: the list updates instantly and rolls back on failure.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.addresses })
      const previous = queryClient.getQueryData<Address[]>(queryKeys.customers.addresses)
      queryClient.setQueryData<Address[]>(queryKeys.customers.addresses, (list) =>
        list?.filter((a) => a.id !== id),
      )
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.customers.addresses, context.previous)
      toast.error('Could not delete address', error.message)
    },
    onSettled: () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.addresses }),
  })
}

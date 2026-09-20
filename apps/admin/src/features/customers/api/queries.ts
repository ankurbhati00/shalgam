import { api, getErrorMessage } from '@shalgam/api-client'
import { customerQueries, queryKeys } from '@shalgam/query'
import type { CustomerListParams, CustomerStatus } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCustomers(params: CustomerListParams) {
  return useQuery(customerQueries.list(params))
}

export function useCustomer(id: string) {
  return useQuery({ ...customerQueries.detail(id), enabled: id.length > 0 })
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      api.customers.updateStatus(id, status),
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customers.detail(customer.id), customer)
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      toast.success(
        customer.status === 'blocked'
          ? `${customer.name} has been blocked`
          : `${customer.name} is ${customer.status}`,
      )
    },
    onError: (error) => toast.error('Could not update customer', getErrorMessage(error)),
  })
}

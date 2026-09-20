import type {
  Address,
  AddressInput,
  CurrentUser,
  Customer,
  CustomerListParams,
  Paginated,
} from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createCustomerService(client: ApiClient) {
  return {
    list: (params: CustomerListParams = {}, options?: RequestOptions) =>
      client.get<Paginated<Customer>>('/customers', { ...options, params: { ...params } }),

    get: (id: string, options?: RequestOptions) =>
      client.get<Customer>(`/customers/${encodeURIComponent(id)}`, options),

    updateStatus: (id: string, status: Customer['status']) =>
      client.patch<Customer>(`/customers/${encodeURIComponent(id)}`, { status }),

    /** The signed-in shopper (storefront). */
    me: (options?: RequestOptions) => client.get<CurrentUser>('/me', options),

    listAddresses: (options?: RequestOptions) => client.get<Address[]>('/addresses', options),

    createAddress: (input: AddressInput) => client.post<Address>('/addresses', input),

    updateAddress: (id: string, input: Partial<AddressInput>) =>
      client.patch<Address>(`/addresses/${encodeURIComponent(id)}`, input),

    deleteAddress: (id: string) => client.delete(`/addresses/${encodeURIComponent(id)}`),
  }
}

export type CustomerService = ReturnType<typeof createCustomerService>

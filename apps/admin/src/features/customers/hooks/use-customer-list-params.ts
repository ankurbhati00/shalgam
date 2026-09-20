import type { CustomerListParams, CustomerStatus, CustomerTier } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { useTableState } from '../../../hooks/use-table-state'

export const CUSTOMER_STATUSES: readonly CustomerStatus[] = ['active', 'inactive', 'blocked']
export const CUSTOMER_TIERS: readonly CustomerTier[] = ['new', 'regular', 'loyal', 'vip']

function isCustomerStatus(value: string): value is CustomerStatus {
  return (CUSTOMER_STATUSES as readonly string[]).includes(value)
}

function isCustomerTier(value: string): value is CustomerTier {
  return (CUSTOMER_TIERS as readonly string[]).includes(value)
}

export function useCustomerListParams() {
  const { get, getAll, set } = useSearchParamState()
  const table = useTableState({ sort: 'lastOrderAt', order: 'desc' })
  const q = get('q') ?? ''
  const status = getAll('status').filter(isCustomerStatus)
  const tier = getAll('tier').filter(isCustomerTier)
  const statusKey = status.join(',')
  const tierKey = tier.join(',')

  const params = useMemo<CustomerListParams>(
    () => ({
      q: q || undefined,
      status: status.length > 0 ? status : undefined,
      tier: tier.length > 0 ? tier : undefined,
      sort: table.sort,
      order: table.order,
      page: table.page,
      pageSize: table.pageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- arrays are re-derived from the URL; key on their content
    [q, statusKey, tierKey, table.sort, table.order, table.page, table.pageSize],
  )

  return {
    params,
    q,
    status,
    tier,
    activeFilterCount: (q ? 1 : 0) + (status.length > 0 ? 1 : 0) + (tier.length > 0 ? 1 : 0),
    table,
    setQ: (value: string) => set({ q: value.trim() || null }, { resetPage: true, replace: true }),
    setStatus: (value: CustomerStatus[]) => set({ status: value }, { resetPage: true }),
    setTier: (value: CustomerTier[]) => set({ tier: value }, { resetPage: true }),
    clearFilters: () => set({ q: null, status: null, tier: null, page: null }),
  }
}

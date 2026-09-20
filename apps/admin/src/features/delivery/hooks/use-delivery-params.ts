import type { DeliveryListParams, DeliveryStatus } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { useTableState } from '../../../hooks/use-table-state'

export type DeliveryTab = 'active' | 'delayed' | 'completed'

export const DELIVERY_TABS: ReadonlyArray<{ value: DeliveryTab; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'completed', label: 'Completed' },
]

const ACTIVE_DELIVERY_STATUSES: DeliveryStatus[] = [
  'pending',
  'assigned',
  'picked_up',
  'on_the_way',
]
const COMPLETED_DELIVERY_STATUSES: DeliveryStatus[] = ['delivered', 'failed']

function isDeliveryTab(value: string | null): value is DeliveryTab {
  return value === 'active' || value === 'delayed' || value === 'completed'
}

export function useDeliveryParams() {
  const { get, set } = useSearchParamState()
  const tabParam = get('tab')
  const tab: DeliveryTab = isDeliveryTab(tabParam) ? tabParam : 'active'
  const table = useTableState({ sort: 'createdAt', order: 'desc' })
  const q = get('q') ?? ''

  const params = useMemo<DeliveryListParams>(
    () => ({
      q: q || undefined,
      status:
        tab === 'active'
          ? ACTIVE_DELIVERY_STATUSES
          : tab === 'completed'
            ? COMPLETED_DELIVERY_STATUSES
            : ACTIVE_DELIVERY_STATUSES,
      delayed: tab === 'delayed' ? true : undefined,
      sort: table.sort,
      order: table.order,
      page: table.page,
      pageSize: table.pageSize,
    }),
    [q, tab, table.sort, table.order, table.page, table.pageSize],
  )

  return {
    tab,
    q,
    params,
    table,
    setTab: (next: DeliveryTab) => set({ tab: next === 'active' ? null : next, page: null }),
    setQ: (value: string) => set({ q: value.trim() || null }, { resetPage: true, replace: true }),
  }
}

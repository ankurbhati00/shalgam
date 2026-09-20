import type { OrderListParams, OrderStatus, PaymentStatus } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { useTableState } from '../../../hooks/use-table-state'
import { type DateRange, type RangeChoice, rangeToIso, resolveRange } from '../../../lib/date-range'
import { ACTIVE_ORDER_STATUSES, isOrderStatus, isPaymentStatus } from '../lib/order-status'

export type OrderQuickFilter = 'all' | 'active' | 'delivered' | 'cancelled' | 'custom'

export const ORDER_QUICK_FILTERS: ReadonlyArray<{
  value: Exclude<OrderQuickFilter, 'custom'>
  label: string
  statuses: readonly OrderStatus[]
}> = [
  { value: 'all', label: 'All', statuses: [] },
  { value: 'active', label: 'Active', statuses: ACTIVE_ORDER_STATUSES },
  { value: 'delivered', label: 'Delivered', statuses: ['delivered'] },
  { value: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
]

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item))
}

/** Orders table state — search, filters, date range, sort and pagination — all in the URL. */
export function useOrderListParams(base: Pick<OrderListParams, 'customerId'> = {}) {
  const { get, getAll, set } = useSearchParamState()
  const table = useTableState({ sort: 'placedAt', order: 'desc' })
  const q = get('q') ?? ''
  const status = getAll('status').filter(isOrderStatus)
  const paymentStatus = getAll('paymentStatus').filter(isPaymentStatus)
  const rangeParam = get('range')
  const resolved = rangeParam ? resolveRange(rangeParam, get('from'), get('to')) : null
  const dateChoice: RangeChoice | 'all' = resolved?.choice ?? 'all'
  const dateRange = resolved?.range ?? null
  const statusKey = status.join(',')
  const paymentStatusKey = paymentStatus.join(',')
  const customerId = base.customerId

  const params = useMemo<OrderListParams>(() => {
    const iso = dateRange ? rangeToIso(dateRange) : undefined
    return {
      customerId,
      q: q || undefined,
      status: status.length > 0 ? status : undefined,
      paymentStatus: paymentStatus.length > 0 ? paymentStatus : undefined,
      from: iso?.from,
      to: iso?.to,
      sort: table.sort,
      order: table.order,
      page: table.page,
      pageSize: table.pageSize,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- arrays are re-derived from the URL each render; key on their content
  }, [
    customerId,
    q,
    statusKey,
    paymentStatusKey,
    dateRange?.from,
    dateRange?.to,
    table.sort,
    table.order,
    table.page,
    table.pageSize,
  ])

  const quickFilter: OrderQuickFilter =
    ORDER_QUICK_FILTERS.find((option) => sameSet(option.statuses, status))?.value ?? 'custom'
  const activeFilterCount =
    (q ? 1 : 0) +
    (status.length > 0 ? 1 : 0) +
    (paymentStatus.length > 0 ? 1 : 0) +
    (dateRange ? 1 : 0)

  return {
    params,
    q,
    status,
    paymentStatus,
    dateChoice,
    dateRange,
    quickFilter,
    activeFilterCount,
    table,
    setQ: (value: string) => set({ q: value.trim() || null }, { resetPage: true, replace: true }),
    setStatus: (value: OrderStatus[]) => set({ status: value }, { resetPage: true }),
    setPaymentStatus: (value: PaymentStatus[]) =>
      set({ paymentStatus: value }, { resetPage: true }),
    setQuickFilter: (value: Exclude<OrderQuickFilter, 'custom'>) =>
      set(
        {
          status: [
            ...(ORDER_QUICK_FILTERS.find((option) => option.value === value)?.statuses ?? []),
          ],
        },
        { resetPage: true },
      ),
    setDateRange: (next: { choice: RangeChoice | 'all'; range: DateRange | null }) =>
      set(
        next.choice === 'all'
          ? { range: null, from: null, to: null }
          : {
              range: next.choice,
              from: next.choice === 'custom' ? next.range?.from : null,
              to: next.choice === 'custom' ? next.range?.to : null,
            },
        { resetPage: true },
      ),
    clearFilters: () =>
      set({
        q: null,
        status: null,
        paymentStatus: null,
        range: null,
        from: null,
        to: null,
        page: null,
      }),
  }
}

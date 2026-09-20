import type { ReportParams, ReportType } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { type DateRange, type RangeChoice, rangeToIso, resolveRange } from '../../../lib/date-range'

export const REPORT_TYPES: ReadonlyArray<{
  value: ReportType
  label: string
  description: string
}> = [
  { value: 'sales', label: 'Sales', description: 'Revenue and orders by day.' },
  { value: 'orders', label: 'Orders', description: 'Every order in the period.' },
  { value: 'inventory', label: 'Inventory', description: 'Stock levels and value by SKU.' },
  { value: 'customers', label: 'Customers', description: 'Spend and frequency per customer.' },
]

function isReportType(value: string | null): value is ReportType {
  return value === 'sales' || value === 'orders' || value === 'inventory' || value === 'customers'
}

export function useReportParams() {
  const { get, set } = useSearchParamState()
  const typeParam = get('type')
  const type: ReportType = isReportType(typeParam) ? typeParam : 'sales'
  const { choice, range } = resolveRange(get('range'), get('from'), get('to'), '30d')
  const categoryId = get('category')

  const { from, to } = range
  const params = useMemo<ReportParams>(() => {
    const iso = rangeToIso({ from, to })
    return { type, from: iso.from, to: iso.to, categoryId: categoryId ?? undefined }
  }, [type, from, to, categoryId])

  return {
    type,
    choice,
    range,
    categoryId,
    params,
    setType: (next: ReportType) => set({ type: next === 'sales' ? null : next }),
    setRange: (next: { choice: RangeChoice | 'all'; range: DateRange | null }) =>
      set(
        next.choice === 'custom'
          ? { range: 'custom', from: next.range?.from, to: next.range?.to }
          : { range: next.choice === 'all' ? null : next.choice, from: null, to: null },
      ),
    setCategory: (value: string | null) => set({ category: value }),
  }
}

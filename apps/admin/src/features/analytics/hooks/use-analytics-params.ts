import type { AnalyticsParams } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { type DateRange, type RangeChoice, rangeToIso, resolveRange } from '../../../lib/date-range'

export type Granularity = 'day' | 'week'

/** Analytics filter bar state: date range, category and granularity, all in the URL. */
export function useAnalyticsParams() {
  const { get, set } = useSearchParamState()
  const { choice, range } = resolveRange(get('range'), get('from'), get('to'), '30d')
  const categoryId = get('category')
  const granularity: Granularity = get('granularity') === 'week' ? 'week' : 'day'

  const { from, to } = range
  const params = useMemo<AnalyticsParams>(() => {
    const iso = rangeToIso({ from, to })
    return { from: iso.from, to: iso.to, categoryId: categoryId ?? undefined, granularity }
  }, [from, to, categoryId, granularity])

  return {
    choice,
    range,
    categoryId,
    granularity,
    params,
    setRange: (next: { choice: RangeChoice | 'all'; range: DateRange | null }) =>
      set(
        next.choice === 'custom'
          ? { range: 'custom', from: next.range?.from, to: next.range?.to }
          : { range: next.choice === 'all' ? null : next.choice, from: null, to: null },
      ),
    setCategory: (value: string | null) => set({ category: value }),
    setGranularity: (value: Granularity) => set({ granularity: value === 'day' ? null : value }),
  }
}

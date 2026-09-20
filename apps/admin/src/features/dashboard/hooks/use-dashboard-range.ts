import type { AnalyticsParams } from '@shalgam/types'
import { useMemo } from 'react'

import { useSearchParamState } from '../../../hooks/use-search-param-state'
import { isRangePreset, presetRange, type RangePreset, rangeToIso } from '../../../lib/date-range'

/** Dashboard period pills (7d / 30d / 90d) held in the URL. */
export function useDashboardRange() {
  const { get, set } = useSearchParamState()
  const rangeParam = get('range')
  const preset: RangePreset = isRangePreset(rangeParam) ? rangeParam : '30d'
  const range = presetRange(preset)
  const { from, to } = range
  const params = useMemo<AnalyticsParams>(() => {
    const iso = rangeToIso({ from, to })
    return { from: iso.from, to: iso.to, granularity: preset === '90d' ? 'week' : 'day' }
  }, [from, to, preset])
  return {
    preset,
    range,
    params,
    setPreset: (next: RangePreset) =>
      set({ range: next === '30d' ? null : next }, { replace: true }),
  }
}

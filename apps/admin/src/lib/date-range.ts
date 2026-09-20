import { addDays, startOfDay, toDateKey } from '@shalgam/utils'

export type RangePreset = '7d' | '30d' | '90d'
export type RangeChoice = RangePreset | 'custom'

/** A closed date range expressed as local `YYYY-MM-DD` keys, the shape kept in the URL. */
export interface DateRange {
  from: string
  to: string
}

export const RANGE_PRESETS: ReadonlyArray<{ value: RangePreset; label: string; days: number }> = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
]

export function isRangePreset(value: string | null | undefined): value is RangePreset {
  return value === '7d' || value === '30d' || value === '90d'
}

export function presetDays(preset: RangePreset): number {
  return RANGE_PRESETS.find((option) => option.value === preset)?.days ?? 30
}

/** Local-time date for a `YYYY-MM-DD` key; `null` when malformed. */
export function parseDateKey(key: string | null | undefined): Date | null {
  if (!key) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** The last `days` days ending today, as date keys. */
export function presetRange(preset: RangePreset, now: Date = new Date()): DateRange {
  const today = startOfDay(now)
  return { from: toDateKey(addDays(today, -(presetDays(preset) - 1))), to: toDateKey(today) }
}

/** Resolves URL state (`range`, `from`, `to`) into a concrete range; falls back to the preset. */
export function resolveRange(
  choice: string | null,
  from: string | null,
  to: string | null,
  fallback: RangePreset = '30d',
): { choice: RangeChoice; range: DateRange } {
  if (choice === 'custom') {
    const fromDate = parseDateKey(from)
    const toDate = parseDateKey(to)
    if (fromDate && toDate) {
      const ordered = fromDate <= toDate ? { from, to } : { from: to, to: from }
      return { choice: 'custom', range: { from: ordered.from ?? '', to: ordered.to ?? '' } }
    }
  }
  const preset = isRangePreset(choice) ? choice : fallback
  return { choice: preset, range: presetRange(preset) }
}

/** ISO bounds for the API: local midnight at the start, end of day at the end. */
export function rangeToIso(range: DateRange): { from: string; to: string } {
  const from = parseDateKey(range.from) ?? startOfDay(new Date())
  const toStart = parseDateKey(range.to) ?? startOfDay(new Date())
  const to = new Date(toStart)
  to.setHours(23, 59, 59, 999)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function daysInRange(range: DateRange): number {
  const from = parseDateKey(range.from)
  const to = parseDateKey(range.to)
  if (!from || !to) return 0
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1
}

/** Human label such as "vs previous 30 days" for KPI deltas. */
export function comparisonLabel(range: DateRange): string {
  const days = daysInRange(range)
  return days > 0 ? `vs previous ${days} days` : 'vs previous period'
}

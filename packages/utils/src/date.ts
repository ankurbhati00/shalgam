const dateShort = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const dateMedium = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dateLong = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })
const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})
const relativeFormat = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' })

export type DateStyle = 'short' | 'medium' | 'long'

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

export function formatDate(value: Date | string, style: DateStyle = 'medium'): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  switch (style) {
    case 'short':
      return dateShort.format(date)
    case 'long':
      return dateLong.format(date)
    default:
      return dateMedium.format(date)
  }
}

export function formatTime(value: Date | string): string {
  const date = toDate(value)
  return Number.isNaN(date.getTime()) ? '—' : timeFormat.format(date)
}

export function formatDateTime(value: Date | string): string {
  const date = toDate(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date)
}

/** `formatRelativeTime(fiveMinutesAgo)` → `5 minutes ago`; supports past and future. */
export function formatRelativeTime(value: Date | string, now: Date = new Date()): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const abs = Math.abs(diffSeconds)
  if (abs < 60) return relativeFormat.format(diffSeconds, 'second')
  if (abs < 3600) return relativeFormat.format(Math.round(diffSeconds / 60), 'minute')
  if (abs < 86_400) return relativeFormat.format(Math.round(diffSeconds / 3600), 'hour')
  if (abs < 86_400 * 30) return relativeFormat.format(Math.round(diffSeconds / 86_400), 'day')
  return formatDate(date)
}

/** Minutes until `value`, floored at zero. */
export function minutesUntil(value: Date | string, now: Date = new Date()): number {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.round((date.getTime() - now.getTime()) / 60_000))
}

/** `formatDuration(95)` → `1 hr 35 min`. */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safe / 60)
  const mins = safe % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

export function startOfDay(value: Date): Date {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function addDays(value: Date, days: number): Date {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date
}

/** `YYYY-MM-DD` in local time, handy for URL state and grouping. */
export function toDateKey(value: Date | string): string {
  const date = toDate(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return toDateKey(a) === toDateKey(b)
}

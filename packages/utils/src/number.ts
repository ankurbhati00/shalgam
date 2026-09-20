const numberFormat = new Intl.NumberFormat('en-IN')
const compactFormat = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const percentFormat = new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 1 })

/** `formatNumber(1234567)` → `12,34,567` (Indian grouping). */
export function formatNumber(value: number): string {
  return numberFormat.format(Number.isFinite(value) ? value : 0)
}

/** `formatCompactNumber(125000)` → `1.3L`. */
export function formatCompactNumber(value: number): string {
  return compactFormat.format(Number.isFinite(value) ? value : 0)
}

/** Accepts a ratio (0.125) and returns `12.5%`. */
export function formatPercent(ratio: number): string {
  return percentFormat.format(Number.isFinite(ratio) ? ratio : 0)
}

/** Accepts a percentage value (12.5) and returns a signed label such as `+12.5%`. */
export function formatSignedPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0
  const sign = safe > 0 ? '+' : safe < 0 ? '−' : ''
  return `${sign}${Math.abs(safe).toFixed(fractionDigits)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function sum(values: Iterable<number>): number {
  let total = 0
  for (const value of values) total += value
  return total
}

export function average(values: number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length
}

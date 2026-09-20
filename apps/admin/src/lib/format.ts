import type { PaymentMethod } from '@shalgam/types'
import { formatCompactNumber, formatINR, formatNumber, formatPercent } from '@shalgam/utils'

/** Compact rupees for axes and KPI tiles: ₹1.2L, ₹3.4Cr. */
export function formatCompactINR(value: number): string {
  return formatINR(value, { style: 'compact' })
}

/** Percent from a 0–100 value (the analytics API reports rates as percentages). */
export function formatRate(value: number, fractionDigits = 1): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(fractionDigits)}%`
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  cod: 'Cash on delivery',
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method]
}

/** Signed quantity for inventory ledgers: +12 / −3. */
export function formatSigned(value: number): string {
  if (value > 0) return `+${formatNumber(value)}`
  if (value < 0) return `−${formatNumber(Math.abs(value))}`
  return '0'
}

/** Formats a report value by its declared column/summary format. */
export function formatByKind(
  value: string | number | null | undefined,
  kind: 'text' | 'number' | 'currency' | 'percent' | 'date',
  formatDate: (value: string) => string,
): string {
  if (value === null || value === undefined || value === '') return '—'
  switch (kind) {
    case 'currency':
      return typeof value === 'number' ? formatINR(value) : value
    case 'number':
      return typeof value === 'number' ? formatNumber(value) : value
    case 'percent':
      return typeof value === 'number' ? formatPercent(value) : value
    case 'date':
      return formatDate(String(value))
    default:
      return String(value)
  }
}

export { formatCompactNumber }

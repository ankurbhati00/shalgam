const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export interface FormatINROptions {
  /** `whole` drops paise (default), `precise` always shows two decimals, `compact` gives ₹1.2L / ₹3.4Cr. */
  style?: 'whole' | 'precise' | 'compact'
}

/** Formats rupees with Indian digit grouping: `formatINR(124999)` → `₹1,24,999`. */
export function formatINR(amount: number, { style = 'whole' }: FormatINROptions = {}): string {
  const safe = Number.isFinite(amount) ? amount : 0
  switch (style) {
    case 'precise':
      return inrPrecise.format(safe)
    case 'compact':
      return inrCompact.format(safe)
    default:
      return inrWhole.format(Math.round(safe))
  }
}

/** Percentage off MRP, rounded to a whole number; never negative. */
export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

/** Rounds to two decimals, avoiding floating point drift in totals. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

import { describe, expect, it } from 'vitest'

import { chunk, groupBy, uniqueBy } from './collection'
import { discountPercent, formatINR, roundMoney } from './currency'
import { formatDuration, formatRelativeTime, minutesUntil, toDateKey } from './date'
import { formatCompactNumber, formatNumber, formatSignedPercent } from './number'
import { countLabel, humanize, initials, maskPhone, slugify, truncate } from './string'

describe('currency', () => {
  it('formats rupees with Indian digit grouping', () => {
    expect(formatINR(124999)).toBe('₹1,24,999')
    expect(formatINR(42.6)).toBe('₹43')
    expect(formatINR(42.5, { style: 'precise' })).toBe('₹42.50')
  })

  it('formats compact rupees using lakh/crore notation', () => {
    expect(formatINR(125000, { style: 'compact' })).toMatch(/₹1\.2\s?L|₹1\.3\s?L/)
  })

  it('computes discount percentage and never goes negative', () => {
    expect(discountPercent(100, 80)).toBe(20)
    expect(discountPercent(100, 120)).toBe(0)
    expect(discountPercent(0, 10)).toBe(0)
  })

  it('rounds money to two decimals', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
  })
})

describe('number', () => {
  it('formats numbers and signed percentages', () => {
    expect(formatNumber(1234567)).toBe('12,34,567')
    expect(formatSignedPercent(12.345)).toBe('+12.3%')
    expect(formatSignedPercent(-4)).toBe('−4.0%')
    expect(formatCompactNumber(1500)).toMatch(/1\.5\s?K|1\.5T/)
  })
})

describe('date', () => {
  it('formats relative times in both directions', () => {
    const now = new Date('2026-09-18T10:00:00Z')
    expect(formatRelativeTime('2026-09-18T09:55:00Z', now)).toBe('5 minutes ago')
    expect(formatRelativeTime('2026-09-18T12:00:00Z', now)).toBe('in 2 hours')
  })

  it('derives minutes until an ETA and readable durations', () => {
    const now = new Date('2026-09-18T10:00:00Z')
    expect(minutesUntil('2026-09-18T10:12:30Z', now)).toBe(13)
    expect(minutesUntil('2026-09-18T09:00:00Z', now)).toBe(0)
    expect(formatDuration(95)).toBe('1 hr 35 min')
    expect(formatDuration(8)).toBe('8 min')
  })

  it('produces stable date keys', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('string', () => {
  it('handles pluralization, slugs and initials', () => {
    expect(countLabel(1, 'item')).toBe('1 item')
    expect(countLabel(3, 'item')).toBe('3 items')
    expect(slugify('Amul Taaza Toned Milk 500 ml')).toBe('amul-taaza-toned-milk-500-ml')
    expect(initials('Priya Sharma')).toBe('PS')
    expect(initials('Arjun')).toBe('A')
    expect(humanize('out_for_delivery')).toBe('Out for delivery')
    expect(truncate('Fresh Organic Tomatoes', 10)).toBe('Fresh Org…')
    expect(maskPhone('+91 98765 43210')).toBe('••••••••3210')
  })
})

describe('collection', () => {
  it('groups, dedupes and chunks', () => {
    const items = [
      { id: 1, cat: 'a' },
      { id: 2, cat: 'b' },
      { id: 3, cat: 'a' },
    ]
    expect(groupBy(items, (i) => i.cat).get('a')).toHaveLength(2)
    expect(uniqueBy([...items, { id: 1, cat: 'z' }], (i) => i.id)).toHaveLength(3)
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
})

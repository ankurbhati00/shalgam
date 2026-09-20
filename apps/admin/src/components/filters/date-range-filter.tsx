import { Input, Select } from '@shalgam/ui'

import {
  type DateRange,
  isRangePreset,
  type RangeChoice,
  RANGE_PRESETS,
} from '../../lib/date-range'

export interface DateRangeFilterProps {
  choice: RangeChoice | 'all'
  range: DateRange | null
  onChange: (next: { choice: RangeChoice | 'all'; range: DateRange | null }) => void
  /** Offer an "All time" option (listings); analytics always needs a bounded range. */
  allowAll?: boolean
  className?: string
}

type Choice = RangeChoice | 'all'

/** Preset date ranges with an inline custom range — the filter every admin reaches for first. */
export function DateRangeFilter({
  choice,
  range,
  onChange,
  allowAll = false,
  className,
}: DateRangeFilterProps) {
  const options: Array<{ value: Choice; label: string }> = [
    ...(allowAll ? [{ value: 'all' as const, label: 'All time' }] : []),
    ...RANGE_PRESETS.map((preset) => ({ value: preset.value, label: preset.label })),
    { value: 'custom', label: 'Custom range' },
  ]
  const from = range?.from ?? ''
  const to = range?.to ?? ''

  const handleChoice = (next: Choice | null) => {
    if (!next) return
    if (next === 'all') onChange({ choice: 'all', range: null })
    else if (isRangePreset(next)) onChange({ choice: next, range: null })
    else onChange({ choice: 'custom', range: { from, to } })
  }

  return (
    <div className={className ?? 'flex flex-wrap items-center gap-2'}>
      <Select<Choice>
        aria-label="Date range"
        size="sm"
        className="w-40"
        options={options}
        value={choice}
        onValueChange={handleChoice}
      />
      {choice === 'custom' && (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            size="sm"
            aria-label="From date"
            className="w-36"
            value={from}
            max={to || undefined}
            onValueChange={(value) => onChange({ choice: 'custom', range: { from: value, to } })}
          />
          <span aria-hidden className="text-xs text-text-subtle">
            to
          </span>
          <Input
            type="date"
            size="sm"
            aria-label="To date"
            className="w-36"
            value={to}
            min={from || undefined}
            onValueChange={(value) => onChange({ choice: 'custom', range: { from, to: value } })}
          />
        </div>
      )}
    </div>
  )
}

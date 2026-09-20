interface TooltipEntry {
  name?: string | number
  value?: unknown
  color?: string
  dataKey?: unknown
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: readonly TooltipEntry[]
  label?: string | number
  formatLabel?: (label: string | number) => string
  formatValue?: (value: number, key: string) => string
  /** Optional per-series labels keyed by dataKey. */
  seriesLabels?: Record<string, string>
}

/** Tooltip content: values lead, series names follow, keyed by a short line of the series colour. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatLabel,
  formatValue,
  seriesLabels,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="min-w-32 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      {label !== undefined && (
        <p className="mb-1.5 font-medium text-text-muted">
          {formatLabel ? formatLabel(label) : String(label)}
        </p>
      )}
      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const key =
            typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.name ?? index)
          const numeric = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0)
          const name = seriesLabels?.[key] ?? (typeof entry.name === 'string' ? entry.name : key)
          return (
            <li key={`${key}-${index}`} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-text-muted">
                <span
                  aria-hidden
                  className="inline-block h-0.5 w-3 rounded-full"
                  style={{ backgroundColor: entry.color ?? 'currentColor' }}
                />
                {name}
              </span>
              <span className="font-semibold text-text tabular">
                {formatValue ? formatValue(numeric, key) : numeric.toLocaleString('en-IN')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

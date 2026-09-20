import { cn } from '@shalgam/ui'

export interface LegendItem {
  label: string
  color: string
  /** Mirror the mark: rect for bars/areas, line for lines. */
  shape?: 'rect' | 'line'
  /** Optional value shown after the label (counts, shares). */
  value?: string
}

/** Always present for two or more series; identity is never colour-alone. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              'inline-block shrink-0',
              item.shape === 'line' ? 'h-0.5 w-3.5 rounded-full' : 'size-2.5 rounded-xs',
            )}
            style={{ backgroundColor: item.color }}
          />
          <span className="text-text">{item.label}</span>
          {item.value !== undefined && <span className="tabular">{item.value}</span>}
        </li>
      ))}
    </ul>
  )
}

import { formatNumber } from '@shalgam/utils'

import { ChartLegend } from './chart-legend'

export interface ShareSegment {
  key: string
  label: string
  value: number
  color: string
}

/** Single horizontal part-to-whole bar (plain HTML), with a legend that carries the counts. */
export function ShareBar({ segments, ariaLabel }: { segments: ShareSegment[]; ariaLabel: string }) {
  const total = segments.reduce((acc, segment) => acc + segment.value, 0)
  const visible = segments.filter((segment) => segment.value > 0)
  return (
    <div className="space-y-3">
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex h-4 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        {visible.map((segment, index) => (
          <span
            key={segment.key}
            className="h-full"
            style={{
              width: `${total === 0 ? 0 : (segment.value / total) * 100}%`,
              backgroundColor: segment.color,
              marginRight: index === visible.length - 1 ? 0 : 2,
            }}
          />
        ))}
      </div>
      <ChartLegend
        items={segments.map((segment) => ({
          label: segment.label,
          color: segment.color,
          value: `${formatNumber(segment.value)}${total > 0 ? ` · ${Math.round((segment.value / total) * 100)}%` : ''}`,
        }))}
      />
    </div>
  )
}

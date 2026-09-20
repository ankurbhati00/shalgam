import { cn } from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'

const OPTIONS = [0, 10, 20, 30]

export function TipSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (tip: number) => void
}) {
  return (
    <div role="radiogroup" aria-label="Rider tip" className="flex flex-wrap gap-2">
      {OPTIONS.map((tip) => (
        <button
          key={tip}
          type="button"
          role="radio"
          aria-checked={value === tip}
          onClick={() => onChange(tip)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium focus-ring transition-colors pointer-coarse:py-2.5',
            value === tip
              ? 'border-brand-600 bg-primary-muted text-primary-strong'
              : 'border-border-strong bg-surface text-text hover:bg-surface-muted',
          )}
        >
          {tip === 0 ? 'No tip' : formatINR(tip)}
        </button>
      ))}
    </div>
  )
}

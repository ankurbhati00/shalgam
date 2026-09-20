import { Slider as BaseSlider } from '@base-ui-components/react/slider'

import { cn } from '../../lib/cn'

export interface SliderProps {
  value?: number | number[]
  defaultValue?: number | number[]
  onValueChange?: (value: number | number[]) => void
  /** Called once the pointer is released — ideal for updating URL state. */
  onValueCommitted?: (value: number | number[]) => void
  min?: number
  max?: number
  step?: number
  name?: string
  disabled?: boolean
  className?: string
  /** Accessible name for each thumb (one per thumb for ranges). */
  thumbLabels: string[]
  /** Format the value announced to screen readers and shown in `showValue`. */
  format?: (value: number) => string
  showValue?: boolean
}

/** Single or range slider. Pass an array `value` for a range. */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  name,
  disabled,
  className,
  thumbLabels,
  format = (v) => String(v),
  showValue,
}: SliderProps) {
  return (
    <BaseSlider.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      onValueCommitted={(next) => onValueCommitted?.(next)}
      min={min}
      max={max}
      step={step}
      name={name}
      disabled={disabled}
      // Client-only alignment skips Base UI's SSR positioning script; Shalgam apps are SPAs.
      thumbAlignment="edge-client-only"
      className={cn('flex w-full flex-col gap-2', className)}
    >
      {showValue && (
        <BaseSlider.Value className="text-sm text-text-muted tabular">
          {(_formatted, values) => values.map(format).join(' – ')}
        </BaseSlider.Value>
      )}
      <BaseSlider.Control className="flex w-full touch-none items-center py-2 select-none data-[disabled]:opacity-50 pointer-coarse:py-3.5">
        <BaseSlider.Track className="relative h-1.5 w-full rounded-full bg-neutral-200">
          <BaseSlider.Indicator className="rounded-full bg-brand-500" />
          {thumbLabels.map((label, index) => (
            <BaseSlider.Thumb
              key={index}
              index={index}
              aria-label={label}
              getAriaValueText={(_formatted, current) => format(current)}
              className={cn(
                'size-5 rounded-full border-2 border-brand-600 bg-surface shadow-sm outline-none pointer-coarse:size-6',
                'transition-[box-shadow] duration-150 focus-visible:ring-[4px] focus-visible:ring-brand-400/40',
                'data-[dragging]:ring-[4px] data-[dragging]:ring-brand-400/40',
              )}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}

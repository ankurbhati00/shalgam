import { Switch as BaseSwitch } from '@base-ui-components/react/switch'
import { type ReactNode, useId } from 'react'

import { cn } from '../../lib/cn'

export interface SwitchProps extends Omit<BaseSwitch.Root.Props, 'className' | 'children'> {
  className?: string
  size?: 'sm' | 'md'
  label?: ReactNode
  description?: ReactNode
  'aria-label'?: string
  /** Place the label before the control (settings rows). */
  labelPosition?: 'start' | 'end'
}

/** Toggle for immediate on/off settings. Use Checkbox for form values that need submitting. */
export function Switch({
  className,
  size = 'md',
  label,
  description,
  labelPosition = 'end',
  disabled,
  ...props
}: SwitchProps) {
  const id = useId()
  const labelId = label ? `${id}-label` : undefined
  const descriptionId = description ? `${id}-description` : undefined
  const control = (
    <BaseSwitch.Root
      disabled={disabled}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-neutral-300 p-0.5 outline-none',
        'transition-colors duration-150 ease-out-soft',
        'focus-visible:ring-[3px] focus-visible:ring-brand-400/40',
        'data-[checked]:bg-brand-500 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        size === 'sm' ? 'h-5 w-8' : 'h-6 w-11',
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          'block rounded-full bg-white shadow-sm transition-transform duration-150 ease-out-soft',
          size === 'sm'
            ? 'size-3.5 data-[checked]:translate-x-3'
            : 'size-4.5 data-[checked]:translate-x-5',
        )}
      />
    </BaseSwitch.Root>
  )

  if (!label && !description) return control

  return (
    <label
      className={cn(
        'flex cursor-pointer items-start justify-between gap-3 pointer-coarse:py-2.5',
        labelPosition === 'end' && 'flex-row-reverse justify-end',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        {label && (
          <span id={labelId} className="text-sm leading-5 font-medium text-text">
            {label}
          </span>
        )}
        {description && (
          <span id={descriptionId} className="text-xs text-text-muted">
            {description}
          </span>
        )}
      </span>
      <span className="flex pt-0.5">{control}</span>
    </label>
  )
}

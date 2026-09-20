import { Radio as BaseRadio } from '@base-ui-components/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react/radio-group'
import { type ReactNode, useId } from 'react'

import { cn } from '../../lib/cn'

export interface RadioGroupProps extends Omit<BaseRadioGroup.Props, 'className' | 'onValueChange'> {
  className?: string
  /** Layout of the options. */
  orientation?: 'vertical' | 'horizontal'
  onValueChange?: (value: string) => void
  'aria-label'?: string
}

/** Group of mutually exclusive options. Compose with `Radio` or `RadioCard`. */
export function RadioGroup({
  className,
  orientation = 'vertical',
  onValueChange,
  ...props
}: RadioGroupProps) {
  return (
    <BaseRadioGroup
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
      onValueChange={(value) => onValueChange?.(String(value))}
      {...props}
    />
  )
}

export interface RadioProps extends Omit<BaseRadio.Root.Props, 'className' | 'children'> {
  className?: string
  label?: ReactNode
  description?: ReactNode
  'aria-label'?: string
}

export function Radio({ className, label, description, disabled, ...props }: RadioProps) {
  const id = useId()
  const labelId = label ? `${id}-label` : undefined
  const descriptionId = description ? `${id}-description` : undefined
  const control = (
    <BaseRadio.Root
      disabled={disabled}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface outline-none',
        'transition-[border-color,background-color,box-shadow] duration-150 ease-out-soft',
        'hover:border-neutral-400 focus-visible:border-brand-600 focus-visible:ring-[3px] focus-visible:ring-brand-400/40',
        'data-[checked]:border-primary data-[checked]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <BaseRadio.Indicator className="size-2 rounded-full bg-primary-foreground data-[unchecked]:hidden" />
    </BaseRadio.Root>
  )
  if (!label && !description) return control
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 pointer-coarse:py-2.5',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <span className="mt-0.5 flex">{control}</span>
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
    </label>
  )
}

export interface RadioCardProps extends Omit<
  BaseRadio.Root.Props,
  'className' | 'children' | 'title'
> {
  className?: string
  title: ReactNode
  description?: ReactNode
  /** Trailing slot, e.g. a price or badge. */
  addon?: ReactNode
  icon?: ReactNode
}

/** Radio rendered as a selectable card — used for delivery slots, payment methods and addresses. */
export function RadioCard({
  className,
  title,
  description,
  addon,
  icon,
  disabled,
  ...props
}: RadioCardProps) {
  return (
    <BaseRadio.Root
      disabled={disabled}
      className={cn(
        'group flex w-full cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-3.5 text-start outline-none',
        'transition-[border-color,background-color,box-shadow] duration-150 ease-out-soft',
        'hover:border-border-strong hover:bg-surface-subtle focus-visible:ring-[3px] focus-visible:ring-brand-400/40',
        'data-[checked]:border-brand-600 data-[checked]:bg-primary-muted/40 data-[checked]:ring-1 data-[checked]:ring-brand-600',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="mt-0.5 shrink-0 text-text-muted group-data-[checked]:text-primary-strong [&_svg]:size-5">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-text">{title}</span>
        {description && <span className="text-xs text-text-muted">{description}</span>}
      </span>
      {addon && <span className="shrink-0 text-sm font-medium text-text">{addon}</span>}
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface group-data-[checked]:border-primary group-data-[checked]:bg-primary"
      >
        <BaseRadio.Indicator className="size-2 rounded-full bg-primary-foreground data-[unchecked]:hidden" />
      </span>
    </BaseRadio.Root>
  )
}

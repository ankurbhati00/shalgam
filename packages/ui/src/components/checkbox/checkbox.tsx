import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox'
import type { VariantProps } from 'class-variance-authority'
import { Check, Minus } from 'lucide-react'
import { type ReactNode, useId } from 'react'

import { cn } from '../../lib/cn'
import { checkableVariants } from '../../lib/field-styles'

export interface CheckboxProps
  extends
    Omit<BaseCheckbox.Root.Props, 'className' | 'children'>,
    VariantProps<typeof checkableVariants> {
  className?: string
  /** Visible label; rendered inside a `<label>` so the whole row is clickable. */
  label?: ReactNode
  description?: ReactNode
  /** Accessible name when no visible label is given. */
  'aria-label'?: string
  invalid?: boolean
}

/** Checkbox built on Base UI: keyboard accessible, supports indeterminate, submits via a hidden input. */
export function Checkbox({
  className,
  size,
  label,
  description,
  invalid,
  disabled,
  ...props
}: CheckboxProps) {
  const id = useId()
  const labelId = label ? `${id}-label` : undefined
  const descriptionId = description ? `${id}-description` : undefined
  const control = (
    <BaseCheckbox.Root
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className={cn(checkableVariants({ size }), className)}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex data-[unchecked]:hidden" keepMounted>
        {props.indeterminate ? (
          <Minus strokeWidth={3} aria-hidden />
        ) : (
          <Check strokeWidth={3} aria-hidden />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
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

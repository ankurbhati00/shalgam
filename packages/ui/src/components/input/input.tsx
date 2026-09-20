import { Input as BaseInput } from '@base-ui-components/react/input'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { fieldControlVariants } from '../../lib/field-styles'
import { useFormFieldInvalid } from '../form-field/form-field'

export interface InputProps
  extends Omit<BaseInput.Props, 'className' | 'size'>, VariantProps<typeof fieldControlVariants> {
  className?: string
  /** Icon rendered inside the field on the leading edge. */
  leadingIcon?: ReactElement
  /** Element rendered inside the field on the trailing edge (icon, button, unit label). */
  trailingElement?: ReactNode
  /** Static prefix such as `₹` or `+91`. */
  prefix?: string
  /** Marks the control invalid without a surrounding FormField. */
  invalid?: boolean
}

const paddingForLeading = { sm: 'pl-8', md: 'pl-9', lg: 'pl-11' } as const
const paddingForTrailing = { sm: 'pr-8', md: 'pr-9', lg: 'pr-11' } as const

/** Text input. Wire labels, descriptions and errors with `FormField`. */
export function Input({
  className,
  size,
  leadingIcon,
  trailingElement,
  prefix,
  invalid,
  ...props
}: InputProps) {
  const resolvedSize = size ?? 'md'
  const fieldInvalid = useFormFieldInvalid()
  const control = (
    <BaseInput
      aria-invalid={invalid || fieldInvalid || undefined}
      className={cn(
        fieldControlVariants({ size }),
        leadingIcon && paddingForLeading[resolvedSize],
        trailingElement && paddingForTrailing[resolvedSize],
        prefix && 'rounded-l-none border-l-0',
        className,
      )}
      {...props}
    />
  )

  if (!leadingIcon && !trailingElement && !prefix) return control

  return (
    <div className="relative flex w-full items-stretch">
      {prefix && (
        <span
          aria-hidden
          className={cn(
            'inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-border-strong bg-surface-muted px-3 text-sm text-text-muted',
            resolvedSize === 'sm' && 'px-2.5 text-xs',
            resolvedSize === 'lg' && 'text-base',
          )}
        >
          {prefix}
        </span>
      )}
      {leadingIcon && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 flex items-center text-text-subtle [&_svg]:size-4',
            resolvedSize === 'sm'
              ? 'pl-2.5'
              : resolvedSize === 'lg'
                ? 'pl-4 [&_svg]:size-5'
                : 'pl-3',
          )}
        >
          {leadingIcon}
        </span>
      )}
      {control}
      {trailingElement && (
        <span
          className={cn(
            'absolute inset-y-0 right-0 flex items-center text-text-subtle [&_svg]:size-4 [&>svg]:pointer-events-none',
            resolvedSize === 'sm' ? 'pr-2' : resolvedSize === 'lg' ? 'pr-3' : 'pr-2.5',
          )}
        >
          {trailingElement}
        </span>
      )}
    </div>
  )
}

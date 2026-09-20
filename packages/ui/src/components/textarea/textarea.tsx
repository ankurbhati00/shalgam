import { Field } from '@base-ui-components/react/field'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/cn'
import { fieldControlVariants } from '../../lib/field-styles'
import { useFormFieldInvalid } from '../form-field/form-field'

export interface TextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'className'> {
  className?: string
  invalid?: boolean
  /** Grow with content instead of scrolling (uses CSS `field-sizing`). */
  autoResize?: boolean
}

/** Multi-line text control sharing Input's chrome and FormField wiring. */
export function Textarea({ className, invalid, autoResize, rows = 3, ...props }: TextareaProps) {
  const fieldInvalid = useFormFieldInvalid()
  return (
    <Field.Control
      aria-invalid={invalid || fieldInvalid || undefined}
      render={<textarea rows={rows} {...props} />}
      className={cn(
        fieldControlVariants({ size: 'md' }),
        'h-auto min-h-20 resize-y py-2 leading-relaxed',
        autoResize && '[field-sizing:content] resize-none',
        className,
      )}
    />
  )
}

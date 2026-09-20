import { Field } from '@base-ui-components/react/field'
import { createContext, type ReactNode, use } from 'react'

import { cn } from '../../lib/cn'

const FormFieldContext = createContext<{ invalid: boolean }>({ invalid: false })

/** Whether the nearest `FormField` is marked invalid; controls use it to set `aria-invalid`. */
export function useFormFieldInvalid(): boolean {
  return use(FormFieldContext).invalid
}

export interface FormFieldProps extends Omit<Field.Root.Props, 'className'> {
  className?: string
  /** Marks every control inside as invalid and reveals `FormMessage`. */
  invalid?: boolean
  children: ReactNode
}

/**
 * Wires a label, control, description and error message together with the
 * right `id`/`aria-describedby`/`aria-invalid` attributes. Validation itself
 * lives in the app (React Hook Form + Zod); this only renders what it is told.
 */
export function FormField({ className, children, invalid = false, ...props }: FormFieldProps) {
  return (
    <FormFieldContext value={{ invalid }}>
      <Field.Root invalid={invalid} className={cn('flex flex-col gap-1.5', className)} {...props}>
        {children}
      </Field.Root>
    </FormFieldContext>
  )
}

export interface FormLabelProps extends Omit<Field.Label.Props, 'className'> {
  className?: string
  /** Appends a subtle "Optional" hint. */
  optional?: boolean
  /** Appends a required marker. */
  required?: boolean
}

export function FormLabel({ className, optional, required, children, ...props }: FormLabelProps) {
  return (
    <Field.Label
      className={cn(
        'flex items-center gap-1 text-sm font-medium text-text data-[disabled]:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="text-danger">
          *
        </span>
      )}
      {optional && <span className="text-xs font-normal text-text-subtle">(optional)</span>}
    </Field.Label>
  )
}

export interface FormDescriptionProps extends Omit<Field.Description.Props, 'className'> {
  className?: string
}

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  return <Field.Description className={cn('text-xs text-text-muted', className)} {...props} />
}

export interface FormMessageProps extends Omit<Field.Error.Props, 'className' | 'match'> {
  className?: string
  children?: ReactNode
}

/** Error message. Renders nothing when there is no message, and announces itself when there is. */
export function FormMessage({ className, children, ...props }: FormMessageProps) {
  if (!children) return null
  return (
    <Field.Error
      match
      role="alert"
      className={cn('text-xs font-medium text-danger-text', className)}
      {...props}
    >
      {children}
    </Field.Error>
  )
}

export interface FieldsetProps {
  legend: ReactNode
  description?: ReactNode
  className?: string
  children: ReactNode
}

/** Groups related fields under a legend (e.g. an address block). */
export function Fieldset({ legend, description, className, children }: FieldsetProps) {
  return (
    <fieldset className={cn('flex min-w-0 flex-col gap-4', className)}>
      <div className="space-y-0.5">
        <legend className="text-base font-semibold text-text">{legend}</legend>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  )
}

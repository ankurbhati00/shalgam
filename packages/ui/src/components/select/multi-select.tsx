import { Select as BaseSelect } from '@base-ui-components/react/select'
import type { VariantProps } from 'class-variance-authority'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '../../lib/cn'
import { fieldControlVariants } from '../../lib/field-styles'
import { useFormFieldInvalid } from '../form-field/form-field'
import {
  flattenOptions,
  selectItemClassName,
  selectPopupClassName,
  type SelectOptions,
} from './select'

export interface MultiSelectProps<T extends string> extends VariantProps<
  typeof fieldControlVariants
> {
  options: SelectOptions<T>
  value?: T[]
  defaultValue?: T[]
  onValueChange?: (value: T[]) => void
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  /** How many selected labels to show before collapsing into "N selected". */
  maxVisible?: number
}

/** Multiple-choice select with checkmarks; used for table filters (statuses, categories). */
export function MultiSelect<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  size,
  invalid,
  className,
  maxVisible = 2,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: MultiSelectProps<T>) {
  const flat = flattenOptions(options)
  const byValue = new Map(flat.map((option) => [option.value, option]))
  const fieldInvalid = useFormFieldInvalid()
  return (
    <BaseSelect.Root<T, true>
      multiple
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      items={flat.map((option) => ({ value: option.value, label: option.label }))}
      {...props}
    >
      <BaseSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || fieldInvalid || undefined}
        className={cn(
          fieldControlVariants({ size }),
          'flex items-center justify-between gap-2 text-start',
          className,
        )}
      >
        <BaseSelect.Value className="truncate">
          {(current: T[]) => {
            if (current.length === 0) return <span className="text-text-subtle">{placeholder}</span>
            if (current.length > maxVisible) return `${current.length} selected`
            return current.map((v) => byValue.get(v)?.label ?? v).join(', ')
          }}
        </BaseSelect.Value>
        <BaseSelect.Icon className="shrink-0 text-text-subtle [&_svg]:size-4">
          <ChevronDown aria-hidden />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <BaseSelect.Popup className={selectPopupClassName}>
            {flat.map((option) => (
              <BaseSelect.Item
                key={option.value}
                value={option.value}
                label={option.label}
                disabled={option.disabled}
                className={selectItemClassName}
              >
                <span
                  aria-hidden
                  className="inline-flex size-4 shrink-0 items-center justify-center rounded-xs border border-border-strong bg-surface [[data-selected]_&]:border-primary [[data-selected]_&]:bg-primary"
                >
                  <BaseSelect.ItemIndicator className="text-primary-foreground [&_svg]:size-3">
                    <Check strokeWidth={3} aria-hidden />
                  </BaseSelect.ItemIndicator>
                </span>
                <BaseSelect.ItemText className="truncate">{option.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

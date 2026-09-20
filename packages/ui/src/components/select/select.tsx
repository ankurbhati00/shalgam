import { Select as BaseSelect } from '@base-ui-components/react/select'
import type { VariantProps } from 'class-variance-authority'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { fieldControlVariants } from '../../lib/field-styles'
import { useFormFieldInvalid } from '../form-field/form-field'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
  disabled?: boolean
  icon?: ReactNode
}

export interface SelectOptionGroup<T extends string = string> {
  label: string
  options: ReadonlyArray<SelectOption<T>>
}

export type SelectOptions<T extends string = string> =
  ReadonlyArray<SelectOption<T>> | ReadonlyArray<SelectOptionGroup<T>>

function isGrouped<T extends string>(
  options: SelectOptions<T>,
): options is ReadonlyArray<SelectOptionGroup<T>> {
  return options.length > 0 && 'options' in (options[0] as object)
}

export function flattenOptions<T extends string>(
  options: SelectOptions<T>,
): Array<SelectOption<T>> {
  return isGrouped(options) ? options.flatMap((group) => group.options) : [...options]
}

export const selectPopupClassName = cn(
  'z-50 max-h-[min(var(--available-height),20rem)] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg outline-none',
  'origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 ease-out-soft',
  'data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
)

export const selectItemClassName = cn(
  'relative flex cursor-default items-center gap-2 rounded-md py-2 pr-8 pl-2.5 text-sm text-text outline-none select-none pointer-coarse:py-2.5',
  'data-[disabled]:opacity-50 data-[highlighted]:bg-surface-muted data-[selected]:font-medium',
)

export interface SelectProps<T extends string> extends VariantProps<typeof fieldControlVariants> {
  options: SelectOptions<T>
  value?: T | null
  defaultValue?: T | null
  onValueChange?: (value: T | null) => void
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  invalid?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Render the selected value differently from the option label (e.g. shorter). */
  renderValue?: (option: SelectOption<T>) => ReactNode
}

function OptionItems<T extends string>({ options }: { options: ReadonlyArray<SelectOption<T>> }) {
  return options.map((option) => (
    <BaseSelect.Item
      key={option.value}
      value={option.value}
      label={option.label}
      disabled={option.disabled}
      className={selectItemClassName}
    >
      {option.icon && (
        <span className="shrink-0 text-text-muted [&_svg]:size-4">{option.icon}</span>
      )}
      <span className="flex min-w-0 flex-col">
        <BaseSelect.ItemText className="truncate">{option.label}</BaseSelect.ItemText>
        {option.description && (
          <span className="text-xs text-text-muted">{option.description}</span>
        )}
      </span>
      <BaseSelect.ItemIndicator className="absolute right-2.5 text-primary-strong [&_svg]:size-4">
        <Check aria-hidden />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  ))
}

/** Single-value select. Typed by its options, so `onValueChange` receives a union, not `string`. */
export function Select<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  size,
  invalid,
  className,
  renderValue,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: SelectProps<T>) {
  const flat = flattenOptions(options)
  const byValue = new Map(flat.map((option) => [option.value, option]))
  const fieldInvalid = useFormFieldInvalid()
  return (
    <BaseSelect.Root<T | null>
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
          {(current: T | null) => {
            const option = current === null ? undefined : byValue.get(current)
            if (!option) return <span className="text-text-subtle">{placeholder}</span>
            return renderValue ? renderValue(option) : option.label
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
            {isGrouped(options) ? (
              options.map((group) => (
                <BaseSelect.Group key={group.label} className="py-1">
                  <BaseSelect.GroupLabel className="px-2.5 pb-1 text-xs font-semibold tracking-wide text-text-subtle uppercase">
                    {group.label}
                  </BaseSelect.GroupLabel>
                  <OptionItems options={group.options} />
                </BaseSelect.Group>
              ))
            ) : (
              <OptionItems options={options} />
            )}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

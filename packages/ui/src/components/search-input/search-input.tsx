import { Search, X } from 'lucide-react'
import { useId } from 'react'

import { cn } from '../../lib/cn'
import { IconButton } from '../button'
import { Input, type InputProps } from '../input'

export interface SearchInputProps extends Omit<
  InputProps,
  'type' | 'leadingIcon' | 'trailingElement' | 'prefix' | 'value' | 'onChange'
> {
  value: string
  onValueChange: (value: string) => void
  /** Accessible name; a visible label is optional for search fields. */
  'aria-label'?: string
  /** Fires when the user presses Enter. */
  onSearch?: (value: string) => void
  /** Pill-shaped variant used in the storefront header. */
  rounded?: boolean
}

/** Search field with a magnifier, clear button and Enter-to-submit. Debounce upstream with `useDebouncedValue`. */
export function SearchInput({
  value,
  onValueChange,
  onSearch,
  className,
  rounded,
  placeholder = 'Search',
  'aria-label': ariaLabel = 'Search',
  size,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const id = useId()
  return (
    <Input
      id={id}
      type="search"
      role="searchbox"
      aria-label={ariaLabel}
      value={value}
      placeholder={placeholder}
      size={size}
      autoComplete="off"
      enterKeyHint="search"
      leadingIcon={<Search />}
      onValueChange={(next) => onValueChange(next)}
      onKeyDown={(event) => {
        // Consumers may handle keys first (e.g. ArrowDown into a suggestion list).
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === 'Enter') onSearch?.(value)
        if (event.key === 'Escape' && value) {
          event.preventDefault()
          onValueChange('')
        }
      }}
      trailingElement={
        value ? (
          <IconButton
            aria-label="Clear search"
            icon={<X />}
            size="sm"
            variant="ghost"
            onClick={() => {
              onValueChange('')
              document.getElementById(id)?.focus()
            }}
          />
        ) : undefined
      }
      className={cn(
        '[&::-webkit-search-cancel-button]:hidden',
        rounded &&
          'rounded-full border-transparent bg-surface-muted hover:border-border-strong focus-visible:bg-surface',
        className,
      )}
      {...props}
    />
  )
}

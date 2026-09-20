import { SearchInput } from '@shalgam/ui'

import { useDebouncedSearch } from '../../hooks/use-debounced-search'

export interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-label'?: string
  className?: string
}

/** Debounced search box bound to a URL-held query. */
export function SearchFilter({
  value,
  onChange,
  placeholder = 'Search',
  'aria-label': ariaLabel,
  className,
}: SearchFilterProps) {
  const [text, setText] = useDebouncedSearch(value, onChange)
  return (
    <SearchInput
      value={text}
      onValueChange={setText}
      onSearch={onChange}
      size="sm"
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      className={className ?? 'sm:w-64'}
    />
  )
}

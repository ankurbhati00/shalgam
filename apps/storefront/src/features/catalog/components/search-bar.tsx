import {
  Popover,
  PopoverContent,
  Price,
  ProductImage,
  SearchInput,
  useDebouncedValue,
} from '@shalgam/ui'
import { Search, Tag } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'

import { useSearchSuggestions } from '../api/queries'

/** Header search with typeahead suggestions; Enter goes to the results page. */
export function SearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlQuery = location.pathname === '/search' ? (searchParams.get('q') ?? '') : null
  const [value, setValue] = useState(urlQuery ?? '')
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  const [open, setOpen] = useState(false)
  // Keep the box in sync with the URL when navigating between searches (derived state, no effect).
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    if (urlQuery !== null) setValue(urlQuery)
  }
  const debounced = useDebouncedValue(value, 250)
  const { data, isFetching } = useSearchSuggestions(debounced)
  const listId = useId()
  const anchorRef = useRef<HTMLDivElement>(null)

  const submit = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setOpen(false)
    void navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const hasResults = !!data && (data.products.length > 0 || data.categories.length > 0)
  const showPopup = open && debounced.trim().length >= 2

  return (
    <Popover open={showPopup} onOpenChange={setOpen}>
      <div ref={anchorRef} className="w-full">
        <SearchInput
          rounded
          role="combobox"
          aria-expanded={showPopup}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-autocomplete="list"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onSearch={submit}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && showPopup) {
              event.preventDefault()
              document
                .getElementById(listId)
                ?.querySelector<HTMLElement>('[role="option"]')
                ?.focus()
            }
          }}
          placeholder="Search for milk, atta, bananas…"
          aria-label="Search products"
          className="h-11 border-transparent bg-surface shadow-xs"
        />
      </div>
      <PopoverContent
        anchor={anchorRef}
        className="w-[var(--anchor-width)] p-2"
        sideOffset={6}
        align="start"
        initialFocus={false}
        finalFocus={false}
      >
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="max-h-[min(24rem,calc(var(--available-height)-1rem))] overflow-y-auto"
        >
          {!hasResults && !isFetching && (
            <p className="px-2 py-3 text-sm text-text-muted">
              No matches for “{debounced}”. Try a different word.
            </p>
          )}
          {data?.categories.map((category) => (
            <Link
              key={category.id}
              role="option"
              aria-selected={false}
              to={`/category/${category.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm focus-ring hover:bg-surface-muted"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary-muted text-primary-strong">
                <Tag className="size-4" aria-hidden />
              </span>
              <span className="font-medium text-text">{category.name}</span>
              <span className="ml-auto text-xs text-text-subtle">Category</span>
            </Link>
          ))}
          {data?.products.map((product) => (
            <Link
              key={product.id}
              role="option"
              aria-selected={false}
              to={`/product/${product.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm focus-ring hover:bg-surface-muted"
            >
              <ProductImage
                src={product.imageUrl}
                alt=""
                className="size-9 shrink-0"
                rounded="md"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-text">{product.name}</span>
                <span className="block text-xs text-text-muted">{product.unit}</span>
              </span>
              <Price amount={product.price} size="sm" />
            </Link>
          ))}
          {hasResults && (
            <button
              type="button"
              onClick={() => submit(value)}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-primary-strong focus-ring hover:bg-surface-muted pointer-coarse:py-2.5"
            >
              <Search className="size-4" aria-hidden />
              See all results for “{value.trim()}”
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

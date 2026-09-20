import type { ProductSort, ProductTag } from '@shalgam/types'

import { parsePage, useSearchParamState } from '../../../hooks/use-search-param-state'

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
] as const satisfies ReadonlyArray<{ value: ProductSort; label: string }>

/** Short labels for the compact sort control on phones. */
export const SORT_SHORT_LABELS: Record<ProductSort, string> = {
  relevance: 'Relevance',
  price_asc: 'Price ↑',
  price_desc: 'Price ↓',
  discount: 'Discount',
  rating: 'Top rated',
  newest: 'Newest',
}

export const FILTER_TAGS = [
  { value: 'deal', label: 'On offer' },
  { value: 'bestseller', label: 'Bestsellers' },
  { value: 'organic', label: 'Organic' },
  { value: 'shalgam-select', label: 'Shalgam Select' },
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-vegetarian' },
] as const satisfies ReadonlyArray<{ value: ProductTag; label: string }>

export const PRICE_MAX = 500

export interface ListingParams {
  q: string
  sort: ProductSort
  subcategoryId: string | null
  minPrice: number | undefined
  maxPrice: number | undefined
  tags: ProductTag[]
  inStock: boolean
  page: number
}

const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((o) => o.value))
const TAG_VALUES = new Set<string>(FILTER_TAGS.map((o) => o.value))

/** Listing state lives in the URL so filters are shareable and survive refresh/back. */
export function useListingParams() {
  const { get, getAll, set } = useSearchParamState()
  const sortParam = get('sort')
  const min = Number(get('min'))
  const max = Number(get('max'))
  const params: ListingParams = {
    q: get('q') ?? '',
    sort: sortParam && SORT_VALUES.has(sortParam) ? (sortParam as ProductSort) : 'relevance',
    subcategoryId: get('sub'),
    minPrice: Number.isFinite(min) && min > 0 ? min : undefined,
    maxPrice: Number.isFinite(max) && max > 0 && max < PRICE_MAX ? max : undefined,
    tags: getAll('tags').filter((tag): tag is ProductTag => TAG_VALUES.has(tag)),
    inStock: get('inStock') === 'true',
    page: parsePage(get('page')),
  }
  const activeFilterCount =
    params.tags.length +
    (params.minPrice !== undefined || params.maxPrice !== undefined ? 1 : 0) +
    (params.inStock ? 1 : 0)

  return {
    params,
    activeFilterCount,
    setSort: (sort: ProductSort) =>
      set({ sort: sort === 'relevance' ? null : sort }, { resetPage: true }),
    setSubcategory: (id: string | null) => set({ sub: id }, { resetPage: true }),
    setPrice: (range: [number, number]) =>
      set(
        { min: range[0] > 0 ? range[0] : null, max: range[1] < PRICE_MAX ? range[1] : null },
        { resetPage: true, replace: true },
      ),
    setTags: (tags: ProductTag[]) => set({ tags }, { resetPage: true }),
    setInStock: (value: boolean) => set({ inStock: value ? 'true' : null }, { resetPage: true }),
    setPage: (page: number) => set({ page: page > 1 ? page : null }),
    clearFilters: () => set({ min: null, max: null, tags: null, inStock: null, page: null }),
  }
}

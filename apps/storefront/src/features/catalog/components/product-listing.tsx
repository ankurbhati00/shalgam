import type { Paginated, Product, ProductListParams } from '@shalgam/types'
import { Button, EmptyState, ErrorState, Pagination, Select, Text } from '@shalgam/ui'
import { countLabel } from '@shalgam/utils'
import { ArrowDownUp, PackageSearch } from 'lucide-react'
import type { ReactNode } from 'react'

import { useProducts } from '../api/queries'
import { SORT_OPTIONS, SORT_SHORT_LABELS, useListingParams } from '../hooks/use-listing-params'
import { FilterSidebar, MobileFilters } from './listing-filters'
import { ProductGrid } from './product-grid'

const PAGE_SIZE = 24

export interface ProductListingProps {
  /** Extra server filters, e.g. `{ categorySlug }`. */
  baseParams: Omit<
    ProductListParams,
    | 'page'
    | 'pageSize'
    | 'sortBy'
    | 'q'
    | 'tags'
    | 'minPrice'
    | 'maxPrice'
    | 'inStock'
    | 'subcategoryId'
  >
  /** Search query for the search page. */
  query?: string
  /** Rendered above the grid (subcategory tabs). */
  toolbarStart?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  onResults?: (page: Paginated<Product>) => void
}

/**
 * Shared listing body for category and search pages: filters, sort, grid and
 * pagination bound to URL state. Filters are a sidebar from `lg` up and a
 * bottom sheet below it; the toolbar stacks on phones and is one row on desktop.
 */
export function ProductListing({
  baseParams,
  query,
  toolbarStart,
  emptyTitle,
  emptyDescription,
}: ProductListingProps) {
  const listing = useListingParams()
  const { params, setSort, setPage, activeFilterCount, clearFilters } = listing
  const { data, isPending, isError, isFetching, refetch } = useProducts({
    ...baseParams,
    q: query,
    subcategoryId: params.subcategoryId ?? undefined,
    sortBy: params.sort,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    tags: params.tags,
    inStock: params.inStock || undefined,
    page: params.page,
    pageSize: PAGE_SIZE,
  })

  return (
    <div className="lg:flex lg:gap-6">
      <FilterSidebar listing={listing} />
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {toolbarStart && <div className="min-w-0 lg:flex-1">{toolbarStart}</div>}
          <div className="flex items-center justify-between gap-2 lg:justify-end">
            <MobileFilters listing={listing} resultCount={data?.meta.total} className="lg:hidden" />
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <Text
                as="span"
                size="sm"
                tone="muted"
                className="hidden truncate tabular sm:inline"
                aria-live="polite"
              >
                {data ? countLabel(data.meta.total, 'product') : ''}
              </Text>
              <Select
                aria-label="Sort products"
                size="sm"
                className="w-36 sm:w-52"
                options={SORT_OPTIONS}
                value={params.sort}
                onValueChange={(value) => value && setSort(value)}
                renderValue={(option) => (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <ArrowDownUp className="size-4 shrink-0 text-text-muted" aria-hidden />
                    <span className="truncate sm:hidden">{SORT_SHORT_LABELS[option.value]}</span>
                    <span className="hidden truncate sm:inline">{option.label}</span>
                  </span>
                )}
              />
            </div>
          </div>
        </div>

        {isError ? (
          <ErrorState onRetry={() => void refetch()} retrying={isFetching} />
        ) : !isPending && data.data.length === 0 ? (
          <EmptyState
            icon={<PackageSearch />}
            title={emptyTitle ?? 'No products match'}
            description={
              emptyDescription ?? 'Try removing a filter or searching for something else.'
            }
            action={
              activeFilterCount > 0 ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className={isFetching && data ? 'opacity-70 transition-opacity' : undefined}>
              <ProductGrid products={data?.data} loading={isPending} />
            </div>
            {data && data.meta.totalPages > 1 && (
              <div className="flex justify-center pt-2">
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

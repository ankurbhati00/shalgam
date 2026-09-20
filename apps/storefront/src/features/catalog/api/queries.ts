import { categoryQueries, productQueries, storefrontQueries } from '@shalgam/query'
import type { ProductListParams } from '@shalgam/types'
import { useQuery } from '@tanstack/react-query'

export function useHomeFeed(locationId: string | undefined) {
  return useQuery(storefrontQueries.home(locationId))
}

export function useCategories() {
  return useQuery(categoryQueries.list({ parentId: null }))
}

export function useSubcategories(parentId: string | undefined) {
  return useQuery({
    ...categoryQueries.list({ parentId: parentId ?? 'none' }),
    enabled: !!parentId,
  })
}

export function useCategory(slug: string) {
  return useQuery(categoryQueries.detail(slug))
}

export function useProducts(params: ProductListParams) {
  return useQuery(productQueries.list(params))
}

export function useProduct(slug: string) {
  return useQuery(productQueries.detail(slug))
}

export function useRelatedProducts(id: string | undefined) {
  return useQuery({ ...productQueries.related(id ?? ''), enabled: !!id })
}

export function useFrequentlyBoughtTogether(id: string | undefined) {
  return useQuery({ ...productQueries.frequentlyBought(id ?? ''), enabled: !!id })
}

export function useSearchSuggestions(q: string) {
  return useQuery(productQueries.search(q))
}

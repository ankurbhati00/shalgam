import type {
  Category,
  CategoryInput,
  Paginated,
  Product,
  ProductInput,
  ProductListParams,
  SearchSuggestions,
} from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createCatalogService(client: ApiClient) {
  return {
    listCategories: (
      params?: { parentId?: string | null; includeInactive?: boolean },
      options?: RequestOptions,
    ) =>
      client.get<Category[]>('/categories', {
        ...options,
        params: {
          parentId: params?.parentId === null ? 'root' : params?.parentId,
          includeInactive: params?.includeInactive,
        },
      }),

    getCategory: (idOrSlug: string, options?: RequestOptions) =>
      client.get<Category>(`/categories/${encodeURIComponent(idOrSlug)}`, options),

    createCategory: (input: CategoryInput) => client.post<Category>('/categories', input),

    updateCategory: (id: string, input: Partial<CategoryInput>) =>
      client.patch<Category>(`/categories/${encodeURIComponent(id)}`, input),

    deleteCategory: (id: string) => client.delete(`/categories/${encodeURIComponent(id)}`),

    listProducts: (params: ProductListParams = {}, options?: RequestOptions) =>
      client.get<Paginated<Product>>('/products', { ...options, params: { ...params } }),

    getProduct: (idOrSlug: string, options?: RequestOptions) =>
      client.get<Product>(`/products/${encodeURIComponent(idOrSlug)}`, options),

    getRelatedProducts: (id: string, options?: RequestOptions) =>
      client.get<Product[]>(`/products/${encodeURIComponent(id)}/related`, options),

    getFrequentlyBoughtTogether: (id: string, options?: RequestOptions) =>
      client.get<Product[]>(
        `/products/${encodeURIComponent(id)}/frequently-bought-together`,
        options,
      ),

    createProduct: (input: ProductInput) => client.post<Product>('/products', input),

    updateProduct: (id: string, input: Partial<ProductInput>) =>
      client.patch<Product>(`/products/${encodeURIComponent(id)}`, input),

    deleteProduct: (id: string) => client.delete(`/products/${encodeURIComponent(id)}`),

    search: (q: string, options?: RequestOptions) =>
      client.get<SearchSuggestions>('/search', { ...options, params: { q } }),
  }
}

export type CatalogService = ReturnType<typeof createCatalogService>

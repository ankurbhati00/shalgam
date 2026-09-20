import { api, getErrorMessage, isApiError } from '@shalgam/api-client'
import { categoryQueries, queryKeys } from '@shalgam/query'
import type { Category, CategoryInput } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** Every category, including inactive ones and subcategories; grouped client-side. */
export function useAllCategories() {
  return useQuery(categoryQueries.list({ includeInactive: true }))
}

export interface CategoryTree {
  parent: Category
  children: Category[]
}

export function buildCategoryTree(categories: readonly Category[]): CategoryTree[] {
  const byParent = new Map<string, Category[]>()
  for (const category of categories) {
    if (category.parentId === null) continue
    const bucket = byParent.get(category.parentId) ?? []
    bucket.push(category)
    byParent.set(category.parentId, bucket)
  }
  return categories
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.position - b.position)
    .map((parent) => ({
      parent,
      children: (byParent.get(parent.id) ?? []).sort((a, b) => a.position - b.position),
    }))
}

function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => api.catalog.createCategory(input),
    onSuccess: (category) => {
      invalidateCategories(queryClient)
      toast.success('Category created', category.name)
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not create category', getErrorMessage(error))
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      api.catalog.updateCategory(id, input),
    onSuccess: (category, { input }) => {
      invalidateCategories(queryClient)
      if (input.isActive !== undefined && Object.keys(input).length === 1) {
        toast.success(
          `${category.name} ${category.isActive ? 'is now visible' : 'is hidden from shoppers'}`,
        )
      } else {
        toast.success('Category saved', category.name)
      }
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not save category', getErrorMessage(error))
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.catalog.deleteCategory(id),
    onSuccess: () => {
      invalidateCategories(queryClient)
      toast.success('Category deleted')
    },
    onError: (error) => toast.error('Could not delete category', getErrorMessage(error)),
  })
}

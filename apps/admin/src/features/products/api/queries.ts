import { api, getErrorMessage, isApiError } from '@shalgam/api-client'
import { productQueries, queryKeys } from '@shalgam/query'
import type { ProductInput, ProductListParams } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useProducts(params: ProductListParams) {
  return useQuery(productQueries.list(params))
}

export function useProduct(id: string) {
  return useQuery({ ...productQueries.detail(id), enabled: id.length > 0 })
}

function invalidateCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => api.catalog.createProduct(input),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(product.id), product)
      invalidateCatalog(queryClient)
      toast.success('Product created', product.name)
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not create product', getErrorMessage(error))
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      api.catalog.updateProduct(id, input),
    onSuccess: (product, { input }) => {
      queryClient.setQueryData(queryKeys.products.detail(product.id), product)
      invalidateCatalog(queryClient)
      const onlyStatus = Object.keys(input).length === 1 && input.status !== undefined
      toast.success(
        onlyStatus ? `${product.name} is now ${product.status}` : 'Product saved',
        onlyStatus ? undefined : product.name,
      )
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not save product', getErrorMessage(error))
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.catalog.deleteProduct(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) })
      invalidateCatalog(queryClient)
      toast.success('Product deleted')
    },
    onError: (error) => toast.error('Could not delete product', getErrorMessage(error)),
  })
}

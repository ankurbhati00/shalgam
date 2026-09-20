import { isApiError } from '@shalgam/api-client'
import { productQueries } from '@shalgam/query'
import { Button, EmptyState, ErrorState, Skeleton, StatusBadge } from '@shalgam/ui'
import { Link, type LoaderFunctionArgs, useNavigate, useParams } from 'react-router'

import { PageHeader } from '../../../components/page-header'
import { productStatusMap } from '../../../components/status-maps'
import { queryClient } from '../../../lib/query-client'
import { useProduct } from '../api/queries'
import { ProductForm } from '../components/product-form'

export function ProductEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: product, isPending, error, refetch } = useProduct(id)

  if (error) {
    return isApiError(error) && error.isNotFound ? (
      <EmptyState
        title="Product not found"
        description="It may have been deleted."
        action={
          <Button variant="outline" render={<Link to="/products" />}>
            Back to products
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void refetch()} />
    )
  }

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={product.name}
        description={`${product.brand} · ${product.unit}`}
        actions={<StatusBadge status={product.status} map={productStatusMap} size="lg" />}
      />
      <ProductForm
        key={product.updatedAt}
        product={product}
        onSaved={() => void navigate('/products')}
        onCancel={() => void navigate('/products')}
      />
    </>
  )
}

export const route = {
  Component: ProductEditPage,
  handle: { title: 'Edit product', parent: { label: 'Products', to: '/products' } },
  loader: ({ params }: LoaderFunctionArgs) => {
    if (params.id) void queryClient.query(productQueries.detail(params.id)).catch(() => undefined)
    return null
  },
}

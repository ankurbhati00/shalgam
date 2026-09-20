import type { Product } from '@shalgam/types'
import { cn } from '@shalgam/ui'

import { ProductCard, ProductCardSkeleton } from './product-card'

export interface ProductGridProps {
  products: Product[] | undefined
  loading?: boolean
  skeletonCount?: number
  className?: string
}

/** Responsive catalogue grid: 2 columns on phones up to 5 on wide screens. */
export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 10,
  className,
}: ProductGridProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5',
        className,
      )}
      aria-busy={loading || undefined}
    >
      {loading && !products
        ? Array.from({ length: skeletonCount }, (_, index) => (
            <li key={`skeleton-${index}`}>
              <ProductCardSkeleton />
            </li>
          ))
        : products?.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
    </ul>
  )
}

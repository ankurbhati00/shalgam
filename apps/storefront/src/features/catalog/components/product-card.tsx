import type { Product } from '@shalgam/types'
import { Card, Price, ProductBadge, ProductImage, Rating, Skeleton, cn } from '@shalgam/ui'
import { Link } from 'react-router'

import { AddToCart } from '../../cart/components/add-to-cart'

export interface ProductCardProps {
  product: Product
  /** Fixed width for horizontal rails. */
  className?: string
  priority?: boolean
}

/** The storefront's product tile. Domain-specific (knows about the cart), so it lives in the feature, not the design system. */
export function ProductCard({ product, className, priority }: ProductCardProps) {
  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= 5
  return (
    <Card
      variant="outline"
      padding="none"
      interactive
      className={cn('group relative flex h-full flex-col overflow-hidden rounded-xl', className)}
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative block focus-ring-inset"
        aria-label={`${product.name}, ${product.unit}`}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          rounded="none"
          priority={priority}
          sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
          imgClassName={cn(
            'transition-transform duration-300 group-hover:scale-[1.03]',
            outOfStock && 'opacity-60 grayscale',
          )}
        />
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {product.discountPercent >= 10 && (
            <ProductBadge kind="deal" discount={product.discountPercent} />
          )}
          {product.tags.includes('bestseller') && <ProductBadge kind="bestseller" />}
          {product.tags.includes('new') && !product.tags.includes('bestseller') && (
            <ProductBadge kind="new" />
          )}
          {lowStock && <ProductBadge kind="low-stock" />}
          {outOfStock && <ProductBadge kind="out-of-stock" />}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start gap-1.5">
          {product.tags.includes('veg') && <ProductBadge kind="veg" className="mt-0.5" />}
          {product.tags.includes('non-veg') && <ProductBadge kind="non-veg" className="mt-0.5" />}
          <Link
            to={`/product/${product.slug}`}
            className="line-clamp-2 min-h-10 flex-1 rounded-xs text-sm leading-5 font-medium text-text focus-ring"
          >
            {product.name}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
          <span>{product.unit}</span>
          {product.rating.count > 0 && <Rating value={product.rating.average} compact />}
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-end sm:justify-between">
          <Price amount={product.price} mrp={product.mrp} size="sm" showDiscount={false} />
          <div className="w-full sm:w-auto sm:shrink-0">
            <AddToCart product={product} size="sm" fullWidth />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-surface',
        className,
      )}
      aria-hidden
    >
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton shape="text" className="w-full" />
        <Skeleton shape="text" className="w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

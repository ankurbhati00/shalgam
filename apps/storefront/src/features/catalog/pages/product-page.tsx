import { isApiError } from '@shalgam/api-client'
import { productQueries } from '@shalgam/query'
import type { Product } from '@shalgam/types'
import {
  Breadcrumb,
  Container,
  EmptyState,
  ErrorState,
  Heading,
  Price,
  ProductBadge,
  ProductImage,
  Rating,
  Skeleton,
  Text,
  cn,
} from '@shalgam/ui'
import { Leaf, ShieldCheck, Timer } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, type LoaderFunctionArgs, useParams } from 'react-router'

import { MobileActionBar } from '../../../app/shell/mobile-action-bar'
import { useInView } from '../../../hooks/use-in-view'
import { prefetch } from '../../../lib/query-client'
import { AddToCart } from '../../cart/components/add-to-cart'
import { useSelectedLocation } from '../../location/hooks/use-selected-location'
import {
  useCategory,
  useFrequentlyBoughtTogether,
  useProduct,
  useRelatedProducts,
} from '../api/queries'
import { ProductRail } from '../components/product-rail'
import { useRecentlyViewedStore } from '../store/recently-viewed-store'

function ProductDetails({ product }: { product: Product }) {
  const { location } = useSelectedLocation()
  const { data: category } = useCategory(product.categoryId)
  const { data: subcategory } = useCategory(product.subcategoryId)
  const { data: related, isPending: relatedPending } = useRelatedProducts(product.id)
  const { data: together, isPending: togetherPending } = useFrequentlyBoughtTogether(product.id)
  const isVeg = product.tags.includes('veg')
  const isNonVeg = product.tags.includes('non-veg')
  // The sticky bar only shows while the inline price/add block is off-screen.
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaInView = useInView(ctaRef)

  const facts: Array<[string, string]> = [
    ['Brand', product.brand],
    ['Pack size', product.unit],
    ['Shelf life', product.shelfLife ?? '—'],
    ['Storage', product.storageInstructions ?? 'Store in a cool, dry place'],
    ['Country of origin', product.countryOfOrigin],
    ['Max per order', String(product.maxPerOrder)],
  ]

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', render: <Link to="/" /> },
          ...(category
            ? [{ label: category.name, render: <Link to={`/category/${category.slug}`} /> }]
            : []),
          ...(subcategory && category
            ? [
                {
                  label: subcategory.name,
                  render: <Link to={`/category/${category.slug}?sub=${subcategory.id}`} />,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="space-y-3">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            ratio="square"
            rounded="xl"
            priority
            className="bg-surface-muted"
            sizes="(min-width: 1024px) 560px, 100vw"
          />
          <div className="flex flex-wrap gap-1.5">
            {product.tags
              .filter((tag) => tag !== 'veg' && tag !== 'non-veg')
              .map((tag) => (
                <ProductBadge key={tag} kind={tag} size="md" />
              ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Text size="sm" tone="muted" weight="medium">
              {product.brand}
            </Text>
            <div className="flex items-start gap-2">
              {(isVeg || isNonVeg) && (
                <ProductBadge kind={isVeg ? 'veg' : 'non-veg'} className="mt-1.5 shrink-0" />
              )}
              <Heading level={1} size="xl">
                {product.name}
              </Heading>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Text as="span" tone="muted">
                {product.unit}
              </Text>
              {product.rating.count > 0 && (
                <Rating value={product.rating.average} count={product.rating.count} size="md" />
              )}
            </div>
          </div>
          <div
            ref={ctaRef}
            className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <div className="space-y-1">
              <Price amount={product.price} mrp={product.mrp} size="xl" />
              <Text size="xs" tone="subtle">
                Inclusive of all taxes
              </Text>
            </div>
            <div className="w-full sm:w-auto sm:min-w-40">
              <AddToCart product={product} size="md" fullWidth />
            </div>
          </div>
          <ul className="grid gap-2 text-sm text-text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
              <Timer className="size-4 text-primary-strong" aria-hidden />
              {location ? `Delivery in ${location.etaMinutes} min` : 'Express delivery'}
            </li>
            <li className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
              <ShieldCheck className="size-4 text-primary-strong" aria-hidden />
              Quality checked
            </li>
            <li className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
              <Leaf className="size-4 text-primary-strong" aria-hidden />
              {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
            </li>
          </ul>
          {product.highlights.length > 0 && (
            <section className="space-y-2">
              <Heading level={2} size="sm">
                Highlights
              </Heading>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text">
                {product.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="space-y-2">
            <Heading level={2} size="sm">
              About this product
            </Heading>
            <Text size="sm" className="leading-relaxed">
              {product.description}
            </Text>
          </section>
          <section className="space-y-2">
            <Heading level={2} size="sm">
              Product information
            </Heading>
            <dl className="grid grid-cols-[minmax(0,7rem)_1fr] gap-x-4 gap-y-2 text-sm sm:grid-cols-[minmax(0,10rem)_1fr]">
              {facts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="text-text">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
      <MobileActionBar
        aria-hidden={ctaInView || undefined}
        className={cn(
          'flex items-center justify-between gap-3',
          ctaInView ? 'invisible' : 'animate-slide-up',
        )}
      >
        <div className="min-w-0">
          <Text as="p" size="xs" tone="muted" truncate>
            {product.name}
          </Text>
          <Price amount={product.price} mrp={product.mrp} size="md" showDiscount={false} />
        </div>
        <div className="w-40 shrink-0">
          <AddToCart product={product} size="md" fullWidth />
        </div>
      </MobileActionBar>
      <ProductRail
        title="Frequently bought together"
        products={together}
        loading={togetherPending}
      />
      <ProductRail
        title="You may also like"
        products={related}
        loading={relatedPending}
        href={category ? `/category/${category.slug}` : undefined}
      />
    </>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10" aria-busy>
      <Skeleton className="aspect-square rounded-xl" />
      <div className="space-y-4">
        <Skeleton shape="text" className="w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton shape="text" className="w-40" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, isPending, error, refetch } = useProduct(slug)
  const track = useRecentlyViewedStore((s) => s.track)

  useEffect(() => {
    if (product) track(product.id)
  }, [product, track])

  return (
    <Container className="space-y-8 py-5 sm:py-8">
      {error ? (
        isApiError(error) && error.isNotFound ? (
          <EmptyState
            title="Product not found"
            description="It may have been removed from the catalogue."
          />
        ) : (
          <ErrorState onRetry={() => void refetch()} />
        )
      ) : isPending ? (
        <ProductPageSkeleton />
      ) : (
        <ProductDetails product={product} />
      )}
    </Container>
  )
}

export const route = {
  Component: ProductPage,
  loader: ({ params }: LoaderFunctionArgs) => {
    if (params.slug) prefetch(productQueries.detail(params.slug))
    return null
  },
}

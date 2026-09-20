import type { Product } from '@shalgam/types'
import { Heading, IconButton, Link as UiLink } from '@shalgam/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type ReactNode, useId, useRef } from 'react'
import { Link } from 'react-router'

import { ProductCard, ProductCardSkeleton } from './product-card'

export interface ProductRailProps {
  title: ReactNode
  subtitle?: ReactNode
  products: Product[] | undefined
  loading?: boolean
  href?: string
  /** Hide the section entirely when there is nothing to show. */
  hideWhenEmpty?: boolean
}

/** Horizontally scrolling product row used on the home page. Scroll-snaps on touch, arrows on desktop. */
export function ProductRail({
  title,
  subtitle,
  products,
  loading = false,
  href,
  hideWhenEmpty = true,
}: ProductRailProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const headingId = useId()
  if (!loading && hideWhenEmpty && (!products || products.length === 0)) return null

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section
      aria-labelledby={typeof title === 'string' ? undefined : undefined}
      className="space-y-3"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading id={headingId} level={2} size="lg">
            {title}
          </Heading>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <UiLink render={<Link to={href} />} size="sm" className="pointer-coarse:min-h-10">
              See all
            </UiLink>
          )}
          <div className="hidden gap-1 md:flex">
            <IconButton
              aria-label="Scroll left"
              icon={<ChevronLeft />}
              size="sm"
              variant="outline"
              onClick={() => scrollBy(-1)}
            />
            <IconButton
              aria-label="Scroll right"
              icon={<ChevronRight />}
              size="sm"
              variant="outline"
              onClick={() => scrollBy(1)}
            />
          </div>
        </div>
      </div>
      <ul
        ref={scrollerRef}
        className="-mx-4 scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
        aria-busy={loading || undefined}
      >
        {loading && !products
          ? Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="w-40 shrink-0 snap-start sm:w-48">
                <ProductCardSkeleton />
              </li>
            ))
          : products?.map((product) => (
              <li key={product.id} className="w-40 shrink-0 snap-start sm:w-48">
                <ProductCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  )
}

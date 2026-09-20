import { productQueries, storefrontQueries } from '@shalgam/query'
import { Container, ErrorState, Heading, Skeleton } from '@shalgam/ui'
import { useQuery } from '@tanstack/react-query'

import { prefetch } from '../../../lib/query-client'
import { useSelectedLocation } from '../../location/hooks/use-selected-location'
import { useHomeFeed } from '../api/queries'
import { CategoryTile } from '../components/category-tile'
import { ProductRail } from '../components/product-rail'
import { PromoCarousel } from '../components/promo-carousel'
import { useRecentlyViewedStore } from '../store/recently-viewed-store'

function RecentlyViewedRail() {
  const ids = useRecentlyViewedStore((s) => s.ids)
  const { data, isPending } = useQuery({
    ...productQueries.list({ ids, pageSize: 12 }),
    enabled: ids.length > 0,
    select: (page) =>
      ids.map((id) => page.data.find((p) => p.id === id)).filter((p) => p !== undefined),
  })
  if (ids.length === 0) return null
  return <ProductRail title="Recently viewed" products={data} loading={isPending} />
}

export function HomePage() {
  const { location } = useSelectedLocation()
  const { data, isPending, isError, refetch, isRefetching } = useHomeFeed(location?.id)

  if (isError) {
    return (
      <Container className="py-10">
        <ErrorState onRetry={() => void refetch()} retrying={isRefetching} />
      </Container>
    )
  }

  return (
    <Container className="space-y-8 py-5 sm:space-y-10 sm:py-8">
      <h1 className="sr-only">Shalgam — groceries delivered in minutes</h1>

      {isPending ? (
        <div className="grid gap-3 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-2xl lg:col-span-2" />
          <Skeleton className="hidden h-44 rounded-2xl lg:block" />
        </div>
      ) : (
        <PromoCarousel promotions={data.promotions} />
      )}

      <section aria-labelledby="home-categories" className="space-y-3">
        <Heading id="home-categories" level={2} size="lg">
          Shop by category
        </Heading>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {isPending
            ? Array.from({ length: 12 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="aspect-[4/5] rounded-xl" />
                </li>
              ))
            : data.categories.map((category) => (
                <li key={category.id}>
                  <CategoryTile category={category} />
                </li>
              ))}
        </ul>
      </section>

      <ProductRail
        title="Popular right now"
        subtitle={location ? `Most ordered around ${location.label} this month` : undefined}
        products={data?.popular}
        loading={isPending}
        href="/search?sort=rating"
      />
      <ProductRail
        title="Buy again"
        subtitle="From your past orders"
        products={data?.frequentlyBought}
        loading={false}
        href="/orders"
      />
      <ProductRail
        title="Deals of the day"
        subtitle="Up to 30% off"
        products={data?.deals}
        loading={isPending}
        href="/search?tags=deal"
      />
      <ProductRail title="Recommended for you" products={data?.recommended} loading={isPending} />
      <RecentlyViewedRail />
    </Container>
  )
}

export const route = {
  Component: HomePage,
  loader: () => {
    prefetch(storefrontQueries.home(undefined))
    return null
  },
}

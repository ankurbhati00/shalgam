import { Container, EmptyState, Heading } from '@shalgam/ui'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { useCategories } from '../api/queries'
import { CategoryTile } from '../components/category-tile'
import { ProductListing } from '../components/product-listing'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = (searchParams.get('q') ?? '').trim()
  const { data: categories } = useCategories()

  if (!q) {
    return (
      <Container className="space-y-6 py-6 sm:py-8">
        <EmptyState
          icon={<Search />}
          title="Search Shalgam"
          description="Type a product, brand or category into the search bar above — milk, atta, bananas, dishwash…"
        />
        <section className="space-y-3">
          <Heading level={2} size="md">
            Browse categories
          </Heading>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories?.map((category) => (
              <li key={category.id}>
                <CategoryTile category={category} size="sm" />
              </li>
            ))}
          </ul>
        </section>
      </Container>
    )
  }

  return (
    <Container className="space-y-5 py-5 sm:py-8">
      <Heading level={1} size="xl">
        Results for “{q}”
      </Heading>
      <ProductListing
        key={q}
        baseParams={{}}
        query={q}
        emptyTitle={`No results for “${q}”`}
        emptyDescription="Check the spelling or try a broader term like “dal” or “bread”."
      />
    </Container>
  )
}

export const route = { Component: SearchPage }

import { isApiError } from '@shalgam/api-client'
import { categoryQueries } from '@shalgam/query'
import {
  Breadcrumb,
  Container,
  EmptyState,
  ErrorState,
  Heading,
  PillTab,
  Skeleton,
  Tabs,
  TabsList,
  Text,
} from '@shalgam/ui'
import { Link, type LoaderFunctionArgs, useParams } from 'react-router'

import { prefetch } from '../../../lib/query-client'
import { useCategory, useSubcategories } from '../api/queries'
import { ProductListing } from '../components/product-listing'
import { useListingParams } from '../hooks/use-listing-params'

function SubcategoryTabs({ parentId }: { parentId: string | undefined }) {
  const { data: subcategories, isPending } = useSubcategories(parentId)
  const { params, setSubcategory } = useListingParams()
  if (isPending) return <Skeleton className="h-9 w-64 rounded-full" />
  if (!subcategories || subcategories.length === 0) return null
  return (
    <Tabs
      value={params.subcategoryId ?? 'all'}
      onValueChange={(value) => setSubcategory(value === 'all' ? null : String(value))}
    >
      <TabsList variant="pills" scrollable aria-label="Subcategories">
        <PillTab value="all">All</PillTab>
        {subcategories.map((sub) => (
          <PillTab key={sub.id} value={sub.id}>
            {sub.name}
          </PillTab>
        ))}
      </TabsList>
    </Tabs>
  )
}

export function CategoryPage() {
  const { slug = '' } = useParams()
  const { data: category, isPending, error, refetch } = useCategory(slug)

  if (error) {
    return (
      <Container className="py-10">
        {isApiError(error) && error.isNotFound ? (
          <EmptyState
            title="Category not found"
            description="This aisle doesn't exist. Head back home to keep shopping."
          />
        ) : (
          <ErrorState onRetry={() => void refetch()} />
        )}
      </Container>
    )
  }

  return (
    <Container className="space-y-5 py-5 sm:py-8">
      <Breadcrumb
        items={[{ label: 'Home', render: <Link to="/" /> }, { label: category?.name ?? '…' }]}
      />
      <div className="space-y-1">
        {isPending ? (
          <>
            <Skeleton className="h-8 w-56" />
            <Skeleton shape="text" className="w-80" />
          </>
        ) : (
          <>
            <Heading level={1} size="xl">
              {category.name}
            </Heading>
            {category.description && <Text tone="muted">{category.description}</Text>}
          </>
        )}
      </div>
      <ProductListing
        baseParams={{ categorySlug: slug }}
        toolbarStart={<SubcategoryTabs parentId={category?.id} />}
        emptyTitle="Nothing on this shelf yet"
        emptyDescription="We're restocking. Try another subcategory or clear the filters."
      />
    </Container>
  )
}

export const route = {
  Component: CategoryPage,
  loader: ({ params }: LoaderFunctionArgs) => {
    if (params.slug) prefetch(categoryQueries.detail(params.slug))
    return null
  },
}

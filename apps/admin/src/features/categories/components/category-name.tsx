import { Skeleton } from '@shalgam/ui'

import { useAllCategories } from '../api/queries'

/** Resolves a category id to its name from the cached category list. */
export function CategoryName({
  id,
  fallback = '—',
}: {
  id: string | null | undefined
  fallback?: string
}) {
  const { data, isPending } = useAllCategories()
  if (!id) return <>{fallback}</>
  if (isPending) return <Skeleton shape="text" className="w-20" />
  return <>{data?.find((category) => category.id === id)?.name ?? fallback}</>
}

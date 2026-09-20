import { useAllCategories } from '../api/queries'

/** Category select options (top-level by default) derived from the cached category list. */
export function useCategoryOptions(parentOnly = true) {
  const { data, isPending } = useAllCategories()
  const options = (data ?? [])
    .filter((category) => (parentOnly ? category.parentId === null : true))
    .sort((a, b) => a.position - b.position)
    .map((category) => ({ value: category.id, label: category.name }))
  return { options, isPending }
}

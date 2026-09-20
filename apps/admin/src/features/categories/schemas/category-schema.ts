import type { Category, CategoryInput, Tint } from '@shalgam/types'
import { z } from 'zod'

export const TINT_VALUES = [
  'lime',
  'mint',
  'sky',
  'lavender',
  'peach',
  'butter',
  'rose',
] as const satisfies readonly Tint[]

export const TINT_OPTIONS = TINT_VALUES.map((tint) => ({
  value: tint,
  label: tint.charAt(0).toUpperCase() + tint.slice(1),
}))

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Keep the name under 60 characters.'),
  description: z.string().trim().max(200, 'Keep the description under 200 characters.'),
  /** Empty string means a top-level category. */
  parentId: z.string(),
  tint: z.enum(TINT_VALUES),
  isActive: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const categoryDefaults: CategoryFormValues = {
  name: '',
  description: '',
  parentId: '',
  tint: 'lime',
  isActive: true,
}

export function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    description: category.description,
    parentId: category.parentId ?? '',
    tint: category.tint,
    isActive: category.isActive,
  }
}

export function formValuesToCategoryInput(
  values: CategoryFormValues,
  imageUrl = '',
): CategoryInput {
  return {
    name: values.name,
    description: values.description,
    parentId: values.parentId || null,
    tint: values.tint,
    imageUrl,
    isActive: values.isActive,
  }
}

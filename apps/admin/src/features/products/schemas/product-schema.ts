import type { Product, ProductInput, ProductTag } from '@shalgam/types'
import { z } from 'zod'

export const PRODUCT_TAG_VALUES = [
  'bestseller',
  'new',
  'deal',
  'organic',
  'fresh',
  'imported',
  'veg',
  'non-veg',
  'shalgam-select',
] as const satisfies readonly ProductTag[]

export const PRODUCT_TAG_LABELS: Record<ProductTag, string> = {
  bestseller: 'Bestseller',
  new: 'New',
  deal: 'Deal',
  organic: 'Organic',
  fresh: 'Fresh',
  imported: 'Imported',
  veg: 'Vegetarian',
  'non-veg': 'Non-vegetarian',
  'shalgam-select': 'Shalgam Select',
}

/** Accepts nothing, an absolute http(s) URL, or an app-relative path (bundled assets resolve to paths). */
function isBlankOrUrl(value: string): boolean {
  if (value === '' || value.startsWith('/')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Keep the name under 80 characters.'),
    brand: z
      .string()
      .trim()
      .min(1, 'Brand is required.')
      .max(60, 'Keep the brand under 60 characters.'),
    categoryId: z.string().min(1, 'Choose a category.'),
    subcategoryId: z.string().min(1, 'Choose a subcategory.'),
    unit: z
      .string()
      .trim()
      .min(1, 'Pack size is required, e.g. 500 g.')
      .max(30, 'Keep the pack size short.'),
    price: z.number({ error: 'Enter a selling price.' }).positive('Price must be greater than 0.'),
    mrp: z.number({ error: 'Enter the MRP.' }).positive('MRP must be greater than 0.'),
    stock: z
      .number({ error: 'Enter the stock on hand.' })
      .int('Stock must be a whole number.')
      .min(0, 'Stock cannot be negative.'),
    maxPerOrder: z
      .number({ error: 'Enter a per-order limit.' })
      .int('Use a whole number.')
      .min(1, 'Allow at least 1 per order.')
      .max(50, 'Keep the limit at 50 or fewer.'),
    status: z.enum(['active', 'draft', 'archived']),
    tags: z.array(z.enum(PRODUCT_TAG_VALUES)),
    description: z.string().trim().max(600, 'Keep the description under 600 characters.'),
    /** One highlight per line; converted to an array on submit. */
    highlights: z.string().max(1000, 'Too many highlights.'),
    imageUrl: z
      .string()
      .trim()
      .refine(isBlankOrUrl, 'Enter an http(s) URL or a path starting with /.'),
    shelfLife: z.string().trim().max(60, 'Keep this under 60 characters.'),
    storageInstructions: z.string().trim().max(200, 'Keep this under 200 characters.'),
    countryOfOrigin: z
      .string()
      .trim()
      .min(2, 'Country of origin is required.')
      .max(60, 'Keep this under 60 characters.'),
  })
  .refine((values) => values.price <= values.mrp, {
    message: 'Selling price cannot exceed MRP.',
    path: ['price'],
  })

export type ProductFormValues = z.infer<typeof productSchema>

export const productDefaults: ProductFormValues = {
  name: '',
  brand: '',
  categoryId: '',
  subcategoryId: '',
  unit: '',
  price: Number.NaN,
  mrp: Number.NaN,
  stock: 0,
  maxPerOrder: 8,
  status: 'draft',
  tags: [],
  description: '',
  highlights: '',
  imageUrl: '',
  shelfLife: '',
  storageInstructions: '',
  countryOfOrigin: 'India',
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    unit: product.unit,
    price: product.price,
    mrp: product.mrp,
    stock: product.stock,
    maxPerOrder: product.maxPerOrder,
    status: product.status,
    tags: product.tags,
    description: product.description,
    highlights: product.highlights.join('\n'),
    imageUrl: product.imageUrl,
    shelfLife: product.shelfLife ?? '',
    storageInstructions: product.storageInstructions ?? '',
    countryOfOrigin: product.countryOfOrigin,
  }
}

export function formValuesToProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name,
    brand: values.brand,
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId,
    description: values.description,
    highlights: values.highlights
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    unit: values.unit,
    price: values.price,
    mrp: values.mrp,
    stock: values.stock,
    maxPerOrder: values.maxPerOrder,
    status: values.status,
    tags: values.tags,
    imageUrl: values.imageUrl,
    shelfLife: values.shelfLife || null,
    storageInstructions: values.storageInstructions || null,
    countryOfOrigin: values.countryOfOrigin,
  }
}

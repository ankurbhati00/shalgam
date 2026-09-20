import type { ISODateString, ListParams, Rupees } from './common'

export type Tint = 'lime' | 'mint' | 'sky' | 'lavender' | 'peach' | 'butter' | 'rose'

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  imageUrl: string
  tint: Tint
  /** `null` for top-level categories; subcategories point at their parent. */
  parentId: string | null
  position: number
  productCount: number
  isActive: boolean
}

export type ProductStatus = 'active' | 'draft' | 'archived'

export type ProductTag =
  | 'bestseller'
  | 'new'
  | 'deal'
  | 'organic'
  | 'fresh'
  | 'imported'
  | 'veg'
  | 'non-veg'
  | 'shalgam-select'

export interface ProductRating {
  average: number
  count: number
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  categoryId: string
  subcategoryId: string
  description: string
  highlights: string[]
  /** Pack size shown to shoppers, e.g. `500 g`, `1 L`, `6 pcs`. */
  unit: string
  price: Rupees
  mrp: Rupees
  /** Rounded percentage off MRP; 0 when there is no discount. */
  discountPercent: number
  imageUrl: string
  images: string[]
  rating: ProductRating
  stock: number
  maxPerOrder: number
  status: ProductStatus
  tags: ProductTag[]
  shelfLife: string | null
  storageInstructions: string | null
  countryOfOrigin: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type ProductSort =
  'relevance' | 'price_asc' | 'price_desc' | 'discount' | 'rating' | 'newest'

export interface ProductListParams extends ListParams {
  categoryId?: string
  subcategoryId?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  tags?: ProductTag[]
  status?: ProductStatus[]
  inStock?: boolean
  brand?: string[]
  /** Storefront-oriented sort key; maps onto `sort` + `order` server-side. */
  sortBy?: ProductSort
  ids?: string[]
}

export interface ProductInput {
  name: string
  brand: string
  categoryId: string
  subcategoryId: string
  description: string
  highlights: string[]
  unit: string
  price: Rupees
  mrp: Rupees
  stock: number
  maxPerOrder: number
  status: ProductStatus
  tags: ProductTag[]
  imageUrl: string
  shelfLife: string | null
  storageInstructions: string | null
  countryOfOrigin: string
}

export interface CategoryInput {
  name: string
  description: string
  parentId: string | null
  tint: Tint
  imageUrl: string
  isActive: boolean
}

export interface SearchSuggestions {
  query: string
  products: Array<Pick<Product, 'id' | 'slug' | 'name' | 'unit' | 'price' | 'imageUrl'>>
  categories: Array<Pick<Category, 'id' | 'slug' | 'name'>>
}

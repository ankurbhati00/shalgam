import type { Product } from '@shalgam/types'

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prd_test',
    slug: 'test-product-500-g',
    name: 'Test Product',
    brand: 'Shalgam Select',
    categoryId: 'cat_fruits-vegetables',
    subcategoryId: 'cat_fresh-vegetables',
    description: 'A product used in tests.',
    highlights: [],
    unit: '500 g',
    price: 24,
    mrp: 32,
    discountPercent: 25,
    imageUrl: '',
    images: [],
    rating: { average: 4.4, count: 120 },
    stock: 10,
    maxPerOrder: 3,
    status: 'active',
    tags: ['veg'],
    shelfLife: null,
    storageInstructions: null,
    countryOfOrigin: 'India',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

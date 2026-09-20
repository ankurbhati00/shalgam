import type {
  Category,
  CategoryInput,
  Product,
  ProductInput,
  ProductListParams,
  SearchSuggestions,
} from '@shalgam/types'
import { discountPercent, slugify } from '@shalgam/utils'
import { http, HttpResponse } from 'msw'

import { recomputeCategoryCounts } from '../db/seed'
import { getDb, persist } from '../db/store'
import { notFound, orNull, readJson, simulate, validationError } from '../lib/http'
import {
  getAll,
  getBoolean,
  getNumber,
  matchesQuery,
  paginate,
  parseListParams,
  sortItems,
} from '../lib/list'

function findCategory(idOrSlug: string): Category | undefined {
  const db = getDb()
  return db.categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug)
}

function findProduct(idOrSlug: string): Product | undefined {
  const db = getDb()
  return db.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug)
}

/** Fields the API insists on; everything else has a sensible default. */
type ProductCreateBody = Pick<
  ProductInput,
  'name' | 'brand' | 'categoryId' | 'subcategoryId' | 'unit' | 'price' | 'mrp' | 'stock'
> &
  Partial<
    Omit<
      ProductInput,
      'name' | 'brand' | 'categoryId' | 'subcategoryId' | 'unit' | 'price' | 'mrp' | 'stock'
    >
  >

function isProductCreateBody(input: Partial<ProductInput>): input is ProductCreateBody {
  return (
    [input.name, input.brand, input.categoryId, input.subcategoryId, input.unit].every(
      (value) => typeof value === 'string',
    ) && [input.price, input.mrp, input.stock].every((value) => typeof value === 'number')
  )
}

function validateProduct(input: Partial<ProductInput>, partial = false): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const require = (key: keyof ProductInput, ok: boolean, message: string) => {
    if (!partial || key in input) if (!ok) errors[key] = [message]
  }
  require('name', typeof input.name === 'string' &&
    input.name.trim().length >= 2, 'Name must be at least 2 characters.')
  require('brand', typeof input.brand === 'string' &&
    input.brand.trim().length > 0, 'Brand is required.')
  require('categoryId', !!input.categoryId &&
    !!findCategory(input.categoryId), 'Choose a valid category.')
  require('subcategoryId', !!input.subcategoryId &&
    !!findCategory(input.subcategoryId), 'Choose a valid subcategory.')
  require('unit', typeof input.unit === 'string' &&
    input.unit.trim().length > 0, 'Pack size is required.')
  require('price', typeof input.price === 'number' &&
    input.price > 0, 'Price must be greater than 0.')
  require('mrp', typeof input.mrp === 'number' && input.mrp > 0, 'MRP must be greater than 0.')
  if (typeof input.price === 'number' && typeof input.mrp === 'number' && input.price > input.mrp) {
    errors.price = ['Selling price cannot exceed MRP.']
  }
  require('stock', typeof input.stock === 'number' && input.stock >= 0, 'Stock cannot be negative.')
  return errors
}

const SORT_ACCESSORS: Record<string, (p: Product) => string | number> = {
  name: (p) => p.name,
  price: (p) => p.price,
  mrp: (p) => p.mrp,
  discount: (p) => p.discountPercent,
  rating: (p) => p.rating.average,
  stock: (p) => p.stock,
  createdAt: (p) => p.createdAt,
  updatedAt: (p) => p.updatedAt,
  status: (p) => p.status,
  brand: (p) => p.brand,
}

const SORT_BY_MAP: Record<
  NonNullable<ProductListParams['sortBy']>,
  [sort: string | null, order: 'asc' | 'desc']
> = {
  relevance: [null, 'desc'],
  price_asc: ['price', 'asc'],
  price_desc: ['price', 'desc'],
  discount: ['discount', 'desc'],
  rating: ['rating', 'desc'],
  newest: ['createdAt', 'desc'],
}

export const catalogHandlers = [
  http.get('*/api/categories', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const parentId = url.searchParams.get('parentId')
    const includeInactive = getBoolean(url, 'includeInactive') ?? false
    let categories = db.categories.filter((c) => includeInactive || c.isActive)
    if (parentId === 'root') categories = categories.filter((c) => c.parentId === null)
    else if (parentId) categories = categories.filter((c) => c.parentId === parentId)
    return HttpResponse.json(categories.slice().sort((a, b) => a.position - b.position))
  }),

  http.get<{ idOrSlug: string }>('*/api/categories/:idOrSlug', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const category = findCategory(params.idOrSlug)
    return category ? HttpResponse.json(category) : notFound('Category')
  }),

  http.post('*/api/categories', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const input = (await readJson<Partial<CategoryInput>>(request)) ?? {}
    const name = orNull(input.name)
    if (!name) return validationError({ name: ['Name is required.'] })
    const db = getDb()
    const slug = slugify(name)
    if (db.categories.some((c) => c.slug === slug))
      return validationError({ name: ['A category with this name already exists.'] })
    const siblings = db.categories.filter((c) => c.parentId === (input.parentId ?? null))
    const category: Category = {
      id: `cat_${slug}`,
      slug,
      name,
      description: input.description ?? '',
      imageUrl: input.imageUrl ?? '',
      tint: input.tint ?? 'lime',
      parentId: input.parentId ?? null,
      position: siblings.length + 1,
      productCount: 0,
      isActive: input.isActive ?? true,
    }
    db.categories.push(category)
    persist()
    return HttpResponse.json(category, { status: 201 })
  }),

  http.patch<{ id: string }>('*/api/categories/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const category = findCategory(params.id)
    if (!category) return notFound('Category')
    const input = (await readJson<Partial<CategoryInput>>(request)) ?? {}
    if (input.name !== undefined) category.name = input.name.trim()
    if (input.description !== undefined) category.description = input.description
    if (input.tint !== undefined) category.tint = input.tint
    if (input.imageUrl !== undefined) category.imageUrl = input.imageUrl
    if (input.isActive !== undefined) category.isActive = input.isActive
    if (input.parentId !== undefined) category.parentId = input.parentId
    persist()
    return HttpResponse.json(category)
  }),

  http.delete<{ id: string }>('*/api/categories/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const category = findCategory(params.id)
    if (!category) return notFound('Category')
    if (db.products.some((p) => p.categoryId === category.id || p.subcategoryId === category.id)) {
      return validationError(
        { id: ['Move or delete its products first.'] },
        'This category still has products.',
      )
    }
    db.categories = db.categories.filter((c) => c.id !== category.id && c.parentId !== category.id)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/products', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const params = parseListParams(url, { pageSize: 24, sort: 'createdAt' })
    const categoryId = url.searchParams.get('categoryId')
    const categorySlug = url.searchParams.get('categorySlug')
    const subcategoryId = url.searchParams.get('subcategoryId')
    const minPrice = getNumber(url, 'minPrice')
    const maxPrice = getNumber(url, 'maxPrice')
    const tags = getAll(url, 'tags')
    const statuses = getAll(url, 'status')
    const brands = getAll(url, 'brand')
    const ids = getAll(url, 'ids')
    const inStock = getBoolean(url, 'inStock')
    const sortBy = url.searchParams.get('sortBy') as ProductListParams['sortBy'] | null

    const category = categorySlug
      ? findCategory(categorySlug)
      : categoryId
        ? findCategory(categoryId)
        : null
    const categoryFilterIds = category
      ? new Set([
          category.id,
          ...db.categories.filter((c) => c.parentId === category.id).map((c) => c.id),
        ])
      : null

    let products = db.products.filter((p) => {
      if (
        statuses.length > 0
          ? !statuses.includes(p.status)
          : p.status !== 'active' && !url.searchParams.has('status')
      )
        return false
      if (
        categoryFilterIds &&
        !categoryFilterIds.has(p.categoryId) &&
        !categoryFilterIds.has(p.subcategoryId)
      )
        return false
      if (subcategoryId && p.subcategoryId !== subcategoryId) return false
      if (minPrice !== undefined && p.price < minPrice) return false
      if (maxPrice !== undefined && p.price > maxPrice) return false
      if (tags.length > 0 && !tags.every((t) => p.tags.includes(t as Product['tags'][number])))
        return false
      if (brands.length > 0 && !brands.includes(p.brand)) return false
      if (ids.length > 0 && !ids.includes(p.id)) return false
      if (inStock === true && p.stock <= 0) return false
      if (inStock === false && p.stock > 0) return false
      return matchesQuery(params.q, p.name, p.brand, p.description)
    })

    // Search relevance: name matches first, then popularity.
    if (params.q && (!sortBy || sortBy === 'relevance') && !url.searchParams.has('sort')) {
      products = products.sort((a, b) => {
        const an = a.name.toLowerCase().startsWith(params.q)
          ? 0
          : a.name.toLowerCase().includes(params.q)
            ? 1
            : 2
        const bn = b.name.toLowerCase().startsWith(params.q)
          ? 0
          : b.name.toLowerCase().includes(params.q)
            ? 1
            : 2
        return an - bn || b.rating.count - a.rating.count
      })
    } else if (sortBy && sortBy !== 'relevance') {
      const [sort, order] = SORT_BY_MAP[sortBy]
      products = sortItems(products, sort, order, SORT_ACCESSORS)
    } else if (sortBy === 'relevance' || (!url.searchParams.has('sort') && !params.q)) {
      products = products.slice().sort((a, b) => b.rating.count - a.rating.count)
    } else {
      products = sortItems(products, params.sort, params.order, SORT_ACCESSORS)
    }
    return HttpResponse.json(paginate(products, params.page, params.pageSize))
  }),

  http.get('*/api/search', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const q = (new URL(request.url).searchParams.get('q') ?? '').trim().toLowerCase()
    if (q.length < 2)
      return HttpResponse.json({
        query: q,
        products: [],
        categories: [],
      } satisfies SearchSuggestions)
    const products = db.products
      .filter((p) => p.status === 'active' && matchesQuery(q, p.name, p.brand))
      .sort((a, b) => b.rating.count - a.rating.count)
      .slice(0, 6)
      .map(({ id, slug, name, unit, price, imageUrl }) => ({
        id,
        slug,
        name,
        unit,
        price,
        imageUrl,
      }))
    const categories = db.categories
      .filter((c) => c.isActive && c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map(({ id, slug, name }) => ({ id, slug, name }))
    return HttpResponse.json({ query: q, products, categories } satisfies SearchSuggestions)
  }),

  http.get<{ idOrSlug: string }>('*/api/products/:idOrSlug', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const product = findProduct(params.idOrSlug)
    return product ? HttpResponse.json(product) : notFound('Product')
  }),

  http.get<{ id: string }>('*/api/products/:id/related', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const product = findProduct(params.id)
    if (!product) return notFound('Product')
    const related = db.products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.status === 'active' &&
          (p.subcategoryId === product.subcategoryId || p.categoryId === product.categoryId),
      )
      .sort(
        (a, b) =>
          Number(b.subcategoryId === product.subcategoryId) -
            Number(a.subcategoryId === product.subcategoryId) || b.rating.count - a.rating.count,
      )
      .slice(0, 8)
    return HttpResponse.json(related)
  }),

  http.get<{ id: string }>(
    '*/api/products/:id/frequently-bought-together',
    async ({ request, params }) => {
      const failure = await simulate(request)
      if (failure) return failure
      const db = getDb()
      const product = findProduct(params.id)
      if (!product) return notFound('Product')
      const counts = new Map<string, number>()
      for (const order of db.orders) {
        if (!order.items.some((i) => i.productId === product.id)) continue
        for (const item of order.items) {
          if (item.productId === product.id) continue
          counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1)
        }
      }
      const ranked = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => db.products.find((p) => p.id === id))
        .filter((p): p is Product => !!p && p.status === 'active')
      return HttpResponse.json(ranked)
    },
  ),

  http.post('*/api/products', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const input = (await readJson<Partial<ProductInput>>(request)) ?? {}
    const errors = validateProduct(input)
    if (Object.keys(errors).length > 0 || !isProductCreateBody(input))
      return validationError(errors)
    const db = getDb()
    const now = new Date().toISOString()
    const id = `prd_${slugify(input.name)}_${Math.random().toString(36).slice(2, 6)}`
    const product: Product = {
      id,
      slug: slugify(`${input.name} ${input.unit}`),
      name: input.name.trim(),
      brand: input.brand.trim(),
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      description: input.description ?? '',
      highlights: input.highlights ?? [],
      unit: input.unit,
      price: input.price,
      mrp: input.mrp,
      discountPercent: discountPercent(input.mrp, input.price),
      imageUrl: input.imageUrl ?? '',
      images: input.imageUrl ? [input.imageUrl] : [],
      rating: { average: 0, count: 0 },
      stock: input.stock,
      maxPerOrder: input.maxPerOrder ?? 8,
      status: input.status ?? 'draft',
      tags: input.tags ?? [],
      shelfLife: input.shelfLife ?? null,
      storageInstructions: input.storageInstructions ?? null,
      countryOfOrigin: input.countryOfOrigin ?? 'India',
      createdAt: now,
      updatedAt: now,
    }
    db.products.unshift(product)
    const category = db.categories.find((c) => c.id === product.categoryId)
    db.inventory.unshift({
      productId: product.id,
      sku: `SKU-${String(db.inventory.length + 1).padStart(4, '0')}`,
      productName: product.name,
      productImageUrl: product.imageUrl,
      unit: product.unit,
      categoryId: product.categoryId,
      categoryName: category?.name ?? '',
      onHand: product.stock,
      reserved: 0,
      available: product.stock,
      reorderLevel: db.settings.lowStockThreshold,
      status:
        product.stock === 0
          ? 'out_of_stock'
          : product.stock <= db.settings.lowStockThreshold
            ? 'low_stock'
            : 'in_stock',
      lastRestockedAt: product.stock > 0 ? now : null,
      updatedAt: now,
    })
    recomputeCategoryCounts(db.categories, db.products)
    persist()
    return HttpResponse.json(product, { status: 201 })
  }),

  http.patch<{ id: string }>('*/api/products/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const product = findProduct(params.id)
    if (!product) return notFound('Product')
    const input = (await readJson<Partial<ProductInput>>(request)) ?? {}
    const merged = { ...product, ...input }
    const errors = validateProduct(merged, true)
    if (Object.keys(errors).length > 0) return validationError(errors)
    Object.assign(product, input, {
      discountPercent: discountPercent(merged.mrp, merged.price),
      images:
        input.imageUrl !== undefined ? (input.imageUrl ? [input.imageUrl] : []) : product.images,
      updatedAt: new Date().toISOString(),
    })
    const inventory = db.inventory.find((i) => i.productId === product.id)
    if (inventory) {
      inventory.productName = product.name
      inventory.productImageUrl = product.imageUrl
      inventory.unit = product.unit
      if (input.stock !== undefined) {
        inventory.onHand = input.stock + inventory.reserved
        inventory.available = input.stock
        inventory.status =
          input.stock === 0
            ? 'out_of_stock'
            : input.stock <= inventory.reorderLevel
              ? 'low_stock'
              : 'in_stock'
        inventory.updatedAt = product.updatedAt
      }
    }
    recomputeCategoryCounts(db.categories, db.products)
    persist()
    return HttpResponse.json(product)
  }),

  http.delete<{ id: string }>('*/api/products/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const product = findProduct(params.id)
    if (!product) return notFound('Product')
    db.products = db.products.filter((p) => p.id !== product.id)
    db.inventory = db.inventory.filter((i) => i.productId !== product.id)
    recomputeCategoryCounts(db.categories, db.products)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),
]

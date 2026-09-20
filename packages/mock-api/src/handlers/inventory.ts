import type { InventoryMovement, InventorySummary, StockAdjustmentInput } from '@shalgam/types'
import { http, HttpResponse } from 'msw'

import { getDb, persist } from '../db/store'
import { orNull, readJson, simulate, validationError } from '../lib/http'
import { getAll, matchesQuery, paginate, parseListParams, sortItems } from '../lib/list'

const STATUS_RANK = { out_of_stock: 0, low_stock: 1, in_stock: 2 } as const

export const inventoryHandlers = [
  http.get('*/api/inventory', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const params = parseListParams(url, { sort: 'status', order: 'asc' })
    const statuses = getAll(url, 'status')
    const categoryIds = getAll(url, 'categoryId')
    const items = db.inventory.filter((i) => {
      if (statuses.length > 0 && !statuses.includes(i.status)) return false
      if (categoryIds.length > 0 && !categoryIds.includes(i.categoryId)) return false
      return matchesQuery(params.q, i.productName, i.sku, i.categoryName)
    })
    const sorted = sortItems(items, params.sort, params.order, {
      productName: (i) => i.productName,
      sku: (i) => i.sku,
      onHand: (i) => i.onHand,
      available: (i) => i.available,
      reserved: (i) => i.reserved,
      reorderLevel: (i) => i.reorderLevel,
      status: (i) => STATUS_RANK[i.status],
      categoryName: (i) => i.categoryName,
      lastRestockedAt: (i) => i.lastRestockedAt,
      updatedAt: (i) => i.updatedAt,
    })
    return HttpResponse.json(paginate(sorted, params.page, params.pageSize))
  }),

  http.get('*/api/inventory/summary', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const priceById = new Map(db.products.map((p) => [p.id, p.price]))
    const summary: InventorySummary = {
      totalSkus: db.inventory.length,
      inStock: db.inventory.filter((i) => i.status === 'in_stock').length,
      lowStock: db.inventory.filter((i) => i.status === 'low_stock').length,
      outOfStock: db.inventory.filter((i) => i.status === 'out_of_stock').length,
      stockValue: Math.round(
        db.inventory.reduce((acc, i) => acc + i.onHand * (priceById.get(i.productId) ?? 0), 0),
      ),
    }
    return HttpResponse.json(summary)
  }),

  http.get('*/api/inventory/movements', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const params = parseListParams(url, { sort: 'createdAt' })
    const productId = url.searchParams.get('productId')
    const types = getAll(url, 'type')
    const movements = db.movements.filter((m) => {
      if (productId && m.productId !== productId) return false
      if (types.length > 0 && !types.includes(m.type)) return false
      return matchesQuery(params.q, m.productName, m.reference, m.actor)
    })
    const sorted = sortItems(movements, params.sort, params.order, {
      createdAt: (m) => m.createdAt,
      quantity: (m) => m.quantity,
      type: (m) => m.type,
      productName: (m) => m.productName,
    })
    return HttpResponse.json(paginate(sorted, params.page, params.pageSize))
  }),

  http.post('*/api/inventory/adjustments', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const input = await readJson<StockAdjustmentInput>(request)
    const item = input ? db.inventory.find((i) => i.productId === input.productId) : undefined
    const errors: Record<string, string[]> = {}
    if (!item) errors.productId = ['Choose a product.']
    if (!input || !Number.isFinite(input.quantity) || input.quantity === 0)
      errors.quantity = ['Quantity must be a non-zero number.']
    if (!input || !['restock', 'adjustment', 'damage'].includes(input.type))
      errors.type = ['Choose a movement type.']
    if (!item || !input || Object.keys(errors).length > 0) return validationError(errors)

    const signed =
      input.type === 'damage'
        ? -Math.abs(input.quantity)
        : input.type === 'restock'
          ? Math.abs(input.quantity)
          : input.quantity
    if (item.onHand + signed < 0)
      return validationError({ quantity: [`Only ${item.onHand} on hand.`] })
    const now = new Date().toISOString()
    item.onHand += signed
    item.available = Math.max(0, item.onHand - item.reserved)
    item.status =
      item.available === 0
        ? 'out_of_stock'
        : item.available <= item.reorderLevel
          ? 'low_stock'
          : 'in_stock'
    item.updatedAt = now
    if (input.type === 'restock') item.lastRestockedAt = now
    const product = db.products.find((p) => p.id === item.productId)
    if (product) product.stock = item.available

    const movement: InventoryMovement = {
      id: `mov_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      productId: item.productId,
      productName: item.productName,
      type: input.type,
      quantity: signed,
      balanceAfter: item.onHand,
      reference: input.type === 'restock' ? `PO-${Math.floor(5000 + Math.random() * 900)}` : null,
      note: orNull(input.note),
      actor: db.adminUser.name,
      createdAt: now,
    }
    db.movements.unshift(movement)
    persist()
    return HttpResponse.json(movement, { status: 201 })
  }),
]

import type {
  AnalyticsOverview,
  AnalyticsSeries,
  CancellationReason,
  CategorySales,
  CustomerTrendPoint,
  DeliveryPerformancePoint,
  Kpi,
  Order,
  OrderStatus,
  Report,
  ReportRow,
  ReportType,
  StatusDistributionPoint,
  TimeSeriesPoint,
  TopProduct,
} from '@shalgam/types'
import { roundMoney, toDateKey } from '@shalgam/utils'
import { http, HttpResponse } from 'msw'

import { advanceLiveOrders } from '../db/live'
import type { MockDatabase } from '../db/seed'
import { getDb, persist } from '../db/store'
import { simulate, validationError } from '../lib/http'
import { getAll } from '../lib/list'

const DAY = 86_400_000

interface Range {
  from: Date
  to: Date
}

function parseRange(url: URL): Range {
  const toParam = url.searchParams.get('to')
  const fromParam = url.searchParams.get('from')
  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam ? new Date(fromParam) : new Date(to.getTime() - 29 * DAY)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return { from: new Date(Date.now() - 29 * DAY), to: new Date() }
  }
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)
  return { from, to }
}

function previousRange(range: Range): Range {
  const span = range.to.getTime() - range.from.getTime()
  return { from: new Date(range.from.getTime() - span - 1), to: new Date(range.from.getTime() - 1) }
}

interface Filters {
  categoryId: string | null
  productId: string | null
  statuses: string[]
}

function ordersIn(db: MockDatabase, range: Range, filters?: Filters): Order[] {
  const categoryProductIds = filters?.categoryId
    ? new Set(
        db.products
          .filter((p) => {
            const category = db.categories.find((c) => c.id === filters.categoryId)
            return (
              p.categoryId === filters.categoryId ||
              p.subcategoryId === filters.categoryId ||
              p.categoryId === category?.parentId
            )
          })
          .map((p) => p.id),
      )
    : null
  return db.orders.filter((o) => {
    const t = new Date(o.placedAt).getTime()
    if (t < range.from.getTime() || t > range.to.getTime()) return false
    if (filters?.statuses.length && !filters.statuses.includes(o.status)) return false
    if (filters?.productId && !o.items.some((i) => i.productId === filters.productId)) return false
    if (categoryProductIds && !o.items.some((i) => categoryProductIds.has(i.productId)))
      return false
    return true
  })
}

function kpi(value: number, previous: number): Kpi {
  const changePercent =
    previous === 0 ? null : Math.round(((value - previous) / previous) * 1000) / 10
  return { value, previous, changePercent }
}

function revenueOf(orders: Order[]): number {
  return roundMoney(
    orders.filter((o) => o.status !== 'cancelled').reduce((acc, o) => acc + o.pricing.total, 0),
  )
}

function buildOverview(db: MockDatabase, range: Range, filters: Filters): AnalyticsOverview {
  const current = ordersIn(db, range, filters)
  const previous = ordersIn(db, previousRange(range), filters)
  const completed = (orders: Order[]) => orders.filter((o) => o.status !== 'cancelled')
  const rate = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10
  const deliveredOnTime = (orders: Order[]) => {
    const delivered = orders.filter((o) => o.status === 'delivered')
    const onTime = delivered.filter((o) => {
      const delivery = db.deliveries.find((d) => d.orderId === o.id)
      return !delivery?.isDelayed
    })
    return rate(onTime.length, delivered.length)
  }
  const activeCustomers = (orders: Order[]) =>
    new Set(completed(orders).map((o) => o.customerId)).size
  const aov = (orders: Order[]) => {
    const done = completed(orders)
    return done.length === 0 ? 0 : roundMoney(revenueOf(done) / done.length)
  }
  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString() },
    kpis: {
      totalOrders: kpi(current.length, previous.length),
      revenue: kpi(revenueOf(current), revenueOf(previous)),
      averageOrderValue: kpi(aov(current), aov(previous)),
      activeCustomers: kpi(activeCustomers(current), activeCustomers(previous)),
      cancellationRate: kpi(
        rate(current.filter((o) => o.status === 'cancelled').length, current.length),
        rate(previous.filter((o) => o.status === 'cancelled').length, previous.length),
      ),
      deliverySuccessRate: kpi(deliveredOnTime(current), deliveredOnTime(previous)),
    },
  }
}

function buildSeries(
  db: MockDatabase,
  range: Range,
  filters: Filters,
  granularity: 'day' | 'week',
): AnalyticsSeries {
  const orders = ordersIn(db, range, filters)
  const keyOf = (iso: string) => {
    if (granularity === 'day') return toDateKey(iso)
    const date = new Date(iso)
    date.setDate(date.getDate() - date.getDay())
    return toDateKey(date)
  }

  const buckets = new Map<string, TimeSeriesPoint>()
  for (let t = range.from.getTime(); t <= range.to.getTime(); t += DAY) {
    const key = keyOf(new Date(t).toISOString())
    if (!buckets.has(key)) buckets.set(key, { date: key, orders: 0, revenue: 0 })
  }
  for (const order of orders) {
    const bucket = buckets.get(keyOf(order.placedAt))
    if (!bucket) continue
    bucket.orders += 1
    if (order.status !== 'cancelled')
      bucket.revenue = roundMoney(bucket.revenue + order.pricing.total)
  }

  const categoryOf = new Map(db.products.map((p) => [p.id, p.categoryId]))
  const categoryName = new Map(db.categories.map((c) => [c.id, c.name]))
  const byCategory = new Map<string, { revenue: number; orders: Set<string> }>()
  const byProduct = new Map<string, TopProduct>()
  let totalRevenue = 0
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) {
      const categoryId = categoryOf.get(item.productId) ?? 'unknown'
      const entry = byCategory.get(categoryId) ?? { revenue: 0, orders: new Set<string>() }
      entry.revenue = roundMoney(entry.revenue + item.lineTotal)
      entry.orders.add(order.id)
      byCategory.set(categoryId, entry)
      totalRevenue += item.lineTotal
      const product = byProduct.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        unit: item.unit,
        unitsSold: 0,
        revenue: 0,
      }
      product.unitsSold += item.quantity
      product.revenue = roundMoney(product.revenue + item.lineTotal)
      byProduct.set(item.productId, product)
    }
  }
  const salesByCategory: CategorySales[] = [...byCategory.entries()]
    .map(([categoryId, entry]) => ({
      categoryId,
      categoryName: categoryName.get(categoryId) ?? 'Other',
      revenue: entry.revenue,
      orders: entry.orders.size,
      share: totalRevenue === 0 ? 0 : Math.round((entry.revenue / totalRevenue) * 1000) / 10,
    }))
    .sort((a, b) => b.revenue - a.revenue)

  const topProducts = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8)

  const statusOrder: OrderStatus[] = [
    'placed',
    'preparing',
    'packed',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]
  const statusDistribution: StatusDistributionPoint[] = statusOrder.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }))

  const deliveryBuckets = new Map<string, DeliveryPerformancePoint & { minutes: number[] }>()
  for (const bucket of buckets.keys())
    deliveryBuckets.set(bucket, {
      date: bucket,
      onTime: 0,
      delayed: 0,
      failed: 0,
      averageMinutes: 0,
      minutes: [],
    })
  for (const order of orders) {
    const bucket = deliveryBuckets.get(keyOf(order.placedAt))
    if (!bucket) continue
    if (order.status === 'cancelled') {
      bucket.failed += 1
      continue
    }
    if (order.status !== 'delivered' || !order.deliveredAt) continue
    const delivery = db.deliveries.find((d) => d.orderId === order.id)
    if (delivery?.isDelayed) bucket.delayed += 1
    else bucket.onTime += 1
    bucket.minutes.push(
      (new Date(order.deliveredAt).getTime() - new Date(order.placedAt).getTime()) / 60_000,
    )
  }
  const deliveryPerformance: DeliveryPerformancePoint[] = [...deliveryBuckets.values()].map(
    ({ minutes, ...rest }) => ({
      ...rest,
      averageMinutes: minutes.length
        ? Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length)
        : 0,
    }),
  )

  const firstOrderAt = new Map<string, string>()
  for (const order of db.orders) {
    if (order.status === 'cancelled') continue
    const existing = firstOrderAt.get(order.customerId)
    if (!existing || order.placedAt < existing) firstOrderAt.set(order.customerId, order.placedAt)
  }
  const customerBuckets = new Map<string, CustomerTrendPoint>()
  for (const bucket of buckets.keys())
    customerBuckets.set(bucket, { date: bucket, newCustomers: 0, returningCustomers: 0 })
  const seenInBucket = new Map<string, Set<string>>()
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    const key = keyOf(order.placedAt)
    const bucket = customerBuckets.get(key)
    if (!bucket) continue
    const seen = seenInBucket.get(key) ?? new Set<string>()
    if (seen.has(order.customerId)) continue
    seen.add(order.customerId)
    seenInBucket.set(key, seen)
    if (firstOrderAt.get(order.customerId) === order.placedAt) bucket.newCustomers += 1
    else bucket.returningCustomers += 1
  }

  const cancelled = orders.filter((o) => o.status === 'cancelled')
  const reasonCounts = new Map<string, number>()
  for (const order of cancelled) {
    const reason = order.cancelReason ?? 'Unspecified'
    reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1)
  }
  const cancellationReasons: CancellationReason[] = [...reasonCounts.entries()]
    .map(([reason, count]) => ({
      reason,
      count,
      share: cancelled.length ? Math.round((count / cancelled.length) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    timeSeries: [...buckets.values()],
    salesByCategory,
    topProducts,
    statusDistribution,
    deliveryPerformance,
    customerTrend: [...customerBuckets.values()],
    cancellationReasons,
  }
}

function buildReport(
  db: MockDatabase,
  type: ReportType,
  range: Range,
  categoryId: string | null,
): Report {
  const filters: Filters = { categoryId, productId: null, statuses: [] }
  const orders = ordersIn(db, range, filters)
  const completed = orders.filter((o) => o.status !== 'cancelled')
  const generatedAt = new Date().toISOString()
  const base = {
    generatedAt,
    range: { from: range.from.toISOString(), to: range.to.toISOString() },
  }

  switch (type) {
    case 'sales': {
      const series = buildSeries(db, range, filters, 'day')
      const rows: ReportRow[] = series.timeSeries.map((point) => ({
        date: point.date,
        orders: point.orders,
        revenue: point.revenue,
        averageOrderValue: point.orders ? roundMoney(point.revenue / point.orders) : 0,
      }))
      return {
        ...base,
        type,
        title: 'Sales report',
        summary: [
          { label: 'Revenue', value: revenueOf(orders), format: 'currency' },
          { label: 'Orders', value: completed.length, format: 'number' },
          {
            label: 'Average order value',
            value: completed.length ? roundMoney(revenueOf(orders) / completed.length) : 0,
            format: 'currency',
          },
          {
            label: 'Items sold',
            value: completed.reduce((acc, o) => acc + o.itemCount, 0),
            format: 'number',
          },
        ],
        columns: [
          { key: 'date', label: 'Date', format: 'date' },
          { key: 'orders', label: 'Orders', format: 'number', align: 'end' },
          { key: 'revenue', label: 'Revenue', format: 'currency', align: 'end' },
          { key: 'averageOrderValue', label: 'AOV', format: 'currency', align: 'end' },
        ],
        rows,
      }
    }
    case 'orders': {
      const rows: ReportRow[] = orders.slice(0, 500).map((o) => ({
        number: o.number,
        placedAt: o.placedAt,
        customer: o.customer.name,
        items: o.itemCount,
        status: o.status,
        payment: o.payment.method.toUpperCase(),
        total: o.pricing.total,
      }))
      const byStatus = (status: OrderStatus) => orders.filter((o) => o.status === status).length
      return {
        ...base,
        type,
        title: 'Order report',
        summary: [
          { label: 'Total orders', value: orders.length, format: 'number' },
          { label: 'Delivered', value: byStatus('delivered'), format: 'number' },
          { label: 'Cancelled', value: byStatus('cancelled'), format: 'number' },
          {
            label: 'Cancellation rate',
            value: orders.length ? byStatus('cancelled') / orders.length : 0,
            format: 'percent',
          },
        ],
        columns: [
          { key: 'number', label: 'Order', format: 'text' },
          { key: 'placedAt', label: 'Placed', format: 'date' },
          { key: 'customer', label: 'Customer', format: 'text' },
          { key: 'items', label: 'Items', format: 'number', align: 'end' },
          { key: 'status', label: 'Status', format: 'text' },
          { key: 'payment', label: 'Payment', format: 'text' },
          { key: 'total', label: 'Total', format: 'currency', align: 'end' },
        ],
        rows,
      }
    }
    case 'inventory': {
      const priceById = new Map(db.products.map((p) => [p.id, p.price]))
      const items = categoryId
        ? db.inventory.filter((i) => i.categoryId === categoryId)
        : db.inventory
      const rows: ReportRow[] = items.map((i) => ({
        sku: i.sku,
        product: i.productName,
        category: i.categoryName,
        onHand: i.onHand,
        reserved: i.reserved,
        available: i.available,
        reorderLevel: i.reorderLevel,
        status: i.status,
        value: roundMoney(i.onHand * (priceById.get(i.productId) ?? 0)),
      }))
      return {
        ...base,
        type,
        title: 'Inventory report',
        summary: [
          { label: 'SKUs', value: items.length, format: 'number' },
          {
            label: 'Stock value',
            value: rows.reduce((acc, r) => acc + Number(r.value ?? 0), 0),
            format: 'currency',
          },
          {
            label: 'Low stock',
            value: items.filter((i) => i.status === 'low_stock').length,
            format: 'number',
          },
          {
            label: 'Out of stock',
            value: items.filter((i) => i.status === 'out_of_stock').length,
            format: 'number',
          },
        ],
        columns: [
          { key: 'sku', label: 'SKU', format: 'text' },
          { key: 'product', label: 'Product', format: 'text' },
          { key: 'category', label: 'Category', format: 'text' },
          { key: 'onHand', label: 'On hand', format: 'number', align: 'end' },
          { key: 'reserved', label: 'Reserved', format: 'number', align: 'end' },
          { key: 'available', label: 'Available', format: 'number', align: 'end' },
          { key: 'status', label: 'Status', format: 'text' },
          { key: 'value', label: 'Value', format: 'currency', align: 'end' },
        ],
        rows,
      }
    }
    case 'customers': {
      const perCustomer = new Map<string, { orders: number; revenue: number; last: string }>()
      for (const o of completed) {
        const entry = perCustomer.get(o.customerId) ?? { orders: 0, revenue: 0, last: o.placedAt }
        entry.orders += 1
        entry.revenue = roundMoney(entry.revenue + o.pricing.total)
        if (o.placedAt > entry.last) entry.last = o.placedAt
        perCustomer.set(o.customerId, entry)
      }
      const rows: ReportRow[] = [...perCustomer.entries()]
        .map(([id, entry]) => {
          const customer = db.customers.find((c) => c.id === id)
          return {
            customer: customer?.name ?? id,
            tier: customer?.tier ?? 'new',
            orders: entry.orders,
            revenue: entry.revenue,
            averageOrderValue: roundMoney(entry.revenue / entry.orders),
            lastOrder: entry.last,
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
      return {
        ...base,
        type,
        title: 'Customer report',
        summary: [
          { label: 'Active customers', value: perCustomer.size, format: 'number' },
          { label: 'Revenue', value: revenueOf(orders), format: 'currency' },
          {
            label: 'Orders per customer',
            value: perCustomer.size
              ? Math.round((completed.length / perCustomer.size) * 10) / 10
              : 0,
            format: 'number',
          },
          {
            label: 'VIP customers',
            value: db.customers.filter((c) => c.tier === 'vip').length,
            format: 'number',
          },
        ],
        columns: [
          { key: 'customer', label: 'Customer', format: 'text' },
          { key: 'tier', label: 'Tier', format: 'text' },
          { key: 'orders', label: 'Orders', format: 'number', align: 'end' },
          { key: 'revenue', label: 'Revenue', format: 'currency', align: 'end' },
          { key: 'averageOrderValue', label: 'AOV', format: 'currency', align: 'end' },
          { key: 'lastOrder', label: 'Last order', format: 'date' },
        ],
        rows,
      }
    }
  }
}

function filtersFrom(url: URL): Filters {
  return {
    categoryId: url.searchParams.get('categoryId'),
    productId: url.searchParams.get('productId'),
    statuses: getAll(url, 'status'),
  }
}

export const analyticsHandlers = [
  http.get('*/api/analytics/overview', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    if (advanceLiveOrders(db)) persist()
    const url = new URL(request.url)
    return HttpResponse.json(buildOverview(db, parseRange(url), filtersFrom(url)))
  }),

  http.get('*/api/analytics/series', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    if (advanceLiveOrders(db)) persist()
    const url = new URL(request.url)
    const granularity = url.searchParams.get('granularity') === 'week' ? 'week' : 'day'
    return HttpResponse.json(buildSeries(db, parseRange(url), filtersFrom(url), granularity))
  }),

  http.get('*/api/reports', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as ReportType | null
    if (!type || !['sales', 'orders', 'inventory', 'customers'].includes(type)) {
      return validationError({ type: ['Choose a report type.'] })
    }
    return HttpResponse.json(
      buildReport(db, type, parseRange(url), url.searchParams.get('categoryId')),
    )
  }),
]

import type {
  Address,
  Category,
  Customer,
  CustomerTier,
  Delivery,
  DeliveryPartner,
  DeliveryStatus,
  InventoryItem,
  InventoryMovement,
  Location,
  Order,
  OrderItem,
  OrderStatus,
  OrderTimelineEvent,
  PaymentMethod,
  Product,
  ProductTag,
  Promotion,
  StoreSettings,
} from '@shalgam/types'
import { discountPercent, roundMoney, slugify } from '@shalgam/utils'

import { categorySeeds } from '../data/categories'
import {
  buildings,
  cancelReasons,
  firstNames,
  landmarks,
  lastNames,
  partnerNames,
  zones,
} from '../data/pools'
import { productSeeds, type ProductSeed } from '../data/products'
import { adminUserSeed, currentUserSeed, defaultSettings } from '../data/settings'
import { imageUrl } from '../images'
import { createId, Random } from '../lib/random'

/** Bump when seed data changes shape or content so persisted demo databases are discarded. */
export const SEED_VERSION = 2

export interface MockDatabase {
  version: number
  seededAt: string
  categories: Category[]
  products: Product[]
  customers: Customer[]
  addresses: Address[]
  orders: Order[]
  inventory: InventoryItem[]
  movements: InventoryMovement[]
  partners: DeliveryPartner[]
  deliveries: Delivery[]
  locations: Location[]
  promotions: Promotion[]
  settings: StoreSettings
  currentUserId: string
  adminUser: typeof adminUserSeed
}

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

const iso = (ms: number) => new Date(ms).toISOString()

const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  'fruits-vegetables': [
    'Sourced fresh every morning',
    'Quality-checked at our dark store',
    'No artificial ripening',
  ],
  'dairy-bread': [
    'Delivered chilled',
    'From trusted local dairies and bakeries',
    'Checked for freshness on dispatch',
  ],
  'eggs-meat-fish': [
    'Hygienically packed',
    'Cold-chain maintained till delivery',
    'No antibiotics or preservatives',
  ],
  'atta-rice-dal': [
    'Double-cleaned and sortex graded',
    'Packed in food-grade material',
    'Sealed for freshness',
  ],
  'masala-oil': ['No added colours', 'Packed in small batches for aroma', 'Lab tested for purity'],
  'snacks-namkeen': ['Crunchy and fresh', 'Sealed nitrogen-flushed pack', 'Perfect with chai'],
  beverages: ['Chilled on request', 'Sealed and tamper-proof', 'Best served cold'],
  'breakfast-instant': ['Ready in minutes', 'No trans fats', 'Family pack value'],
  'sweets-chocolates': ['Made with real ingredients', 'Gift-ready packaging', 'Stored below 25 °C'],
  'personal-care': ['Dermatologically tested', 'Cruelty-free', 'Paraben and sulphate free'],
  household: ['Tough on stains, gentle on hands', 'Long-lasting fragrance', 'Value pack'],
  frozen: ['Kept at −18 °C till your door', 'No thawing in transit', 'Easy to cook'],
}

function buildCategories(): { categories: Category[]; bySlug: Map<string, Category> } {
  const categories: Category[] = []
  const bySlug = new Map<string, Category>()
  categorySeeds.forEach((seed, index) => {
    const parent: Category = {
      id: `cat_${seed.slug}`,
      slug: seed.slug,
      name: seed.name,
      description: seed.description,
      imageUrl: imageUrl(seed.imageKey),
      tint: seed.tint,
      parentId: null,
      position: index + 1,
      productCount: 0,
      isActive: true,
    }
    categories.push(parent)
    bySlug.set(parent.slug, parent)
    seed.subcategories.forEach((sub, subIndex) => {
      const child: Category = {
        id: `cat_${sub.slug}`,
        slug: sub.slug,
        name: sub.name,
        description: '',
        imageUrl: '',
        tint: seed.tint,
        parentId: parent.id,
        position: subIndex + 1,
        productCount: 0,
        isActive: true,
      }
      categories.push(child)
      bySlug.set(child.slug, child)
    })
  })
  return { categories, bySlug }
}

function buildProduct(
  seed: ProductSeed,
  bySlug: Map<string, Category>,
  random: Random,
  now: number,
): Product {
  const category = bySlug.get(seed.category)
  const subcategory = bySlug.get(seed.subcategory)
  if (!category || !subcategory) throw new Error(`Unknown category for product ${seed.key}`)
  const createdDaysAgo = seed.tags?.includes('new') ? random.int(2, 12) : random.int(40, 400)
  const [average, count] = seed.rating ?? [random.float(3.9, 4.6), random.int(40, 900)]
  const tags: ProductTag[] = [...(seed.tags ?? [])]
  if (seed.brand === 'Shalgam Select' && !tags.includes('shalgam-select'))
    tags.push('shalgam-select')
  if (discountPercent(seed.mrp, seed.price) >= 20 && !tags.includes('deal')) tags.push('deal')
  const image = imageUrl(seed.key)
  return {
    id: `prd_${seed.key}`,
    slug: slugify(`${seed.name} ${seed.unit}`),
    name: seed.name,
    brand: seed.brand,
    categoryId: category.id,
    subcategoryId: subcategory.id,
    description:
      seed.description ??
      `${seed.name} by ${seed.brand}, packed in a ${seed.unit} pack. Quality-checked at the Shalgam dark store and delivered in minutes.`,
    highlights: seed.highlights ?? CATEGORY_HIGHLIGHTS[seed.category] ?? [],
    unit: seed.unit,
    price: seed.price,
    mrp: seed.mrp,
    discountPercent: discountPercent(seed.mrp, seed.price),
    imageUrl: image,
    images: image ? [image] : [],
    rating: { average: Math.round(average * 10) / 10, count },
    stock: 0,
    maxPerOrder: seed.maxPerOrder ?? 8,
    status: 'active',
    tags,
    shelfLife: seed.shelfLife ?? null,
    storageInstructions: seed.storage ?? null,
    countryOfOrigin: seed.origin ?? 'India',
    createdAt: iso(now - createdDaysAgo * DAY),
    updatedAt: iso(now - random.int(0, 10) * DAY),
  }
}

function buildCustomers(
  random: Random,
  now: number,
): { customers: Customer[]; addresses: Address[] } {
  const customers: Customer[] = []
  const addresses: Address[] = []
  const usedNames = new Set<string>()

  const makeAddress = (
    customerId: string,
    label: Address['label'],
    name: string,
    phone: string,
    isDefault: boolean,
  ): Address => {
    const zone = random.pick(zones)
    return {
      id: createId('adr', random),
      customerId,
      label,
      recipientName: name,
      phone,
      line1: `${random.pick(['Flat', 'Villa', 'House'])} ${random.int(101, 1408)}, ${random.pick(buildings)}`,
      line2: `${random.pick(zone.areas)}, ${zone.name}`,
      landmark: random.pick(landmarks),
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: zone.pincode,
      isDefault,
    }
  }

  // The signed-in shopper comes first so the storefront has stable data.
  const me: Customer = {
    id: currentUserSeed.id,
    name: currentUserSeed.name,
    email: currentUserSeed.email,
    phone: currentUserSeed.phone,
    avatarUrl: null,
    city: 'Bengaluru',
    status: 'active',
    tier: 'loyal',
    ordersCount: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    lastOrderAt: null,
    joinedAt: iso(now - 420 * DAY),
  }
  customers.push(me)
  addresses.push(
    {
      id: 'adr_ananya_home',
      customerId: me.id,
      label: 'home',
      recipientName: me.name,
      phone: me.phone,
      line1: 'Flat 604, Sunrise Residency',
      line2: '12th Main, HAL 2nd Stage, Indiranagar',
      landmark: 'Near the metro station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: true,
    },
    {
      id: 'adr_ananya_work',
      customerId: me.id,
      label: 'work',
      recipientName: me.name,
      phone: me.phone,
      line1: '4th Floor, Skyline Towers',
      line2: '80 Feet Road, 4th Block, Koramangala',
      landmark: 'Opposite the park',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      isDefault: false,
    },
  )

  for (let i = 0; i < 64; i++) {
    let name = ''
    do {
      name = `${random.pick(firstNames)} ${random.pick(lastNames)}`
    } while (usedNames.has(name))
    usedNames.add(name)
    const id = createId('cus', random)
    const phone = `+91 ${random.int(70000, 99999)} ${random.int(10000, 99999)}`
    const customer: Customer = {
      id,
      name,
      email: `${slugify(name).replace(/-/g, '.')}@example.com`,
      phone,
      avatarUrl: null,
      city: 'Bengaluru',
      status: random.weighted([
        ['active', 86],
        ['inactive', 11],
        ['blocked', 3],
      ]),
      tier: 'new',
      ordersCount: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderAt: null,
      joinedAt: iso(now - random.int(5, 540) * DAY),
    }
    customers.push(customer)
    addresses.push(makeAddress(id, 'home', name, phone, true))
    if (random.chance(0.35)) addresses.push(makeAddress(id, 'work', name, phone, false))
  }
  return { customers, addresses }
}

function buildPartners(random: Random): DeliveryPartner[] {
  return partnerNames.map((name, index) => ({
    id: `dp_${index + 1}`,
    name,
    phone: `+91 ${random.int(70000, 99999)} ${random.int(10000, 99999)}`,
    vehicle: random.weighted<DeliveryPartner['vehicle']>([
      ['bike', 55],
      ['scooter', 40],
      ['cycle', 5],
    ]),
    rating: Math.round(random.float(4.2, 4.95) * 10) / 10,
    availability: 'available',
    zone: zones[index % zones.length]!.name,
    deliveriesToday: 0,
  }))
}

interface OrderBuildContext {
  random: Random
  now: number
  products: Product[]
  customers: Customer[]
  addresses: Address[]
  partners: DeliveryPartner[]
  settings: StoreSettings
}

function pickItems(ctx: OrderBuildContext): OrderItem[] {
  const { random, products } = ctx
  const count = random.weighted([
    [1, 12],
    [2, 22],
    [3, 24],
    [4, 18],
    [5, 12],
    [6, 7],
    [7, 3],
    [8, 2],
  ])
  const weighted = products.map(
    (p) => [p, p.tags.includes('bestseller') ? 6 : p.tags.includes('deal') ? 3 : 1] as const,
  )
  const chosen = new Map<string, Product>()
  while (chosen.size < count) {
    const product = random.weighted(weighted)
    chosen.set(product.id, product)
  }
  return [...chosen.values()].map((product) => {
    const quantity = random.weighted([
      [1, 60],
      [2, 28],
      [3, 9],
      [4, 3],
    ])
    return {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unit: product.unit,
      quantity,
      unitPrice: product.price,
      mrp: product.mrp,
      lineTotal: roundMoney(product.price * quantity),
    }
  })
}

export function computePricing(
  items: OrderItem[],
  settings: Pick<StoreSettings, 'deliveryFee' | 'freeDeliveryThreshold' | 'handlingFee'>,
  tip = 0,
  slotFee = 0,
): Order['pricing'] {
  const subtotal = roundMoney(items.reduce((acc, item) => acc + item.lineTotal, 0))
  const discount = roundMoney(
    items.reduce((acc, item) => acc + (item.mrp - item.unitPrice) * item.quantity, 0),
  )
  const deliveryWaived = subtotal >= settings.freeDeliveryThreshold
  const deliveryFee = deliveryWaived ? 0 : settings.deliveryFee
  const handlingFee = settings.handlingFee
  const total = roundMoney(subtotal + deliveryFee + handlingFee + tip + slotFee)
  const savings = roundMoney(discount + (deliveryWaived ? settings.deliveryFee : 0))
  return { subtotal, discount, deliveryFee, handlingFee, tip, total, savings }
}

const STATUS_STEP_MINUTES: Record<
  Exclude<OrderStatus, 'placed' | 'cancelled'>,
  [number, number]
> = {
  preparing: [1, 3],
  packed: [3, 7],
  out_for_delivery: [2, 5],
  delivered: [6, 16],
}

export function buildTimeline(
  placedAt: number,
  finalStatus: OrderStatus,
  random: Random,
  delayed = false,
): OrderTimelineEvent[] {
  const events: OrderTimelineEvent[] = [
    { status: 'placed', at: iso(placedAt), note: 'Order confirmed' },
  ]
  if (finalStatus === 'cancelled') {
    events.push({ status: 'cancelled', at: iso(placedAt + random.int(1, 12) * MINUTE), note: null })
    return events
  }
  const flow: Array<Exclude<OrderStatus, 'placed' | 'cancelled'>> = [
    'preparing',
    'packed',
    'out_for_delivery',
    'delivered',
  ]
  let cursor = placedAt
  for (const status of flow) {
    const [min, max] = STATUS_STEP_MINUTES[status]
    cursor += random.int(min, max) * MINUTE
    if (status === 'delivered' && delayed) cursor += random.int(12, 30) * MINUTE
    events.push({
      status,
      at: iso(cursor),
      note:
        status === 'preparing'
          ? 'Picking your items'
          : status === 'packed'
            ? 'Packed and ready for pickup'
            : status === 'out_for_delivery'
              ? 'Rider is on the way'
              : 'Delivered. Enjoy!',
    })
    if (status === finalStatus) break
  }
  return events
}

function deliveryStatusFor(status: OrderStatus): DeliveryStatus {
  switch (status) {
    case 'placed':
    case 'preparing':
      return 'pending'
    case 'packed':
      return 'assigned'
    case 'out_for_delivery':
      return 'on_the_way'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'failed'
  }
}

function buildOrders(ctx: OrderBuildContext): { orders: Order[]; deliveries: Delivery[] } {
  const { random, now, customers, addresses, partners, settings } = ctx
  const orders: Order[] = []
  const deliveries: Delivery[] = []
  const zoneByPincode = new Map<string, (typeof zones)[number]>(zones.map((z) => [z.pincode, z]))
  let sequence = 0

  const activeCustomers = customers.filter((c) => c.status !== 'blocked')
  const customerWeights = activeCustomers.map(
    (c) => [c, c.id === currentUserSeed.id ? 30 : random.int(1, 8)] as const,
  )

  const totalDays = 90
  for (let dayOffset = totalDays; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(now - dayOffset * DAY)
    dayStart.setHours(0, 0, 0, 0)
    const weekday = dayStart.getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.35 : 1
    const growth = 1 + (totalDays - dayOffset) / totalDays / 2 // gentle upward trend
    const baseCount = Math.round(random.int(4, 7) * weekendBoost * growth)
    const isToday = dayOffset === 0

    for (let i = 0; i < baseCount; i++) {
      // Orders cluster around breakfast, lunch and dinner slots.
      const hour = random.weighted([
        [7, 6],
        [8, 10],
        [9, 9],
        [10, 6],
        [11, 5],
        [12, 7],
        [13, 6],
        [14, 3],
        [15, 3],
        [16, 4],
        [17, 7],
        [18, 10],
        [19, 12],
        [20, 9],
        [21, 6],
        [22, 3],
      ])
      const placedAt = dayStart.getTime() + hour * 60 * MINUTE + random.int(0, 59) * MINUTE
      if (placedAt > now) continue

      const customer = random.weighted(customerWeights)
      const customerAddresses = addresses.filter((a) => a.customerId === customer.id)
      const address = random.pick(customerAddresses)
      const zone = zoneByPincode.get(address.pincode) ?? zones[0]
      const items = pickItems(ctx)
      const paymentMethod = random.weighted<PaymentMethod>([
        ['upi', 62],
        ['card', 24],
        ['cod', 14],
      ])
      const tip = random.chance(0.18) ? random.pick([10, 20, 30]) : 0
      const pricing = computePricing(items, settings, tip)

      const minutesSince = (now - placedAt) / MINUTE
      let status: OrderStatus
      let timeline: OrderTimelineEvent[]
      let delayed = false
      if (isToday && minutesSince < 45) {
        // Fresh orders: simulate the full journey, then keep only the steps that have happened by now.
        const full = buildTimeline(placedAt, 'delivered', random)
        timeline = full.filter((event) => new Date(event.at).getTime() <= now)
        status = timeline[timeline.length - 1]?.status ?? 'placed'
      } else {
        status = random.weighted<OrderStatus>([
          ['delivered', 93],
          ['cancelled', 7],
        ])
        delayed = status === 'delivered' && random.chance(0.11)
        timeline = buildTimeline(placedAt, status, random, delayed)
      }
      const lastEvent = timeline[timeline.length - 1] ?? {
        status: 'placed' as const,
        at: iso(placedAt),
        note: null,
      }
      const promisedMinutes = zone.etaMinutes + 8
      const eta =
        status === 'delivered' || status === 'cancelled'
          ? null
          : iso(placedAt + promisedMinutes * MINUTE)
      const partner =
        status === 'placed' || status === 'preparing' || status === 'cancelled'
          ? null
          : random.pick(partners)

      sequence += 1
      const day = new Date(placedAt)
      const number = `SHL-${String(day.getFullYear()).slice(2)}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}-${String(sequence % 10000).padStart(4, '0')}`
      const id = createId('ord', random)

      const order: Order = {
        id,
        number,
        customerId: customer.id,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        items,
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
        address,
        slot: {
          id: 'slot_express',
          label: `Express · ${zone.etaMinutes}–${zone.etaMinutes + 8} min`,
          start: iso(placedAt),
          end: iso(placedAt + promisedMinutes * MINUTE),
        },
        payment: {
          method: paymentMethod,
          status:
            status === 'cancelled'
              ? paymentMethod === 'cod'
                ? 'pending'
                : random.chance(0.8)
                  ? 'refunded'
                  : 'failed'
              : paymentMethod === 'cod'
                ? status === 'delivered'
                  ? 'paid'
                  : 'pending'
                : 'paid',
          transactionId: paymentMethod === 'cod' ? null : `TXN${random.int(100000000, 999999999)}`,
        },
        status,
        deliveryStatus: deliveryStatusFor(status),
        deliveryPartnerId: partner?.id ?? null,
        pricing,
        timeline,
        eta,
        note: random.chance(0.12)
          ? random.pick([
              'Please ring the bell twice',
              'Leave at the door',
              'Call on arrival',
              'No plastic bags please',
            ])
          : null,
        cancelReason: status === 'cancelled' ? random.pick(cancelReasons) : null,
        placedAt: iso(placedAt),
        updatedAt: lastEvent.at,
        deliveredAt: status === 'delivered' ? lastEvent.at : null,
      }
      orders.push(order)

      if (status !== 'cancelled' && status !== 'placed' && status !== 'preparing') {
        const packedEvent = timeline.find((e) => e.status === 'packed')
        const outEvent = timeline.find((e) => e.status === 'out_for_delivery')
        deliveries.push({
          id: createId('dlv', random),
          orderId: id,
          orderNumber: number,
          customerName: customer.name,
          addressSummary: `${address.line1}, ${zone.name}`,
          zone: zone.name,
          partnerId: partner?.id ?? null,
          partner: partner
            ? { id: partner.id, name: partner.name, phone: partner.phone, vehicle: partner.vehicle }
            : null,
          status: order.deliveryStatus,
          distanceKm: Math.round(random.float(0.8, 4.6) * 10) / 10,
          eta,
          isDelayed: delayed || (status === 'out_for_delivery' && minutesSince > promisedMinutes),
          assignedAt: packedEvent?.at ?? null,
          pickedUpAt: outEvent?.at ?? null,
          deliveredAt: order.deliveredAt,
          createdAt: order.placedAt,
        })
      }
    }
  }

  // Guarantee the demo shopper always has one in-flight order so tracking has something to show.
  const me = customers.find((c) => c.id === currentUserSeed.id)
  const myAddress = addresses.find((a) => a.customerId === currentUserSeed.id && a.isDefault)
  if (me && myAddress) {
    const zone = zoneByPincode.get(myAddress.pincode) ?? zones[0]
    const placedAt = now - 6 * MINUTE
    const items = pickItems(ctx)
    const pricing = computePricing(items, settings, 20)
    const partner = partners[0]!
    const timeline: OrderTimelineEvent[] = [
      { status: 'placed', at: iso(placedAt), note: 'Order confirmed' },
      { status: 'preparing', at: iso(placedAt + 1 * MINUTE), note: 'Picking your items' },
      { status: 'packed', at: iso(placedAt + 3 * MINUTE), note: 'Packed and ready for pickup' },
      { status: 'out_for_delivery', at: iso(placedAt + 5 * MINUTE), note: 'Rider is on the way' },
    ]
    const promisedMinutes = zone.etaMinutes + 8
    sequence += 1
    const id = 'ord_demo_live'
    const number = `SHL-${String(new Date(placedAt).getFullYear()).slice(2)}${String(new Date(placedAt).getMonth() + 1).padStart(2, '0')}${String(new Date(placedAt).getDate()).padStart(2, '0')}-${String(sequence % 10000).padStart(4, '0')}`
    orders.push({
      id,
      number,
      customerId: me.id,
      customer: { id: me.id, name: me.name, phone: me.phone },
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      address: myAddress,
      slot: {
        id: 'slot_express',
        label: `Express · ${zone.etaMinutes}–${promisedMinutes} min`,
        start: iso(placedAt),
        end: iso(placedAt + promisedMinutes * MINUTE),
      },
      payment: { method: 'upi', status: 'paid', transactionId: 'TXN480021337' },
      status: 'out_for_delivery',
      deliveryStatus: 'on_the_way',
      deliveryPartnerId: partner.id,
      pricing,
      timeline,
      eta: iso(placedAt + promisedMinutes * MINUTE),
      note: 'Please ring the bell twice',
      cancelReason: null,
      placedAt: iso(placedAt),
      updatedAt: timeline[timeline.length - 1]!.at,
      deliveredAt: null,
    })
    deliveries.push({
      id: 'dlv_demo_live',
      orderId: id,
      orderNumber: number,
      customerName: me.name,
      addressSummary: `${myAddress.line1}, ${zone.name}`,
      zone: zone.name,
      partnerId: partner.id,
      partner: {
        id: partner.id,
        name: partner.name,
        phone: partner.phone,
        vehicle: partner.vehicle,
      },
      status: 'on_the_way',
      distanceKm: 2.4,
      eta: iso(placedAt + promisedMinutes * MINUTE),
      isDelayed: false,
      assignedAt: timeline.find((e) => e.status === 'packed')?.at ?? null,
      pickedUpAt: timeline.find((e) => e.status === 'out_for_delivery')?.at ?? null,
      deliveredAt: null,
      createdAt: iso(placedAt),
    })
  }

  orders.sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1))
  deliveries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return { orders, deliveries }
}

function tierFor(ordersCount: number, totalSpent: number): CustomerTier {
  if (totalSpent > 25_000 || ordersCount >= 30) return 'vip'
  if (ordersCount >= 12) return 'loyal'
  if (ordersCount >= 3) return 'regular'
  return 'new'
}

export function recomputeCustomerStats(customers: Customer[], orders: Order[]): void {
  const stats = new Map<string, { count: number; spent: number; last: string | null }>()
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    const entry = stats.get(order.customerId) ?? { count: 0, spent: 0, last: null }
    entry.count += 1
    entry.spent = roundMoney(entry.spent + order.pricing.total)
    if (!entry.last || order.placedAt > entry.last) entry.last = order.placedAt
    stats.set(order.customerId, entry)
  }
  for (const customer of customers) {
    const entry = stats.get(customer.id)
    customer.ordersCount = entry?.count ?? 0
    customer.totalSpent = entry?.spent ?? 0
    customer.averageOrderValue =
      entry && entry.count > 0 ? roundMoney(entry.spent / entry.count) : 0
    customer.lastOrderAt = entry?.last ?? null
    customer.tier = tierFor(customer.ordersCount, customer.totalSpent)
  }
}

export function recomputeCategoryCounts(categories: Category[], products: Product[]): void {
  const counts = new Map<string, number>()
  for (const product of products) {
    if (product.status !== 'active') continue
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    counts.set(product.subcategoryId, (counts.get(product.subcategoryId) ?? 0) + 1)
  }
  for (const category of categories) category.productCount = counts.get(category.id) ?? 0
}

function buildInventory(
  products: Product[],
  categories: Category[],
  orders: Order[],
  random: Random,
  now: number,
  settings: StoreSettings,
): { inventory: InventoryItem[]; movements: InventoryMovement[] } {
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const reservedByProduct = new Map<string, number>()
  for (const order of orders) {
    if (order.status === 'delivered' || order.status === 'cancelled') continue
    for (const item of order.items) {
      reservedByProduct.set(
        item.productId,
        (reservedByProduct.get(item.productId) ?? 0) + item.quantity,
      )
    }
  }

  const movements: InventoryMovement[] = []
  const inventory: InventoryItem[] = products.map((product, index) => {
    const seed = productSeeds.find((s) => `prd_${s.key}` === product.id)
    const scenario = random.weighted([
      ['healthy', 74],
      ['low', 18],
      ['out', 8],
    ])
    const reorderLevel =
      product.categoryId === 'cat_fruits-vegetables' || product.categoryId === 'cat_dairy-bread'
        ? 24
        : settings.lowStockThreshold
    const onHand =
      seed?.stock ??
      (scenario === 'out'
        ? 0
        : scenario === 'low'
          ? random.int(1, reorderLevel - 1)
          : random.int(reorderLevel + 5, 220))
    const reserved = Math.min(onHand, reservedByProduct.get(product.id) ?? 0)
    const available = Math.max(0, onHand - reserved)
    product.stock = available
    const lastRestockedAt =
      onHand > 0 ? iso(now - random.int(0, 9) * DAY - random.int(0, 600) * MINUTE) : null

    // A handful of movements per product so the ledger looks lived-in.
    let balance = onHand
    const entries = random.int(2, 5)
    for (let i = 0; i < entries; i++) {
      const type = random.weighted<InventoryMovement['type']>([
        ['sale', 46],
        ['restock', 30],
        ['adjustment', 12],
        ['return', 6],
        ['damage', 6],
      ])
      const magnitude =
        type === 'restock'
          ? random.int(20, 120)
          : type === 'sale'
            ? random.int(1, 9)
            : random.int(1, 6)
      const quantity = type === 'restock' || type === 'return' ? magnitude : -magnitude
      movements.push({
        id: createId('mov', random),
        productId: product.id,
        productName: product.name,
        type,
        quantity,
        balanceAfter: balance,
        reference:
          type === 'sale' && orders.length > 0
            ? random.pick(orders.slice(0, 40)).number
            : type === 'restock'
              ? `PO-${random.int(4100, 4999)}`
              : null,
        note:
          type === 'damage'
            ? random.pick(['Damaged in transit', 'Expired stock removed', 'Packaging torn'])
            : type === 'adjustment'
              ? 'Cycle count correction'
              : null,
        actor:
          type === 'sale'
            ? 'system'
            : random.pick(['Kabir Mehta', 'Ops Bot', 'Rekha S', 'Vinay K']),
        createdAt: iso(now - random.int(0, 30) * DAY - random.int(0, 1200) * MINUTE),
      })
      balance -= quantity
    }

    return {
      productId: product.id,
      sku: `SKU-${String(index + 1).padStart(4, '0')}`,
      productName: product.name,
      productImageUrl: product.imageUrl,
      unit: product.unit,
      categoryId: product.categoryId,
      categoryName: categoryName.get(product.categoryId) ?? '',
      onHand,
      reserved,
      available,
      reorderLevel,
      status:
        available === 0 ? 'out_of_stock' : available <= reorderLevel ? 'low_stock' : 'in_stock',
      lastRestockedAt,
      updatedAt: iso(now - random.int(0, 3) * DAY),
    }
  })

  movements.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return { inventory, movements }
}

function buildLocations(): Location[] {
  return zones.map((zone) => ({
    id: zone.id,
    label: zone.name,
    area: `${zone.areas[0]}, ${zone.name}`,
    city: 'Bengaluru',
    pincode: zone.pincode,
    etaMinutes: zone.etaMinutes,
    isServiceable: true,
  }))
}

function buildPromotions(): Promotion[] {
  return [
    {
      id: 'promo_fresh',
      title: 'Fresh picks, 10-minute delivery',
      subtitle: 'Farm-fresh fruits & vegetables at up to 30% off today.',
      ctaLabel: 'Shop produce',
      href: '/category/fruits-vegetables',
      tint: 'lime',
      imageUrl: imageUrl('hero-fruits'),
      badge: 'Up to 30% off',
    },
    {
      id: 'promo_breakfast',
      title: 'Breakfast, sorted',
      subtitle: 'Milk, bread, eggs and cereal before the kettle boils.',
      ctaLabel: 'Build a breakfast',
      href: '/category/dairy-bread',
      tint: 'butter',
      imageUrl: imageUrl('cat-dairy'),
      badge: 'Morning favourites',
    },
    {
      id: 'promo_staples',
      title: 'Stock the pantry',
      subtitle: 'Atta, rice and dal in family packs with free delivery over ₹299.',
      ctaLabel: 'See staples',
      href: '/category/atta-rice-dal',
      tint: 'peach',
      imageUrl: imageUrl('cat-staples'),
      badge: 'Free delivery',
    },
  ]
}

export function seedDatabase(seed = 20260918, now = Date.now()): MockDatabase {
  const random = new Random(seed)
  const settings: StoreSettings = {
    ...defaultSettings,
    notifications: { ...defaultSettings.notifications },
  }
  const { categories, bySlug } = buildCategories()
  const products = productSeeds.map((s) => buildProduct(s, bySlug, random, now))
  const { customers, addresses } = buildCustomers(random, now)
  const partners = buildPartners(random)
  const { orders, deliveries } = buildOrders({
    random,
    now,
    products,
    customers,
    addresses,
    partners,
    settings,
  })
  const { inventory, movements } = buildInventory(
    products,
    categories,
    orders,
    random,
    now,
    settings,
  )

  recomputeCustomerStats(customers, orders)
  recomputeCategoryCounts(categories, products)

  for (const partner of partners) {
    const active = deliveries.find(
      (d) =>
        d.partnerId === partner.id &&
        (d.status === 'assigned' || d.status === 'picked_up' || d.status === 'on_the_way'),
    )
    partner.availability = active ? 'on_delivery' : random.chance(0.15) ? 'offline' : 'available'
    const todayKey = new Date(now).toDateString()
    partner.deliveriesToday = deliveries.filter(
      (d) => d.partnerId === partner.id && new Date(d.createdAt).toDateString() === todayKey,
    ).length
  }

  return {
    version: SEED_VERSION,
    seededAt: iso(now),
    categories,
    products,
    customers,
    addresses,
    orders,
    inventory,
    movements,
    partners,
    deliveries,
    locations: buildLocations(),
    promotions: buildPromotions(),
    settings,
    currentUserId: currentUserSeed.id,
    adminUser: adminUserSeed,
  }
}

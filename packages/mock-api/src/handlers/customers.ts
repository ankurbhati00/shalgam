import type { Address, AddressInput, CurrentUser, Customer } from '@shalgam/types'
import { http, HttpResponse } from 'msw'

import { getDb, persist } from '../db/store'
import { notFound, orNull, readJson, simulate, validationError } from '../lib/http'
import { getAll, matchesQuery, paginate, parseListParams, sortItems } from '../lib/list'

const TIER_RANK: Record<Customer['tier'], number> = { new: 0, regular: 1, loyal: 2, vip: 3 }

type AddressCreateBody = Pick<
  AddressInput,
  'recipientName' | 'phone' | 'line1' | 'city' | 'pincode'
> &
  Partial<Omit<AddressInput, 'recipientName' | 'phone' | 'line1' | 'city' | 'pincode'>>

function isAddressCreateBody(input: Partial<AddressInput>): input is AddressCreateBody {
  return [input.recipientName, input.phone, input.line1, input.city, input.pincode].every(
    (value) => typeof value === 'string',
  )
}

function validateAddress(input: Partial<AddressInput>): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  if (!input.recipientName?.trim()) errors.recipientName = ['Name is required.']
  if (!/^\+?[\d\s-]{10,15}$/.test(input.phone ?? '')) errors.phone = ['Enter a valid phone number.']
  if (!input.line1?.trim()) errors.line1 = ['Flat / house / building is required.']
  if (!input.city?.trim()) errors.city = ['City is required.']
  if (!/^\d{6}$/.test(input.pincode ?? '')) errors.pincode = ['Enter a 6-digit pincode.']
  else if (!getDb().settings.serviceablePincodes.includes(input.pincode ?? ''))
    errors.pincode = ['We do not deliver to this pincode yet.']
  return errors
}

export const customerHandlers = [
  http.get('*/api/customers', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const url = new URL(request.url)
    const params = parseListParams(url, { sort: 'lastOrderAt' })
    const statuses = getAll(url, 'status')
    const tiers = getAll(url, 'tier')
    const customers = db.customers.filter((c) => {
      if (statuses.length > 0 && !statuses.includes(c.status)) return false
      if (tiers.length > 0 && !tiers.includes(c.tier)) return false
      return matchesQuery(params.q, c.name, c.email, c.phone)
    })
    const sorted = sortItems(customers, params.sort, params.order, {
      name: (c) => c.name,
      ordersCount: (c) => c.ordersCount,
      totalSpent: (c) => c.totalSpent,
      averageOrderValue: (c) => c.averageOrderValue,
      lastOrderAt: (c) => c.lastOrderAt,
      joinedAt: (c) => c.joinedAt,
      tier: (c) => TIER_RANK[c.tier],
      status: (c) => c.status,
    })
    return HttpResponse.json(paginate(sorted, params.page, params.pageSize))
  }),

  http.get<{ id: string }>('*/api/customers/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const customer = getDb().customers.find((c) => c.id === params.id)
    return customer ? HttpResponse.json(customer) : notFound('Customer')
  }),

  http.patch<{ id: string }>('*/api/customers/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const customer = getDb().customers.find((c) => c.id === params.id)
    if (!customer) return notFound('Customer')
    const input = (await readJson<{ status?: Customer['status'] }>(request)) ?? {}
    if (input.status && ['active', 'inactive', 'blocked'].includes(input.status))
      customer.status = input.status
    persist()
    return HttpResponse.json(customer)
  }),

  http.get('*/api/me', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const customer = db.customers.find((c) => c.id === db.currentUserId)
    if (!customer) return notFound('Profile')
    const defaultAddress = db.addresses.find((a) => a.customerId === customer.id && a.isDefault)
    const me: CurrentUser = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      defaultAddressId: defaultAddress?.id ?? null,
    }
    return HttpResponse.json(me)
  }),

  http.get('*/api/addresses', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    return HttpResponse.json(db.addresses.filter((a) => a.customerId === db.currentUserId))
  }),

  http.post('*/api/addresses', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const input = (await readJson<Partial<AddressInput>>(request)) ?? {}
    const errors = validateAddress(input)
    if (Object.keys(errors).length > 0 || !isAddressCreateBody(input))
      return validationError(errors)
    const mine = db.addresses.filter((a) => a.customerId === db.currentUserId)
    const address: Address = {
      id: `adr_${Date.now().toString(36)}`,
      customerId: db.currentUserId,
      label: input.label ?? 'home',
      recipientName: input.recipientName.trim(),
      phone: input.phone.trim(),
      line1: input.line1.trim(),
      line2: orNull(input.line2),
      landmark: orNull(input.landmark),
      city: input.city.trim(),
      state: orNull(input.state) ?? 'Karnataka',
      pincode: input.pincode,
      isDefault: input.isDefault || mine.length === 0,
    }
    if (address.isDefault) for (const a of mine) a.isDefault = false
    db.addresses.push(address)
    persist()
    return HttpResponse.json(address, { status: 201 })
  }),

  http.patch<{ id: string }>('*/api/addresses/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const address = db.addresses.find(
      (a) => a.id === params.id && a.customerId === db.currentUserId,
    )
    if (!address) return notFound('Address')
    const input = (await readJson<Partial<AddressInput>>(request)) ?? {}
    const merged = { ...address, ...input }
    const errors = validateAddress(merged)
    if (Object.keys(errors).length > 0) return validationError(errors)
    Object.assign(address, input, {
      line2: orNull(merged.line2),
      landmark: orNull(merged.landmark),
    })
    if (input.isDefault) {
      for (const a of db.addresses)
        if (a.customerId === db.currentUserId && a.id !== address.id) a.isDefault = false
    }
    persist()
    return HttpResponse.json(address)
  }),

  http.delete<{ id: string }>('*/api/addresses/:id', async ({ request, params }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const address = db.addresses.find(
      (a) => a.id === params.id && a.customerId === db.currentUserId,
    )
    if (!address) return notFound('Address')
    db.addresses = db.addresses.filter((a) => a.id !== address.id)
    if (address.isDefault) {
      const next = db.addresses.find((a) => a.customerId === db.currentUserId)
      if (next) next.isDefault = true
    }
    persist()
    return new HttpResponse(null, { status: 204 })
  }),
]

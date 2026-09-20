import type { StoreSettingsInput } from '@shalgam/types'
import { http, HttpResponse } from 'msw'

import { getDb, persist } from '../db/store'
import { readJson, simulate, validationError } from '../lib/http'

export const settingsHandlers = [
  http.get('*/api/settings', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    return HttpResponse.json(getDb().settings)
  }),

  http.patch('*/api/settings', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    const db = getDb()
    const input = (await readJson<StoreSettingsInput>(request)) ?? {}
    const errors: Record<string, string[]> = {}
    if (input.storeName !== undefined && !input.storeName.trim())
      errors.storeName = ['Store name is required.']
    if (input.supportEmail !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.supportEmail))
      errors.supportEmail = ['Enter a valid email.']
    for (const key of [
      'deliveryFee',
      'freeDeliveryThreshold',
      'handlingFee',
      'minimumOrderValue',
      'lowStockThreshold',
    ] as const) {
      const value = input[key]
      if (value !== undefined && (!Number.isFinite(value) || value < 0))
        errors[key] = ['Must be zero or more.']
    }
    if (Object.keys(errors).length > 0) return validationError(errors)
    db.settings = {
      ...db.settings,
      ...input,
      notifications: { ...db.settings.notifications, ...input.notifications },
    }
    persist()
    return HttpResponse.json(db.settings)
  }),

  http.get('*/api/admin/me', async ({ request }) => {
    const failure = await simulate(request)
    if (failure) return failure
    return HttpResponse.json(getDb().adminUser)
  }),
]

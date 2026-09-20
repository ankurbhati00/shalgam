import type { AdminUser, StoreSettings, StoreSettingsInput } from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createSettingsService(client: ApiClient) {
  return {
    get: (options?: RequestOptions) => client.get<StoreSettings>('/settings', options),
    update: (input: StoreSettingsInput) => client.patch<StoreSettings>('/settings', input),
    adminMe: (options?: RequestOptions) => client.get<AdminUser>('/admin/me', options),
  }
}

export type SettingsService = ReturnType<typeof createSettingsService>

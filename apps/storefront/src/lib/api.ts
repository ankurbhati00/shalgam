import { apiClient } from '@shalgam/api-client'

/** True when the app should boot the MSW mock backend. */
export const USE_MOCK_API = import.meta.env.VITE_API_MOCK !== 'false'

export function configureApi(): void {
  apiClient.configure({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api' })
}

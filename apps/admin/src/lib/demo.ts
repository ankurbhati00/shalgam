import { resetDb } from '@shalgam/mock-api'

/**
 * The one place the admin touches the mock backend directly: the "Reset demo
 * data" action on the Settings page. Everything else goes through the API client.
 */
export function resetDemoData(): void {
  resetDb()
}

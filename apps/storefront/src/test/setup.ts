import '@testing-library/jest-dom/vitest'

import { apiClient } from '@shalgam/api-client'
import { resetDb } from '@shalgam/mock-api'
import { server } from '@shalgam/mock-api/node'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

// Generous async timeouts: the suite runs alongside other workspaces under Turborepo.
configure({ asyncUtilTimeout: 5000 })

beforeAll(() => {
  apiClient.configure({ baseUrl: 'http://localhost/api' })
  server.listen({ onUnhandledRequest: 'error' })
})
beforeEach(() => {
  resetDb({ seed: 42 })
  window.localStorage.clear()
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

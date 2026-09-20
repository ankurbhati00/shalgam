import { setupServer } from 'msw/node'

import { handlers } from './handlers'
import { configureMockApi } from './lib/http'

/** Node/Vitest server sharing the exact handlers the browser uses. Latency is disabled for tests. */
export const server = setupServer(...handlers)

configureMockApi({ latency: 0, errorRate: 0 })

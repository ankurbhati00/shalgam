import '@testing-library/jest-dom/vitest'

import { configure } from '@testing-library/react'

import { apiClient } from '@shalgam/api-client'
import { resetDb } from '@shalgam/mock-api'
import { server } from '@shalgam/mock-api/node'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

// Generous async timeouts: the suite runs alongside other workspaces under Turborepo.
configure({ asyncUtilTimeout: 5000 })

// jsdom lacks a few browser APIs the design system relies on.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
if (typeof window.ResizeObserver !== 'function') {
  class ResizeObserverStub {
    observe() {
      // jsdom performs no layout, so there is nothing to observe.
    }
    unobserve() {
      // no-op
    }
    disconnect() {
      // no-op
    }
  }
  window.ResizeObserver = ResizeObserverStub
}
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {
    // jsdom has no scrolling.
  }
}

beforeAll(() => {
  apiClient.configure({ baseUrl: 'http://localhost/api' })
  server.listen({ onUnhandledRequest: 'error' })
})
beforeEach(() => {
  resetDb({ seed: 42 })
  window.localStorage.clear()
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

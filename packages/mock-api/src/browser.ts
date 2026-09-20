import { FetchInterceptor } from '@mswjs/interceptors/fetch'
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest'
import { setupWorker } from 'msw/browser'
import { defineNetwork, InterceptorSource } from 'msw/experimental'

import { handlers } from './handlers'
import { configureMockApi, type MockConfig } from './lib/http'

type SourceInterceptors = ConstructorParameters<typeof InterceptorSource>[0]['interceptors']

export const worker = setupWorker(...handlers)

export interface StartMockApiOptions extends Partial<MockConfig> {
  /** Path to the service worker script; apps copy `mockServiceWorker.js` into `public/`. */
  serviceWorkerUrl?: string
  quiet?: boolean
}

/**
 * Service workers only register in secure contexts (https or localhost). A phone
 * opening the dev server over plain http on the LAN (`http://192.168.x.x:5173`)
 * has none, so the same handlers then run inside the page instead.
 */
function canUseServiceWorker() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.isSecureContext
}

/**
 * Boots the mock REST API in the browser. Apps call this once before rendering
 * when they run against the mock backend; a real backend simply skips this call.
 * Returns the service worker instance, or `null` when requests are intercepted in-page.
 */
export async function startMockApi({
  serviceWorkerUrl = '/mockServiceWorker.js',
  quiet = true,
  ...config
}: StartMockApiOptions = {}) {
  configureMockApi(config)
  if (!canUseServiceWorker()) {
    // Same handlers and database as the worker; only the transport differs. The cast mirrors
    // MSW's own `msw/native` entry, which composes these two interceptors untyped: the
    // source's union event map rejects the concrete classes even though they are supported.
    const interceptors = [
      new FetchInterceptor(),
      new XMLHttpRequestInterceptor(),
    ] as unknown as SourceInterceptors
    const network = defineNetwork({
      sources: [new InterceptorSource({ interceptors })],
      handlers,
      onUnhandledFrame: 'bypass',
      context: { quiet },
    })
    network.enable()
    if (!quiet) console.info('[mock-api] No service worker in this context; intercepting in-page.')
    return null
  }
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet,
    serviceWorker: { url: serviceWorkerUrl },
  })
  return worker
}

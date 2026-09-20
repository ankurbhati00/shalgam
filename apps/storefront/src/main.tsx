import './styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { configureApi, USE_MOCK_API } from './lib/api'

async function bootstrap() {
  configureApi()
  if (USE_MOCK_API) {
    // The mock backend is a dev/demo concern: it is loaded lazily and never
    // imported by feature code, so removing it is a one-line change.
    const { startMockApi } = await import('@shalgam/mock-api/browser')
    await startMockApi()
  }
  // The router starts its first navigation (and loader prefetches) the moment it is
  // created, so the app module is loaded only once the API layer is ready.
  const { App } = await import('./app/app')
  const container = document.getElementById('root')
  if (!container) throw new Error('Root element #root not found')
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap().catch((error: unknown) => {
  console.error('Shalgam failed to start', error)
})

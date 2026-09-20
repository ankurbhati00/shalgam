import './styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'
import { applyTheme, useUiStore } from './app/store/ui-store'
import { configureApi, USE_MOCK_API } from './lib/api'

async function bootstrap() {
  configureApi()
  // Theme lives in the UI store; mirror it onto <html data-theme> now and on every change.
  applyTheme(useUiStore.getState().theme)
  useUiStore.subscribe((state, previous) => {
    if (state.theme !== previous.theme) applyTheme(state.theme)
  })
  if (USE_MOCK_API) {
    // The mock backend is a dev/demo concern: it is loaded lazily and never
    // imported by feature code, so removing it is a one-line change.
    const { startMockApi } = await import('@shalgam/mock-api/browser')
    await startMockApi()
  }
  const container = document.getElementById('root')
  if (!container) throw new Error('Root element #root not found')
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()

import { ToastProvider, TooltipProvider, useMediaQuery } from '@shalgam/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router/dom'

import { queryClient } from '../lib/query-client'
import { router } from './router'

/** Dev-only; hidden below `md`, where its floating button would cover the tab bar. */
function QueryDevtools() {
  const wide = useMediaQuery('(min-width: 768px)')
  return wide ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> : null
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={400}>
        {/* Toasts sit above the phone tab bar instead of behind it. */}
        <ToastProvider viewportClassName="max-md:bottom-[calc(var(--bottom-nav-height)+1rem)]">
          <RouterProvider router={router} />
        </ToastProvider>
      </TooltipProvider>
      {import.meta.env.DEV && <QueryDevtools />}
    </QueryClientProvider>
  )
}

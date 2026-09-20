import { ToastProvider, TooltipProvider } from '@shalgam/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router/dom'

import { queryClient } from '../lib/query-client'
import { router } from './router'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={400}>
        {/* Toasts sit above the phone tab bar instead of behind it. */}
        <ToastProvider viewportClassName="max-md:bottom-[calc(var(--bottom-nav-height)+1rem)]">
          <RouterProvider router={router} />
        </ToastProvider>
      </TooltipProvider>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}

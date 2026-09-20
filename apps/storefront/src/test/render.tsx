import { createQueryClient } from '@shalgam/query'
import { ToastProvider, TooltipProvider } from '@shalgam/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Initial URL for the memory router. */
  route?: string
  /** Extra routes so links inside the component resolve. */
  routes?: RouteObject[]
}

/** Renders with the same providers as the app, a fresh QueryClient and a memory router. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', routes = [], ...options }: Options = {},
) {
  const queryClient = createQueryClient({ queries: { retry: false, staleTime: 0 } })
  const router = createMemoryRouter([{ path: '*', element: ui }, ...routes], {
    initialEntries: [route],
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={0}>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
      </QueryClientProvider>
    )
  }
  const result = render(<RouterProvider router={router} />, { wrapper: Wrapper, ...options })
  return { ...result, queryClient, router }
}

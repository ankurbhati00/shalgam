import { createBrowserRouter } from 'react-router'

import { AppSkeleton } from './layouts/app-skeleton'
import { RootLayout } from './layouts/root-layout'
import { RouteErrorBoundary } from './layouts/route-error-boundary'

/**
 * Route-level code splitting: every page is a lazy module. Data is owned by
 * TanStack Query; loaders only warm the cache so navigation feels instant.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback: AppSkeleton,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        index: true,
        lazy: () => import('../features/catalog/pages/home-page').then((m) => m.route),
      },
      {
        path: 'category/:slug',
        lazy: () => import('../features/catalog/pages/category-page').then((m) => m.route),
      },
      {
        path: 'search',
        lazy: () => import('../features/catalog/pages/search-page').then((m) => m.route),
      },
      {
        path: 'product/:slug',
        lazy: () => import('../features/catalog/pages/product-page').then((m) => m.route),
      },
      { path: 'cart', lazy: () => import('../features/cart/pages/cart-page').then((m) => m.route) },
      {
        path: 'checkout',
        lazy: () => import('../features/checkout/pages/checkout-page').then((m) => m.route),
      },
      {
        path: 'orders/:id/confirmation',
        lazy: () =>
          import('../features/checkout/pages/order-confirmation-page').then((m) => m.route),
      },
      {
        path: 'orders',
        lazy: () => import('../features/orders/pages/orders-page').then((m) => m.route),
      },
      {
        path: 'orders/:id',
        lazy: () => import('../features/orders/pages/order-detail-page').then((m) => m.route),
      },
      {
        path: 'profile',
        lazy: () => import('../features/profile/pages/profile-page').then((m) => m.route),
      },
      { path: '*', lazy: () => import('./layouts/not-found-page').then((m) => m.route) },
    ],
  },
])

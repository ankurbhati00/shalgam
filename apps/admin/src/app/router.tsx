import { createBrowserRouter } from 'react-router'

import { NotFoundPage } from './layouts/not-found-page'
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
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        index: true,
        lazy: () => import('../features/dashboard/pages/dashboard-page').then((m) => m.route),
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
        path: 'products',
        lazy: () => import('../features/products/pages/products-page').then((m) => m.route),
      },
      {
        path: 'products/new',
        lazy: () => import('../features/products/pages/product-create-page').then((m) => m.route),
      },
      {
        path: 'products/:id/edit',
        lazy: () => import('../features/products/pages/product-edit-page').then((m) => m.route),
      },
      {
        path: 'categories',
        lazy: () => import('../features/categories/pages/categories-page').then((m) => m.route),
      },
      {
        path: 'inventory',
        lazy: () => import('../features/inventory/pages/inventory-page').then((m) => m.route),
      },
      {
        path: 'customers',
        lazy: () => import('../features/customers/pages/customers-page').then((m) => m.route),
      },
      {
        path: 'customers/:id',
        lazy: () => import('../features/customers/pages/customer-detail-page').then((m) => m.route),
      },
      {
        path: 'delivery',
        lazy: () => import('../features/delivery/pages/delivery-page').then((m) => m.route),
      },
      {
        path: 'analytics',
        lazy: () => import('../features/analytics/pages/analytics-page').then((m) => m.route),
      },
      {
        path: 'reports',
        lazy: () => import('../features/reports/pages/reports-page').then((m) => m.route),
      },
      {
        path: 'settings',
        lazy: () => import('../features/settings/pages/settings-page').then((m) => m.route),
      },
      { path: '*', Component: NotFoundPage, handle: { title: 'Not found' } },
    ],
  },
])

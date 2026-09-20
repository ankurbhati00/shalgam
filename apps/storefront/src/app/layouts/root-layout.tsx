import { Outlet, ScrollRestoration } from 'react-router'

import { CartDrawer } from '../../features/cart/components/cart-drawer'
import { AppFooter } from '../shell/app-footer'
import { AppHeader } from '../shell/app-header'
import { NavigationProgress } from '../shell/navigation-progress'
import { StorefrontBottomNav } from '../shell/bottom-nav'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to content
      </a>
      <NavigationProgress />
      <AppHeader />
      <main
        id="main"
        className="flex-1 pb-[calc(var(--bottom-nav-height)+1.5rem+env(safe-area-inset-bottom,0px))] md:pb-10"
      >
        <Outlet />
      </main>
      <AppFooter />
      <StorefrontBottomNav />
      <CartDrawer />
      <ScrollRestoration />
    </div>
  )
}

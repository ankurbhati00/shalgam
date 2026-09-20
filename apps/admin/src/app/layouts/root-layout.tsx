import { cn } from '@shalgam/ui'
import { Outlet, ScrollRestoration } from 'react-router'

import { AppNavbar } from '../shell/app-navbar'
import { AppSidebar } from '../shell/app-sidebar'
import { MobileNav } from '../shell/mobile-nav'
import { useUiStore } from '../store/ui-store'

export function RootLayout() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  return (
    <div className="flex min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to content
      </a>
      <div
        className={cn('sticky top-0 hidden h-dvh shrink-0 lg:block', collapsed ? 'w-16' : 'w-64')}
      >
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar />
        <main id="main" className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <ScrollRestoration />
    </div>
  )
}

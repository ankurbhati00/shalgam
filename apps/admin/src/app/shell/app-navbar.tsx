import { Breadcrumb, type BreadcrumbItem, IconButton, Navbar, SearchInput } from '@shalgam/ui'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { useRouteHandle } from '../route-handle'
import { useUiStore } from '../store/ui-store'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

function GlobalSearch() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  return (
    <SearchInput
      value={value}
      onValueChange={setValue}
      size="sm"
      aria-label="Search orders"
      placeholder="Search orders…"
      className="w-56 xl:w-72"
      onSearch={(query) => {
        const q = query.trim()
        void navigate(q ? `/orders?q=${encodeURIComponent(q)}` : '/orders')
        setValue('')
      }}
    />
  )
}

export function AppNavbar() {
  const handle = useRouteHandle()
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen)
  const items: BreadcrumbItem[] = [{ label: 'Dashboard', render: <Link to="/" /> }]
  if (handle?.parent)
    items.push({ label: handle.parent.label, render: <Link to={handle.parent.to} /> })
  if (handle && handle.title !== 'Dashboard') items.push({ label: handle.title })

  return (
    <Navbar
      tone="neutral"
      className="[&>div]:max-w-[96rem]"
      start={
        <>
          <IconButton
            aria-label="Open navigation"
            icon={<Menu />}
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          />
          <Logo compact className="lg:hidden" />
          <Breadcrumb items={items} homeIcon className="hidden sm:block" />
        </>
      }
      end={
        <>
          <div className="hidden md:block">
            <GlobalSearch />
          </div>
          <ThemeToggle />
          <UserMenu />
        </>
      }
    />
  )
}

import {
  Bike,
  ChartColumn,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Tags,
  UsersRound,
  Warehouse,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  /** Match only the exact path (the dashboard). */
  end?: boolean
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  { label: 'Overview', items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }] },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', to: '/orders', icon: ClipboardList },
      { label: 'Delivery', to: '/delivery', icon: Bike },
      { label: 'Customers', to: '/customers', icon: UsersRound },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', to: '/products', icon: Package },
      { label: 'Categories', to: '/categories', icon: Tags },
      { label: 'Inventory', to: '/inventory', icon: Warehouse },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', to: '/analytics', icon: ChartColumn },
      { label: 'Reports', to: '/reports', icon: FileText },
    ],
  },
]

export const SETTINGS_ITEM: NavItem = { label: 'Settings', to: '/settings', icon: Settings }

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

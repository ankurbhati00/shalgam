import {
  IconButton,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
} from '@shalgam/ui'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { useUiStore } from '../store/ui-store'
import { Logo } from './logo'
import { isNavItemActive, NAV_SECTIONS, SETTINGS_ITEM } from './nav-items'

interface AppSidebarProps {
  /** Rendered inside the mobile drawer: never collapsed, closes on navigation. */
  inDrawer?: boolean
  onNavigate?: () => void
}

export function AppSidebar({ inDrawer = false, onNavigate }: AppSidebarProps) {
  const { pathname } = useLocation()
  const collapsedPreference = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const collapsed = inDrawer ? false : collapsedPreference

  return (
    <Sidebar
      collapsed={collapsed}
      aria-label="Primary"
      className={inDrawer ? 'w-full border-r-0' : undefined}
    >
      <SidebarHeader className="justify-between">
        <Logo compact={collapsed} />
        {!collapsed && !inDrawer && (
          <IconButton
            aria-label="Collapse sidebar"
            icon={<PanelLeftClose />}
            size="sm"
            variant="ghost"
            onClick={toggleSidebar}
          />
        )}
      </SidebarHeader>
      <SidebarNav>
        {NAV_SECTIONS.map((section) => (
          <SidebarSection key={section.label} label={section.label}>
            {section.items.map((item) => (
              <SidebarItem
                key={item.to}
                label={item.label}
                icon={<item.icon />}
                active={isNavItemActive(item, pathname)}
                render={<Link to={item.to} />}
                onClick={onNavigate}
              />
            ))}
          </SidebarSection>
        ))}
      </SidebarNav>
      <SidebarFooter>
        <ul className="flex flex-col gap-0.5">
          <SidebarItem
            label={SETTINGS_ITEM.label}
            icon={<SETTINGS_ITEM.icon />}
            active={isNavItemActive(SETTINGS_ITEM, pathname)}
            render={<Link to={SETTINGS_ITEM.to} />}
            onClick={onNavigate}
          />
        </ul>
        {collapsed && (
          <div className="mt-1 flex justify-center">
            <IconButton
              aria-label="Expand sidebar"
              icon={<PanelLeftOpen />}
              size="sm"
              variant="ghost"
              onClick={toggleSidebar}
            />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

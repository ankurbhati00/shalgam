import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Boxes,
  ClipboardList,
  House,
  LayoutDashboard,
  Package,
  Search,
  ShoppingCart,
  Truck,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '../avatar'
import { BottomNavigation, BottomNavigationItem } from '../bottom-navigation'
import { Breadcrumb } from '../breadcrumb'
import { Button, IconButton } from '../button'
import { Navbar } from '../navbar'
import { PageSizeSelect, Pagination } from '../pagination'
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
} from '../sidebar'
import { Switch } from '../switch'
import { TooltipProvider } from '../tooltip'
import { PillTab, Tab, TabPanel, Tabs, TabsList } from './tabs'

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const LineTabs: Story = {
  render: () => (
    <Tabs defaultValue="all">
      <TabsList aria-label="Order status">
        <Tab value="all" badge={128}>
          All
        </Tab>
        <Tab value="active" badge={9}>
          Active
        </Tab>
        <Tab value="delivered">Delivered</Tab>
        <Tab value="cancelled" disabled>
          Cancelled
        </Tab>
      </TabsList>
      <TabPanel value="all" className="text-sm text-text-muted">
        All orders.
      </TabPanel>
      <TabPanel value="active" className="text-sm text-text-muted">
        Active orders.
      </TabPanel>
      <TabPanel value="delivered" className="text-sm text-text-muted">
        Delivered orders.
      </TabPanel>
    </Tabs>
  ),
}

export const PillTabs: Story = {
  render: () => (
    <Tabs defaultValue="7d">
      <TabsList variant="pills" aria-label="Date range">
        <PillTab value="24h">24h</PillTab>
        <PillTab value="7d">7 days</PillTab>
        <PillTab value="30d">30 days</PillTab>
        <PillTab value="90d">90 days</PillTab>
      </TabsList>
    </Tabs>
  ),
}

export const BreadcrumbStory: Story = {
  name: 'Breadcrumb',
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '#' },
        { label: 'Products', href: '#' },
        { label: 'Dairy & Bread', href: '#' },
        { label: 'Gokul Fresh Paneer 200 g' },
      ]}
    />
  ),
}

function PaginationDemo() {
  const [page, setPage] = useState(3)
  const [size, setSize] = useState(20)
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <PageSizeSelect pageSize={size} onPageSizeChange={setSize} />
      <Pagination page={page} totalPages={24} onPageChange={setPage} />
    </div>
  )
}

export const PaginationStory: Story = { name: 'Pagination', render: () => <PaginationDemo /> }

export const NavbarStory: Story = {
  name: 'Navbar',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="space-y-6">
      <Navbar
        tone="brand"
        sticky={false}
        start={<span className="text-lg font-bold">Shalgam</span>}
        center={
          <Button
            variant="outline"
            className="w-full max-w-xl justify-start bg-surface"
            leadingIcon={<Search />}
          >
            Search for milk, atta, bananas…
          </Button>
        }
        end={
          <>
            <IconButton
              aria-label="Account"
              icon={<User />}
              variant="ghost"
              className="text-primary-foreground"
            />
            <Button variant="secondary" leadingIcon={<ShoppingCart />}>
              ₹486
            </Button>
          </>
        }
      />
      <Navbar
        sticky={false}
        start={
          <Breadcrumb items={[{ label: 'Orders', href: '#' }, { label: 'SHL-260918-0042' }]} />
        }
        end={<Avatar name="Kabir Mehta" size="sm" />}
      />
    </div>
  ),
}

function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <TooltipProvider>
      <div className="flex h-[480px] overflow-hidden rounded-xl border border-border">
        <Sidebar collapsed={collapsed}>
          <SidebarHeader>
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
              S
            </span>
            {!collapsed && <span className="font-semibold">Shalgam Admin</span>}
          </SidebarHeader>
          <SidebarNav>
            <SidebarSection>
              <SidebarItem label="Dashboard" icon={<LayoutDashboard />} active href="#" />
              <SidebarItem label="Orders" icon={<ClipboardList />} badge={12} href="#" />
            </SidebarSection>
            <SidebarSection label="Catalogue">
              <SidebarItem label="Products" icon={<Package />} href="#" />
              <SidebarItem label="Inventory" icon={<Boxes />} badge="3 low" href="#" />
            </SidebarSection>
            <SidebarSection label="Operations">
              <SidebarItem label="Customers" icon={<Users />} href="#" />
              <SidebarItem label="Delivery" icon={<Truck />} href="#" />
            </SidebarSection>
          </SidebarNav>
          <SidebarFooter>
            <Switch
              size="sm"
              label={collapsed ? undefined : 'Collapse'}
              aria-label="Collapse sidebar"
              checked={collapsed}
              onCheckedChange={setCollapsed}
            />
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 bg-background p-6 text-sm text-text-muted">Page content</div>
      </div>
    </TooltipProvider>
  )
}

/** On phones the search drops into the secondary row and account links move to the bottom navigation. */
export const NavbarPhone: Story = {
  name: 'Navbar on a phone',
  globals: { viewport: { value: 'phone', isRotated: false } },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Navbar
      tone="brand"
      sticky={false}
      start={
        <>
          <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-neutral-950 text-lg font-bold text-primary">
            S
          </span>
          <span className="flex min-h-11 flex-col justify-center text-primary-foreground">
            <span className="text-sm leading-tight font-bold">Delivery in 12 min</span>
            <span className="text-xs leading-tight opacity-80">Indiranagar</span>
          </span>
        </>
      }
      end={<IconButton aria-label="Cart, 3 items" icon={<ShoppingCart />} variant="secondary" />}
      secondary={
        <div className="pb-3">
          <Button
            variant="outline"
            className="h-11 w-full justify-start rounded-full bg-surface"
            leadingIcon={<Search />}
          >
            Search for milk, atta, bananas…
          </Button>
        </div>
      }
    />
  ),
}

export const SidebarStory: Story = { name: 'Sidebar', render: () => <SidebarDemo /> }

export const BottomNavigationStory: Story = {
  name: 'BottomNavigation',
  globals: { viewport: { value: 'phone', isRotated: false } },
  render: () => (
    <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl border border-border">
      <BottomNavigation className="absolute md:grid">
        <BottomNavigationItem label="Home" icon={<House />} active href="#" />
        <BottomNavigationItem label="Search" icon={<Search />} href="#" />
        <BottomNavigationItem label="Cart" icon={<ShoppingCart />} badge={3} href="#" />
        <BottomNavigationItem label="Orders" icon={<ClipboardList />} href="#" />
        <BottomNavigationItem label="Profile" icon={<User />} href="#" />
      </BottomNavigation>
    </div>
  ),
}

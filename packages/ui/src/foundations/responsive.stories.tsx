import type { Meta, StoryObj } from '@storybook/react-vite'
import { breakpoints } from '@shalgam/tokens'
import { Filter, House, Search, ShoppingCart, User } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'

import { BottomNavigation, BottomNavigationItem } from '../components/bottom-navigation'
import { Button, IconButton } from '../components/button'
import { Checkbox } from '../components/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/dialog'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/drawer'
import { Input } from '../components/input'
import { Price } from '../components/price'
import { QuantitySelector } from '../components/quantity-selector'
import { Select } from '../components/select'
import { Text } from '../components/text'

const meta = {
  title: 'Foundations/Responsive',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function ViewportReadout() {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 0,
  )
  const active = (Object.entries(breakpoints) as Array<[string, number]>)
    .filter(([, min]) => width >= min)
    .map(([name]) => name)
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
      Preview width <span className="font-semibold tabular">{width}px</span> · active breakpoints:{' '}
      <span className="font-semibold">{active.length ? active.join(', ') : 'none (base)'}</span>
    </div>
  )
}

const BREAKPOINT_ROWS: Array<[keyof typeof breakpoints, string, string]> = [
  [
    'sm',
    'Large phones, small tablets',
    'Product-card price and Add sit side by side; 3-column grids; dialogs centre instead of rising as sheets.',
  ],
  [
    'md',
    'Tablets',
    'Search moves into the header bar, the bottom navigation and phone-only sticky bars disappear, the footer appears, page padding grows.',
  ],
  [
    'lg',
    'Laptops',
    'Filter sidebar replaces the filter sheet; cart, checkout and order pages become two columns with a sticky summary.',
  ],
  ['xl', 'Desktops', '5-column product grid; content column caps at 80rem.'],
  ['2xl', 'Wide desktops', 'No further layout changes; content stays centred.'],
]

export const Breakpoints: Story = {
  render: () => (
    <div className="space-y-4">
      <ViewportReadout />
      <p className="max-w-prose text-sm text-text-muted">
        Shalgam uses Tailwind&apos;s default scale, mirrored in <code>breakpoints</code> from{' '}
        <code>@shalgam/tokens</code> so JavaScript media queries agree with CSS. Styles are written
        mobile-first: the base rule is the phone layout and each prefix adds an enhancement.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-text-muted uppercase">
            <th className="py-2 pr-4">Prefix</th>
            <th className="py-2 pr-4">Min width</th>
            <th className="py-2 pr-4">Devices</th>
            <th className="py-2">What changes in the storefront</th>
          </tr>
        </thead>
        <tbody>
          {BREAKPOINT_ROWS.map(([name, devices, changes]) => (
            <tr key={name} className="border-b border-border-subtle align-top">
              <td className="py-2 pr-4 font-mono font-semibold">{name}:</td>
              <td className="py-2 pr-4 tabular">{breakpoints[name]}px</td>
              <td className="py-2 pr-4 text-text-muted">{devices}</td>
              <td className="py-2 text-text-muted">{changes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}

const TARGET_ROWS: Array<[string, string, string]> = [
  ['Button xs / sm', '28 / 32px', '36 / 40px'],
  ['IconButton xs / sm / md', '28 / 32 / 40px', '36 / 40 / 44px'],
  ['QuantitySelector sm / md', '32 / 40px', '40 / 44px'],
  ['Input, Select, SearchInput sm', '32px', '40px'],
  ['PillTab', '32px', '40px'],
  ['Checkbox, Radio, Switch rows', 'text height', '+20px vertical padding'],
  ['Slider thumb / track hit area', '20px / 22px', '24px / 44px'],
  ['Breadcrumb links', 'text height', '40px'],
]

function TouchTargetDemo() {
  const [quantity, setQuantity] = useState(1)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="outline">
        Filters (2)
      </Button>
      <IconButton size="sm" variant="outline" aria-label="Search" icon={<Search />} />
      <QuantitySelector size="sm" value={quantity} onChange={setQuantity} label="Paneer" />
      <Select
        size="sm"
        aria-label="Sort"
        className="w-40"
        defaultValue="relevance"
        options={[
          { value: 'relevance', label: 'Relevance' },
          { value: 'price', label: 'Price: low to high' },
        ]}
      />
      <Input size="sm" placeholder="Pincode" className="w-32" />
      <Checkbox label="In stock only" defaultChecked />
    </div>
  )
}

export const TouchTargets: Story = {
  name: 'Touch targets',
  render: () => (
    <div className="space-y-4">
      <p className="max-w-prose text-sm text-text-muted">
        Compact control sizes are tuned for a mouse. On touch screens, detected with the{' '}
        <code>pointer: coarse</code> media query (Tailwind&apos;s <code>pointer-coarse:</code>{' '}
        variant), the same components grow to a 40–44px hit area without any prop changes, so the
        apps never fork their markup by device. Primary actions use <code>size=&quot;lg&quot;</code>{' '}
        (48px) everywhere.
      </p>
      <TouchTargetDemo />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-text-muted uppercase">
            <th className="py-2 pr-4">Control</th>
            <th className="py-2 pr-4">Fine pointer</th>
            <th className="py-2">Coarse pointer</th>
          </tr>
        </thead>
        <tbody>
          {TARGET_ROWS.map(([control, fine, coarse]) => (
            <tr key={control} className="border-b border-border-subtle">
              <td className="py-2 pr-4 font-medium">{control}</td>
              <td className="py-2 pr-4 text-text-muted tabular">{fine}</td>
              <td className="py-2 text-text-muted tabular">{coarse}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-text-subtle">
        Storybook&apos;s viewport toolbar resizes the preview but does not emulate a touch pointer;
        open the browser devtools device mode (or a real phone) to see the larger sizes.
      </p>
    </div>
  ),
}

export const OverlayPatterns: Story = {
  name: 'Overlays on phones',
  globals: { viewport: { value: 'phone', isRotated: false } },
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Below <code>sm</code> a Dialog rises as a bottom sheet and a right-hand Drawer takes the
        full width; from <code>sm</code> up they centre and dock respectively. Filters and location
        pickers use <code>side=&quot;bottom&quot;</code> drawers on every size. Focus trapping,
        scroll locking and Escape come from Base UI in both forms.
      </p>
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Edit address</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit address</DialogTitle>
              <DialogDescription>Rises from the bottom on phones.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-3">
              <Input placeholder="Flat, house no., building" />
              <Input placeholder="Landmark" />
            </DialogBody>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Drawer>
          <DrawerTrigger render={<Button variant="outline" leadingIcon={<Filter />} />}>
            Filters
          </DrawerTrigger>
          <DrawerContent side="bottom">
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="space-y-2">
              <Checkbox label="On offer" />
              <Checkbox label="Bestsellers" />
              <Checkbox label="Organic" />
            </DrawerBody>
            <DrawerFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Clear
              </Button>
              <Button className="flex-1">Show 24 products</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  ),
}

export const StickyActionBar: Story = {
  name: 'Sticky action bar',
  globals: { viewport: { value: 'phone', isRotated: false } },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="relative h-[28rem] overflow-y-auto bg-background">
      <div className="space-y-3 p-4 pb-24">
        <Text size="sm" tone="muted">
          Long pages keep their primary action within thumb reach: the bar is{' '}
          <code>position: sticky</code>, so it occupies its own space in the flow, never covers
          content, and floats above the bottom navigation. On <code>lg</code> and up the action
          moves into a sticky side column instead.
        </Text>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-16 rounded-lg border border-border bg-surface" />
        ))}
        <div className="sticky bottom-[4.25rem] z-30 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur">
          <div>
            <Text as="p" size="xs" tone="muted">
              To pay
            </Text>
            <Price amount={178} size="lg" />
          </div>
          <Button size="lg">Checkout</Button>
        </div>
      </div>
      <BottomNavigation className="absolute md:grid">
        <BottomNavigationItem label="Home" icon={<House />} href="#" />
        <BottomNavigationItem label="Search" icon={<Search />} href="#" />
        <BottomNavigationItem label="Cart" icon={<ShoppingCart />} badge={3} active href="#" />
        <BottomNavigationItem label="Profile" icon={<User />} href="#" />
      </BottomNavigation>
    </div>
  ),
}
